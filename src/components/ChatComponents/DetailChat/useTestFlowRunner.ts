import { t } from 'i18next'
import { useEffect, useRef, useState } from 'react'

import {
  DoneLlmEventDetail,
  TestFlowQueueItem,
  TestFlowQueueState,
  TestScenario,
} from './testAiTypes'

type UseTestFlowRunnerParams = {
  is_test_ai_ui: boolean
  ai_status: boolean | undefined
  typing_status: boolean | undefined
  active_test_client_id: string
  page_id: string
  loading: boolean
  send_message: (question: string) => Promise<any>
  selected_test_scenario: TestScenario | null
  is_loading_test_scenario_detail: boolean
}

/** Thời gian chờ tối thiểu khi chạy test AI (5 giây) */
const MIN_TEST_WAIT_MS = 5000
/** Thời gian chờ tối đa khi chạy test AI (10 giây) */
const MAX_TEST_WAIT_MS = 10000
/** Thời gian chờ AI phản hồi tối đa (60 giây) trước khi timeout */
const AI_RESPONSE_TIMEOUT_MS = 60000
/** Tên event done_llm được phát từ tầng socket cho giao diện test-ai-ui */
const DONE_LLM_EVENT_NAME = 'done_llm'
/** Thời gian chờ 1 giây trước khi tự gửi câu hỏi tiếp theo */
const NEXT_TEST_QUESTION_DELAY_MS = 1000

/**
 * Điều phối luồng chạy scenario cho cả test-ai và test-ai-ui
 */
function useTestFlowRunner({
  is_test_ai_ui,
  ai_status,
  typing_status,
  active_test_client_id,
  page_id,
  loading,
  send_message,
  selected_test_scenario,
  is_loading_test_scenario_detail,
}: UseTestFlowRunnerParams) {
  /** Trạng thái xác định xem luồng kiểm thử tự động có đang chạy hay không */
  const [is_running_test_flow, setIsRunningTestFlow] = useState(false)

  /** Dùng ref để lưu giữ trạng thái typing mới nhất từ Socket */
  const typing_status_ref = useRef(typing_status)
  /** Ghi nhớ xem AI đã thực sự bắt đầu chu kỳ typing chưa */
  const has_seen_typing_on_ref = useRef(false)
  /** Hàm resolver để nhả Promise chờ AI gõ xong */
  const wait_for_typing_off_resolver_ref = useRef<(() => void) | null>(null)
  /** ID của timer an toàn để tránh treo Promise khi socket mất hub */
  const wait_for_typing_off_timeout_ref = useRef<number | null>(null)
  /** Lưu hàng đợi đang chạy cho giao diện test-ai-ui */
  const running_test_flow_queue_ref = useRef<TestFlowQueueState | null>(null)
  /** Lưu danh sách kịch bản chờ chạy khi iframe chưa sẵn sàng */
  const pending_test_flow_ref = useRef<TestScenario[] | null>(null)
  /** Timer delay 1 giây trước khi gửi câu tiếp theo */
  const next_test_question_timeout_ref = useRef<number | null>(null)
  /** Đồng bộ loading mới nhất vào ref để tránh closure cũ trong timer */
  const loading_ref = useRef(loading)
  /** Đồng bộ client_id thực tế mới nhất vào ref để tránh closure cũ trong timer */
  const active_test_client_id_ref = useRef(active_test_client_id)

  /** Đồng bộ lại trạng thái loading hiện tại */
  useEffect(() => {
    loading_ref.current = loading
  }, [loading])

  /** Đồng bộ lại client_id thực tế hiện tại */
  useEffect(() => {
    active_test_client_id_ref.current = active_test_client_id
  }, [active_test_client_id])

  /** Xóa timer chờ gửi câu hỏi tiếp theo */
  const CLEAR_NEXT_TEST_QUESTION_TIMEOUT = () => {
    if (next_test_question_timeout_ref.current) {
      window.clearTimeout(next_test_question_timeout_ref.current)
      next_test_question_timeout_ref.current = null
    }
  }

  /** Gửi tín hiệu hoàn tất scenario lên app cha đang nhúng iframe */
  const POST_DONE_SCENARIOS_TO_PARENT = () => {
    console.log('[test-ai-ui] postMessage to parent: Done_scenerios')
    window.parent.postMessage(
      {
        from: 'BBH-EMBED-IFRAME',
        type: 'DONE_SCENERIOS',
        event: 'DONE_SCENERIOS',
        name: 'DONE_SCENERIOS',
      },
      '*'
    )
  }

  /**
   * Chuyển danh sách kịch bản thành một hàng đợi câu hỏi tuyến tính
   * @param {TestScenario[]} scenarios - Danh sách kịch bản cần chạy
   * @returns {TestFlowQueueItem[]} - Hàng đợi câu hỏi
   */
  const BUILD_TEST_FLOW_QUEUE_ITEMS = (
    scenarios: TestScenario[]
  ): TestFlowQueueItem[] => {
    const queue_items = scenarios.flatMap((scenario) =>
      (scenario.questions || [])
        .filter((question) => typeof question === 'string')
        .map((question) => question.trim())
        .filter(Boolean)
        .map((question) => ({
          scenario_id: scenario.id,
          scenario_title: scenario.title,
          question,
        }))
    )

    console.log('[test-ai-ui] build queue items', {
      scenario_count: scenarios.length,
      queue_count: queue_items.length,
      queue_items,
    })
    return queue_items
  }

  /** Kết thúc phiên chạy test-ai-ui và gửi thông báo hoàn tất cho app cha */
  const FINISH_TEST_AI_UI_FLOW = () => {
    console.log('[test-ai-ui] finish flow')
    CLEAR_NEXT_TEST_QUESTION_TIMEOUT()
    running_test_flow_queue_ref.current = null
    pending_test_flow_ref.current = null
    setIsRunningTestFlow(false)
    POST_DONE_SCENARIOS_TO_PARENT()
  }

  /** Hẹn gửi câu hỏi tiếp theo sau 1 giây khi nhận done_llm */
  const SCHEDULE_NEXT_TEST_AI_UI_QUESTION = () => {
    const active_queue = running_test_flow_queue_ref.current
    console.log('[test-ai-ui] schedule next question', {
      delay_ms: NEXT_TEST_QUESTION_DELAY_MS,
      next_index: active_queue?.next_index,
      total: active_queue?.items.length,
    })
    CLEAR_NEXT_TEST_QUESTION_TIMEOUT()
    next_test_question_timeout_ref.current = window.setTimeout(() => {
      void SEND_NEXT_TEST_AI_UI_QUESTION()
    }, NEXT_TEST_QUESTION_DELAY_MS)
  }

  /** Gửi câu hỏi kế tiếp trong hàng đợi test-ai-ui */
  const SEND_NEXT_TEST_AI_UI_QUESTION = async () => {
    const active_queue = running_test_flow_queue_ref.current

    if (!active_queue) {
      return
    }

    if (active_queue.next_index >= active_queue.items.length) {
      FINISH_TEST_AI_UI_FLOW()
      return
    }

    if (!active_test_client_id_ref.current || loading_ref.current) {
      console.log('[test-ai-ui] chat not ready, reschedule send', {
        has_client_id: Boolean(active_test_client_id_ref.current),
        loading: loading_ref.current,
      })
      SCHEDULE_NEXT_TEST_AI_UI_QUESTION()
      return
    }

    const next_item = active_queue.items[active_queue.next_index]

    try {
      active_queue.awaiting_done_llm = true
      active_queue.is_sending_question = true
      active_queue.pending_done_llm = false

      console.log('[test-ai-ui] send next question', {
        current_index: active_queue.next_index,
        total: active_queue.items.length,
        scenario_id: next_item.scenario_id,
        scenario_title: next_item.scenario_title,
        question: next_item.question,
      })

      await send_message(next_item.question)

      active_queue.next_index += 1
      active_queue.is_sending_question = false

      console.log('[test-ai-ui] question sent, waiting done_llm', {
        next_index: active_queue.next_index,
        total: active_queue.items.length,
        pending_done_llm: active_queue.pending_done_llm,
      })

      if (active_queue.pending_done_llm) {
        console.log('[test-ai-ui] consume early done_llm after send completes', {
          next_index: active_queue.next_index,
          total: active_queue.items.length,
        })
        active_queue.pending_done_llm = false
        active_queue.awaiting_done_llm = false

        if (active_queue.next_index >= active_queue.items.length) {
          FINISH_TEST_AI_UI_FLOW()
          return
        }

        SCHEDULE_NEXT_TEST_AI_UI_QUESTION()
      }
    } catch (error) {
      console.error('Gửi câu hỏi test-ai-ui thất bại:', error)
      active_queue.awaiting_done_llm = false
      active_queue.is_sending_question = false
      active_queue.pending_done_llm = false
      CLEAR_NEXT_TEST_QUESTION_TIMEOUT()
      running_test_flow_queue_ref.current = null
      setIsRunningTestFlow(false)
    }
  }

  /** Lắng nghe biến TYPING_STATUS từ Socket để điều phối luồng test tự động */
  useEffect(() => {
    typing_status_ref.current = typing_status

    if (typing_status) {
      has_seen_typing_on_ref.current = true
    }

    if (
      typing_status === false &&
      has_seen_typing_on_ref.current &&
      wait_for_typing_off_resolver_ref.current
    ) {
      wait_for_typing_off_resolver_ref.current()
      wait_for_typing_off_resolver_ref.current = null
      has_seen_typing_on_ref.current = false

      if (wait_for_typing_off_timeout_ref.current) {
        window.clearTimeout(wait_for_typing_off_timeout_ref.current)
        wait_for_typing_off_timeout_ref.current = null
      }
    }
  }, [typing_status])

  /** Xóa bỏ mọi bộ hẹn giờ khi component bị gỡ bỏ khỏi giao diện */
  useEffect(() => {
    return () => {
      if (wait_for_typing_off_timeout_ref.current) {
        window.clearTimeout(wait_for_typing_off_timeout_ref.current)
      }

      CLEAR_NEXT_TEST_QUESTION_TIMEOUT()
    }
  }, [])

  /**
   * Tạo Promise để tạm dừng thực thi cho tới khi AI soạn thảo xong tin nhắn
   * @returns {Promise<void>}
   */
  const WAIT_FOR_TYPING_OFF = () => {
    if (!ai_status) {
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      has_seen_typing_on_ref.current = typing_status_ref.current === true
      wait_for_typing_off_resolver_ref.current = resolve
      wait_for_typing_off_timeout_ref.current = window.setTimeout(() => {
        if (wait_for_typing_off_resolver_ref.current) {
          wait_for_typing_off_resolver_ref.current()
          wait_for_typing_off_resolver_ref.current = null
          has_seen_typing_on_ref.current = false
        }
      }, AI_RESPONSE_TIMEOUT_MS)
    })
  }

  /**
   * Khởi chạy quy trình gửi tự động các câu hỏi trong kịch bản lựa chọn
   */
  const handleStartTestFlow = async (scenarios_to_run?: TestScenario[] | any) => {
    const is_custom_run =
      Array.isArray(scenarios_to_run) && scenarios_to_run.length > 0

    if (
      is_running_test_flow ||
      !active_test_client_id ||
      loading ||
      (!is_custom_run &&
        (is_loading_test_scenario_detail ||
          !selected_test_scenario ||
          selected_test_scenario.questions.length === 0))
    ) {
      return
    }

    const scenarios = is_custom_run
      ? scenarios_to_run
      : [selected_test_scenario!]

    if (is_test_ai_ui) {
      console.log('[test-ai-ui] start flow', {
        is_custom_run,
        scenarios,
      })
      const queue_items = BUILD_TEST_FLOW_QUEUE_ITEMS(scenarios)

      if (queue_items.length === 0) {
        console.log('[test-ai-ui] skip start flow because queue is empty')
        return
      }

      CLEAR_NEXT_TEST_QUESTION_TIMEOUT()
      running_test_flow_queue_ref.current = {
        items: queue_items,
        page_id: page_id || undefined,
        client_id: active_test_client_id || undefined,
        next_index: 0,
        awaiting_done_llm: false,
        is_sending_question: false,
        pending_done_llm: false,
      }
      setIsRunningTestFlow(true)
      SCHEDULE_NEXT_TEST_AI_UI_QUESTION()
      return
    }

    try {
      setIsRunningTestFlow(true)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      for (const scenario of scenarios) {
        for (const question of scenario.questions) {
          await send_message(question)
          await WAIT_FOR_TYPING_OFF()

          const random_wait_time =
            Math.floor(
              Math.random() *
                (MAX_TEST_WAIT_MS - MIN_TEST_WAIT_MS + 1)
            ) + MIN_TEST_WAIT_MS

          await new Promise((resolve) =>
            setTimeout(resolve, random_wait_time)
          )
        }
      }
    } catch (e) {
      console.error('Chạy test AI thất bại:', e)
    } finally {
      setIsRunningTestFlow(false)
    }
  }

  /**
   * Trích xuất payload từ event
   * @param event_data Dữ liệu event
   * @returns Payload đã được chuẩn hóa
   */
  const EXTRACT_RUN_AI_PAYLOAD = (event_data: any) => {
    let normalized_data = event_data
    try {
      normalized_data =
        typeof event_data === 'string' ? JSON.parse(event_data) : event_data
    } catch (error) {
      normalized_data = event_data
    }

    const GET_EVENT_TYPE = (candidate: any): string | undefined => {
      if (!candidate || typeof candidate !== 'object') return undefined
      return (
        candidate?.type ||
        candidate?.action ||
        candidate?.event ||
        candidate?.name ||
        candidate?.payload?.type ||
        candidate?.payload?.action ||
        candidate?.payload?.event ||
        candidate?.payload?.name ||
        candidate?.data?.type ||
        candidate?.data?.action ||
        candidate?.data?.event ||
        candidate?.data?.name
      )
    }

    const event_type = GET_EVENT_TYPE(normalized_data)
    if (event_type !== 'RUN_AI') {
      console.log('[test-ai-ui] ignore message because event_type is not RUN_AI', {
        event_type,
        normalized_data,
      })
      return null
    }

    const EXTRACT_SCENARIOS_FROM_CANDIDATE = (candidate: any): any[] => {
      if (!candidate || typeof candidate !== 'object') return []
      if (Array.isArray(candidate)) {
        return candidate
      }

      const direct_scenarios =
        [
          candidate?.scenarios,
          candidate?.scenario_list,
          candidate?.list_scenarios,
          candidate?.flow_list,
          candidate?.list,
          candidate?.data?.scenarios,
          candidate?.data?.scenario_list,
          candidate?.data?.list_scenarios,
          candidate?.data?.flow_list,
          candidate?.data?.list,
          candidate?.payload?.scenarios,
          candidate?.payload?.scenario_list,
          candidate?.payload?.list_scenarios,
          candidate?.payload?.flow_list,
          candidate?.payload?.list,
        ].find(Array.isArray) || []

      if (direct_scenarios.length > 0) {
        return direct_scenarios
      }

      if (candidate?.scenario && typeof candidate.scenario === 'object') {
        return [candidate.scenario]
      }

      if (Array.isArray(candidate?.questions)) {
        return [
          {
            title:
              candidate?.title ||
              candidate?.name ||
              candidate?.scenario_name ||
              t('test_scenario_untitled'),
            questions: candidate.questions,
          },
        ]
      }

      return []
    }

    const payload_candidates = [
      normalized_data?.payload?.payload,
      normalized_data?.payload?.data,
      normalized_data?.payload,
      normalized_data?.data?.payload,
      normalized_data?.data,
      normalized_data,
    ]

    const payload =
      payload_candidates.find(
        (candidate) =>
          candidate && typeof candidate === 'object' && !Array.isArray(candidate)
      ) || {}

    const scenarios =
      payload_candidates
        .map(EXTRACT_SCENARIOS_FROM_CANDIDATE)
        .find(
          (candidate) => Array.isArray(candidate) && candidate.length > 0
        ) || []

    console.log('[test-ai-ui] extract RUN_AI payload', {
      raw_event_data: event_data,
      normalized_data,
      payload,
      scenarios,
    })
    return { scenarios }
  }

  /** Hàm thử bắt đầu chạy test flow */
  const TRY_START_PENDING_TEST_FLOW = async () => {
    if (is_running_test_flow || !active_test_client_id || loading) return

    const pending_test_flow = pending_test_flow_ref.current
    if (
      !pending_test_flow ||
      !Array.isArray(pending_test_flow) ||
      pending_test_flow.length === 0
    ) {
      return
    }

    console.log('[test-ai-ui] start pending flow', {
      pending_test_flow,
    })
    pending_test_flow_ref.current = null
    await handleStartTestFlow(pending_test_flow)
  }

  useEffect(() => {
    if (!is_test_ai_ui) return

    const HANDLE_RUN_AI_EVENT = async (incoming_data: any) => {
      console.log('[test-ai-ui] receive RUN_AI message', incoming_data)
      const run_payload = EXTRACT_RUN_AI_PAYLOAD(incoming_data)
      if (!run_payload) return

      const resolved_scenarios: TestScenario[] = []
      for (let index = 0; index < run_payload.scenarios.length; index++) {
        const item = run_payload.scenarios[index]
        if (item && typeof item === 'object') {
          const questions = item.questions || []
          if (questions.length > 0) {
            resolved_scenarios.push({
              id: `scenario-${index}`,
              title: item.title || `Test ${index + 1}`,
              description: '',
              questions:
                questions[0] === '/reset' ? questions : ['/reset', ...questions],
            })
          }
        }
      }

      if (resolved_scenarios.length > 0) {
        console.log(
          '[test-ai-ui] resolved scenarios from RUN_AI',
          resolved_scenarios
        )
        pending_test_flow_ref.current = resolved_scenarios
        void TRY_START_PENDING_TEST_FLOW()
      }
    }

    const HANDLE_WINDOW_MESSAGE = (event: MessageEvent) => {
      void HANDLE_RUN_AI_EVENT(event.data)
    }

    window.addEventListener('message', HANDLE_WINDOW_MESSAGE)
    return () => window.removeEventListener('message', HANDLE_WINDOW_MESSAGE)
  }, [is_test_ai_ui, active_test_client_id, loading])

  useEffect(() => {
    if (!is_test_ai_ui) return

    const HANDLE_DONE_LLM_EVENT = (event: CustomEvent<DoneLlmEventDetail>) => {
      const active_queue = running_test_flow_queue_ref.current
      const EVENT_PAGE_ID = event?.detail?.page_id
      const EVENT_CLIENT_ID = event?.detail?.client_id

      if (!active_queue) {
        console.log('[test-ai-ui] ignore done_llm because no awaiting queue', {
          detail: event?.detail,
        })
        return
      }

      if (
        (active_queue.page_id &&
          EVENT_PAGE_ID &&
          active_queue.page_id !== EVENT_PAGE_ID) ||
        (active_queue.client_id &&
          EVENT_CLIENT_ID &&
          active_queue.client_id !== EVENT_CLIENT_ID)
      ) {
        console.log('[test-ai-ui] ignore done_llm because session mismatch', {
          expected_page_id: active_queue.page_id,
          expected_client_id: active_queue.client_id,
          event_page_id: EVENT_PAGE_ID,
          event_client_id: EVENT_CLIENT_ID,
        })
        return
      }

      if (active_queue.is_sending_question) {
        active_queue.pending_done_llm = true
        console.log('[test-ai-ui] receive done_llm while sending, mark pending', {
          detail: event?.detail,
          next_index: active_queue.next_index,
          total: active_queue.items.length,
        })
        return
      }

      if (!active_queue.awaiting_done_llm) {
        console.log('[test-ai-ui] ignore done_llm because queue is not awaiting', {
          detail: event?.detail,
          next_index: active_queue.next_index,
          total: active_queue.items.length,
        })
        return
      }

      console.log('[test-ai-ui] receive done_llm', {
        detail: event?.detail,
        next_index: active_queue.next_index,
        total: active_queue.items.length,
      })
      active_queue.awaiting_done_llm = false

      if (active_queue.next_index >= active_queue.items.length) {
        FINISH_TEST_AI_UI_FLOW()
        return
      }

      SCHEDULE_NEXT_TEST_AI_UI_QUESTION()
    }

    window.addEventListener(DONE_LLM_EVENT_NAME, HANDLE_DONE_LLM_EVENT)
    return () =>
      window.removeEventListener(DONE_LLM_EVENT_NAME, HANDLE_DONE_LLM_EVENT)
  }, [is_test_ai_ui])

  useEffect(() => {
    void TRY_START_PENDING_TEST_FLOW()
  }, [active_test_client_id, loading, is_running_test_flow])

  return {
    is_running_test_flow,
    handleStartTestFlow,
  }
}

export default useTestFlowRunner
