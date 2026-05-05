import { useDispatch, useSelector } from 'react-redux'

import { fetchAPI, useAPI } from '@/api/api'
import ChatHeader from '../Header/ChatHeader'
import { ChatScreenProps } from '../type'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { ReactComponent as Close } from '@/assets/close.svg'
import InitClient from '../Body/InitClient'
import InputChat from '../Body/InputChat/InputChat'
import InputChatNoUI from '../Body/InputChat/InputChatNoUI'
import Loading from '../../Loading/Loading'
import LoadingDots from '../../Loading/LoadingDot'
import LoadingJumping from '../../Loading/LoadingJumping'
import MessageBody from '../Body/MessageBody'
import MessageComponent from '../MessageComponent/MessageComponent'
import WIDGET from 'bbh-chatbox-widget-js-sdk'
import VConsole from 'vconsole'
import { isEmpty } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { selectCustomColor } from '@/stores/appSlice'
import { t } from 'i18next'
import useDetailChat from './useDetailChat'

/**
 * Định nghĩa cấu trúc dữ liệu cho kịch bản kiểm thử
 */
type TestScenario = {
  /** Mã định danh của kịch bản */
  id: string
  /** Tiêu đề kịch bản */
  title: string
  /** Mô tả kịch bản */
  description: string
  /** Danh sách các câu hỏi trong kịch bản */
  questions: string[]
  /** Thời gian cập nhật */
  updated_at?: string
}

/** Mỗi câu hỏi được đưa vào hàng đợi chạy test trên giao diện test-ai-ui */
type TestFlowQueueItem = {
  /** Mã kịch bản chứa câu hỏi */
  scenario_id: string
  /** Tên kịch bản chứa câu hỏi */
  scenario_title: string
  /** Nội dung câu hỏi sẽ gửi */
  question: string
}

/** Trạng thái hàng đợi test AI UI */
type TestFlowQueueState = {
  /** Danh sách câu hỏi đã được làm phẳng từ các kịch bản */
  items: TestFlowQueueItem[]
  /** page_id của phiên test hiện tại */
  page_id?: string
  /** client_id của phiên test hiện tại */
  client_id?: string
  /** Vị trí câu hỏi tiếp theo cần gửi */
  next_index: number
  /** Đánh dấu đang chờ done_llm sau khi gửi một câu hỏi */
  awaiting_done_llm: boolean
  /** Đánh dấu lượt gửi hiện tại vẫn đang trong quá trình request */
  is_sending_question: boolean
  /** Ghi nhận done_llm đến sớm hơn lúc request gửi hoàn tất */
  pending_done_llm: boolean
}

declare global {
  interface Window {
    VConsole?: any
  }

  interface WindowEventMap {
    done_llm: CustomEvent<{
      source?: string
      client_id?: string
      page_id?: string
      scenario_id?: string
      scenario_title?: string
      question?: string
      socket_data?: any
    }>
  }
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
/** Thời gian giữ chuột để kích hoạt vConsole (3 giây) */
const VCONSOLE_HOLD_THRESHOLD_MS = 3000

/**
 * Component hiển thị chi tiết cuộc trò chuyện
 * @param {ChatScreenProps} props - Các thuộc tính truyền vào component
 * @returns {JSX.Element} - Giao diện chi tiết chat
 */
function DetailChat({
  onCancel,
  user_id,
  onInitClient,
  loading_init,
  setLoadingInit,
  invalid_page_id,
  error_message,
  setHideForMobile,
  page_name,
  staff_name,
  loading_staff,
  client_name,
  employee_list,
  is_init,
  setIsInit,
}: ChatScreenProps) {
  /** Danh sách các kịch bản dùng để kiểm thử luồng AI */
  const [test_scenarios, setTestScenarios] = useState<TestScenario[]>([])
  /** Kịch bản đang được chọn để chạy test */
  const [selected_test_scenario_id, setSelectedTestScenarioId] = useState('')
  /** Trạng thái tải danh sách kịch bản */
  const [is_loading_test_scenarios, setIsLoadingTestScenarios] = useState(false)
  /** Trạng thái tải chi tiết kịch bản */
  const [is_loading_test_scenario_detail, setIsLoadingTestScenarioDetail] =
    useState(false)
  /** Thông báo lỗi khi tải kịch bản */
  const [test_scenarios_error, setTestScenariosError] = useState('')
  /** Trạng thái xác định xem luồng kiểm thử tự động có đang chạy hay không */
  const [is_running_test_flow, setIsRunningTestFlow] = useState(false)
  
  /** Kiểm tra xem tab hiện tại có phải là trang kiểm thử AI dựa trên URL hay không */
  /** Đường dẫn hiện tại */
  const PATHNAME = window.location.pathname
  /** Route test AI cũ */
  const IS_TEST_AI =
    PATHNAME.includes('/test-ai') && !PATHNAME.includes('/test-ai-ui')
  /** Route test AI UI mới */
  const IS_TEST_AI_UI = PATHNAME.includes('/test-ai-ui')
  /** Route test AI nói chung */
  const IS_TEST_AI_ROUTE = IS_TEST_AI || IS_TEST_AI_UI
  
  /** Token truy cập dùng để xác thực các API kiểm thử AI */
  const TEST_AI_ACCESS_TOKEN = WIDGET.access_token || ''

  /**
   * Hook xử lý logic chi tiết chat
   * Lấy ra các state và function cần thiết từ tầng logic (useDetailChat)
   */
  const {
    AI_STATUS,
    client_id: CLIENT_ID,
    loading_more,
    MESSAGE_CONTAINER_REF,
    PAGE_ID,
    IS_ACTIVE_AGENT_AI,
    is_loaded,
    NO_AI_ID,
    LIST_MESSAGE,
    LATEST_MESSAGE,
    checkStaffExist: CheckStaffExist,
    checkStaffExistAgent: CheckStaffExistAgent,
    LOADING_GLOBAL,
    check_no_message_ai,
    CLIENT_INFO,
    TYPING_STATUS,
    STATUSES,
    MESSAGE_END_REF,
    loading,
    show_jump_button,
    scrollToBottom: ScrollToBottom,
    error_upload,
    setErrorUpload: SetErrorUpload,
    status_index,
    sendMessage: SendMessage,
    setLoading: SetLoading,
    loading_first_time,
    LIST_CTA,
    status_list,
    list_cta_message,
    LIST_CTA_MESSAGE,
    socket_quick_chat,
    setSocketQuickChat: SetSocketQuickChat,
    handleSendMessage: HandleSendMessage,
    sendImageMessage: SendImageMessage,
  } = useDetailChat({
    user_id,
    onInitClient,
    is_init,
    setIsInit,
  })
  
  /** Lấy các API định nghĩa từ hook useAPI */
  const { READ_FLOW_API } = useAPI()
  
  /** ID trang dùng cho test AI, lấy từ thông tin khách hàng hiện tại */
  const TEST_AI_PAGE_ID = (CLIENT_INFO as any)?.page_id || ''

  /** Đối tượng kịch bản được chọn từ danh sách kịch bản hiện có */
  const selected_test_scenario =
    test_scenarios.find((scenario) => scenario.id === selected_test_scenario_id) ||
    null

  /**
   * Tạo mô tả cho kịch bản hiển thị trên giao diện
   * @param {string} updated_at - Ngày cập nhật cuối
   * @param {number} question_count - Số lượng câu hỏi
   * @returns {string} - Chuỗi mô tả hoàn chỉnh
   */
  const BUILD_SCENARIO_DESCRIPTION = (
    updated_at?: string,
    question_count?: number
  ) => {
    // Khởi tạo mảng chứa các thành phần mô tả
    const description_parts: string[] = []

    // Nếu có ngày cập nhật thì định dạng theo chuẩn vi-VN
    if (updated_at) {
      // Đưa thông tin ngày vào danh sách
      description_parts.push(
        `${t('updated_at')}: ${new Intl.DateTimeFormat('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date(updated_at))}`
      )
    }

    // Nếu có số lượng câu hỏi thì bổ sung thông tin số bước
    if (typeof question_count === 'number' && question_count > 0) {
      // Đưa thông tin số lượng câu hỏi vào danh sách
      description_parts.push(
        t('test_scenario_steps_count', { count: question_count })
      )
    }

    // Nối các phần bằng dấu chấm ở giữa hoặc trả về chuỗi mặc định
    return description_parts.join(' • ') || t('test_scenario_empty_description')
  }

  /**
   * Trích xuất danh sách các câu hỏi từ dữ liệu chi tiết luồng (flow)
   * @param {any} flow_detail - Dữ liệu thô từ API
   * @returns {string[]} - Danh sách các câu hỏi text
   */
  const EXTRACT_QUESTIONS_FROM_FLOW_DETAIL = (flow_detail: any) => {
    // Ép kiểu list action về mảng
    const flow_actions = Array.isArray(flow_detail?.flow_list_action)
      ? flow_detail.flow_list_action
      : []

    // Lấy ra text của các action, lọc bỏ các giá trị không hợp lệ
    const action_texts = flow_actions.map((action: any) => action?.action_text)
      .filter((text: any) => typeof text === 'string')
      .map((text: string) => text.trim())
      .filter(Boolean)

    // Nếu rỗng thì trả về mảng rỗng
    if (action_texts.length === 0) {
      return []
    }

    // Nếu kịch bản đã có lệnh /reset ở đầu thì trả về luôn
    if (action_texts[0] === '/reset') {
      return action_texts
    }

    // Luôn ưu tiên chèn lệnh /reset ở đầu để đảm bảo AI bắt đầu quy trình mới
    return ['/reset', ...action_texts]
  }

  /** Theo dõi các thay đổi để tải danh sách các kịch bản kiểm thử */
  useEffect(() => {
    /** Hàm xử lý lấy danh sách kịch bản test AI */
    const FETCH_TEST_SCENARIOS = async () => {
      // Dừng nếu không phải trang test AI hoặc thiếu thông tin trang
      if (!IS_TEST_AI || !TEST_AI_PAGE_ID) {
        return
      }

      // Thông báo lỗi nếu thiếu access token của SDK
      if (!TEST_AI_ACCESS_TOKEN) {
        // Xóa danh sách kịch bản hiện tại
        setTestScenarios([])
        // Hiển thị thông báo lỗi
        setTestScenariosError(t('test_scenario_missing_token'))
        return
      }

      try {
        // Bắt đầu trạng thái tải kịch bản
        setIsLoadingTestScenarios(true)
        // Reset lỗi
        setTestScenariosError('')

        // Gọi API lấy danh sách flow (kịch bản)
        const r = await fetchAPI(
          READ_FLOW_API,
          'POST',
          {
            page_id: TEST_AI_PAGE_ID,
            search: '',
            limit: 10,
            skip: 0,
            select: '',
          },
          {
            headers: {
              Authorization: TEST_AI_ACCESS_TOKEN,
            },
          }
        )

        // Lấy danh sách từ phản hồi r
        const flow_list = Array.isArray(r?.data) ? r.data : []

        // Chuyển đổi dữ liệu và cập nhật vào state
        setTestScenarios(
          flow_list.map((flow: any) => ({
            id: flow?.flow_id || flow?._id || '',
            title: flow?.flow_name || t('test_scenario_untitled'),
            description: BUILD_SCENARIO_DESCRIPTION(flow?.updatedAt),
            questions: [],
            updated_at: flow?.updatedAt,
          })).filter((flow: TestScenario) => Boolean(flow.id))
        )
      } catch (e) {
        // Log lỗi nếu API thất bại
        console.error('Tải danh sách kịch bản thất bại:', e)
        // Làm rỗng danh sách
        setTestScenarios([])
        // Thông báo lỗi tải
        setTestScenariosError(t('test_scenario_load_failed'))
      } finally {
        // Kết thúc trạng thái tải
        setIsLoadingTestScenarios(false)
      }
    }

    FETCH_TEST_SCENARIOS()
  }, [IS_TEST_AI, TEST_AI_PAGE_ID, READ_FLOW_API, TEST_AI_ACCESS_TOKEN])

  /** Theo dõi để tải chi tiết kịch bản khi kịch bản được chọn */
  useEffect(() => {
    /** Hàm xử lý lấy chi tiết câu hỏi của một kịch bản cụ thể */
    const FETCH_TEST_SCENARIO_DETAIL = async () => {
      // Kiểm tra các điều kiện tiên quyết
      if (
        !IS_TEST_AI ||
        !TEST_AI_PAGE_ID ||
        !selected_test_scenario_id ||
        !TEST_AI_ACCESS_TOKEN
      ) {
        return
      }

      // Tìm kịch bản trong list local
      const current_scenario = test_scenarios.find(
        (scenario) => scenario.id === selected_test_scenario_id
      )

      // Nếu đã tải câu hỏi rồi thì bỏ qua
      if (!current_scenario || current_scenario.questions.length > 0) {
        return
      }

      try {
        // Bắt đầu trạng thái tải chi tiết
        setIsLoadingTestScenarioDetail(true)
        // Reset lỗi
        setTestScenariosError('')

        // Gọi API lấy nội dung chi tiết của flow
        const r = await fetchAPI(
          READ_FLOW_API,
          'POST',
          {
            page_id: TEST_AI_PAGE_ID,
            flow_id: selected_test_scenario_id,
            select: '',
          },
          {
            headers: {
              Authorization: TEST_AI_ACCESS_TOKEN,
            },
          }
        )

        // Xác định dữ liệu phản hồi
        const flow_detail = Array.isArray(r?.data)
          ? r.data[0]
          : r?.data
        // Trích xuất list câu hỏi
        const questions = EXTRACT_QUESTIONS_FROM_FLOW_DETAIL(flow_detail)

        // Cập nhật lại list kịch bản với câu hỏi đã tải
        setTestScenarios((prev_scenarios) =>
          prev_scenarios.map((scenario) =>
            scenario.id === selected_test_scenario_id
              ? {
                  ...scenario,
                  questions: questions,
                  description: BUILD_SCENARIO_DESCRIPTION(
                    scenario.updated_at,
                    questions.filter(
                      (q: string) => q !== '/reset'
                    ).length
                  ),
                }
              : scenario
          )
        )

        // Nếu kịch bản rỗng thì báo lỗi
        if (questions.length === 0) {
          setTestScenariosError(t('test_scenario_detail_empty'))
        }
      } catch (e) {
        // Log lỗi chi tiết thất bại
        console.error('Tải chi tiết kịch bản thất bại:', e)
        // Thông báo lỗi chi tiết
        setTestScenariosError(t('test_scenario_detail_load_failed'))
      } finally {
        // Kết thúc trạng thái tải chi tiết
        setIsLoadingTestScenarioDetail(false)
      }
    }

    FETCH_TEST_SCENARIO_DETAIL()
  }, [
    IS_TEST_AI,
    TEST_AI_PAGE_ID,
    READ_FLOW_API,
    TEST_AI_ACCESS_TOKEN,
    selected_test_scenario_id,
    test_scenarios,
  ])

  /** Dùng ref để lưu giữ trạng thái typing mới nhất từ Socket */
  const typing_status_ref = useRef(TYPING_STATUS)
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
  /** Đồng bộ user_id mới nhất vào ref để tránh closure cũ trong timer */
  const user_id_ref = useRef(user_id)

  /** Đồng bộ lại trạng thái loading hiện tại */
  useEffect(() => {
    loading_ref.current = loading
  }, [loading])

  /** Đồng bộ lại user_id hiện tại */
  useEffect(() => {
    user_id_ref.current = user_id
  }, [user_id])

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
  const BUILD_TEST_FLOW_QUEUE_ITEMS = (scenarios: TestScenario[]) => {
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

    // Không làm gì nếu hiện tại không có hàng đợi đang chạy
    if (!active_queue) {
      return
    }

    // Nếu hàng đợi đã hết câu hỏi thì kết thúc phiên test
    if (active_queue.next_index >= active_queue.items.length) {
      FINISH_TEST_AI_UI_FLOW()
      return
    }

    // Nếu phiên chat chưa sẵn sàng thì giữ hàng đợi lại để thử tiếp
    if (!user_id_ref.current || loading_ref.current) {
      console.log('[test-ai-ui] chat not ready, reschedule send', {
        has_user_id: Boolean(user_id_ref.current),
        loading: loading_ref.current,
      })
      SCHEDULE_NEXT_TEST_AI_UI_QUESTION()
      return
    }

    // Lấy câu hỏi tiếp theo trong hàng đợi
    const next_item = active_queue.items[active_queue.next_index]

    try {
      // Đánh dấu bắt đầu một lượt gửi để chịu được trường hợp done_llm về sớm
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
      // Gửi câu hỏi kế tiếp lên server chat
      await SendMessage(next_item.question)
      // Dời con trỏ sang câu hỏi kế tiếp
      active_queue.next_index += 1
      // Đánh dấu request gửi đã xong
      active_queue.is_sending_question = false
      console.log('[test-ai-ui] question sent, waiting done_llm', {
        next_index: active_queue.next_index,
        total: active_queue.items.length,
        pending_done_llm: active_queue.pending_done_llm,
      })

      // Nếu done_llm đã tới trong lúc request gửi còn đang pending thì xử lý ngay
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
      // Nếu gửi lỗi thì dừng flow để tránh bắn sai chuỗi scenario
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
    // Cập nhật giá trị typing hiện tại vào ref để đồng bộ logic
    typing_status_ref.current = TYPING_STATUS
    // Nếu phát hiện typing bắt đầu (ON)
    if (TYPING_STATUS) {
      // Đánh dấu đã thấy AI bắt đầu chu kỳ phản hồi
      has_seen_typing_on_ref.current = true
    }
    // Nếu typing kết thúc (OFF) và chúng ta đang chờ phản hồi đã được đánh dấu
    if (
      TYPING_STATUS === false &&
      has_seen_typing_on_ref.current &&
      wait_for_typing_off_resolver_ref.current
    ) {
      // Nhả tín hiệu hoàn tất cho Promise đang chờ
      wait_for_typing_off_resolver_ref.current()
      // Xóa resolver để giải phóng
      wait_for_typing_off_resolver_ref.current = null
      // Reset cờ nhận diện typing
      has_seen_typing_on_ref.current = false
      // Xóa timeout an toàn nếu còn
      if (wait_for_typing_off_timeout_ref.current) {
        // Thực hiện xóa timer
        window.clearTimeout(wait_for_typing_off_timeout_ref.current)
        // Gán lại null cho timer ref
        wait_for_typing_off_timeout_ref.current = null
      }
    }
  }, [TYPING_STATUS])

  /** Xóa bỏ mọi bộ hẹn giờ khi component bị gỡ bỏ khỏi giao diện */
  useEffect(() => {
    return () => {
      // Kiểm tra timer an toàn còn tồn tại không
      if (wait_for_typing_off_timeout_ref.current) {
        // Thực hiện xóa sạch timer
        window.clearTimeout(wait_for_typing_off_timeout_ref.current)
      }
      // Dọn sạch timer của flow test-ai-ui nếu còn
      CLEAR_NEXT_TEST_QUESTION_TIMEOUT()
    }
  }, [])

  /**
   * Tạo Promise để tạm dừng thực thi cho tới khi AI soạn thảo xong tin nhắn
   * @returns {Promise<void>}
   */
  const WAIT_FOR_TYPING_OFF = () => {
    // Nếu hệ thống AI chưa được kích hoạt thì không phải chờ
    if (!AI_STATUS) {
      // Trả về promise hoàn thành ngay
      return Promise.resolve()
    }
    // Trả về promise mới sẽ được resolve bởi effect lắng nghe TYPING_STATUS
    return new Promise<void>((resolve) => {
      // Kiểm tra trạng thái typing hiện thời để đánh dấu
      has_seen_typing_on_ref.current = typing_status_ref.current === true
      // Gán hàm resolve vào ref để trigger ngoại vi
      wait_for_typing_off_resolver_ref.current = resolve
      // Thiết đặt timeout bảo vệ tránh treo logic (60 giây)
      wait_for_typing_off_timeout_ref.current = window.setTimeout(() => {
        // Nếu sau 60s vẫn chưa thấy tín hiệu OFF
        if (wait_for_typing_off_resolver_ref.current) {
          // Buộc phải resolve để tiếp tục quy trình test
          wait_for_typing_off_resolver_ref.current()
          // Làm sạch ref
          wait_for_typing_off_resolver_ref.current = null
          // Reset cờ
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

    // Kiểm tra các ràng buộc trước khi bắt đầu luồng test tự động
    if (
      is_running_test_flow ||
      !user_id ||
      loading ||
      (!is_custom_run &&
        (is_loading_test_scenario_detail ||
          !selected_test_scenario ||
          selected_test_scenario.questions.length === 0))
    ) {
      // Nếu trạng thái không cho phép hoặc dữ liệu thiếu thì thoát
      return
    }

    const scenarios = is_custom_run ? scenarios_to_run : [selected_test_scenario!]

    // Riêng test-ai-ui sẽ chạy theo cơ chế chờ done_llm thực tế từ socket
    if (IS_TEST_AI_UI) {
      console.log('[test-ai-ui] start flow', {
        is_custom_run,
        scenarios,
      })
      const queue_items = BUILD_TEST_FLOW_QUEUE_ITEMS(scenarios)

      // Không chạy nếu không có câu hỏi hợp lệ
      if (queue_items.length === 0) {
        console.log('[test-ai-ui] skip start flow because queue is empty')
        return
      }

      // Làm sạch queue cũ trước khi khởi động đợt mới
      CLEAR_NEXT_TEST_QUESTION_TIMEOUT()
      running_test_flow_queue_ref.current = {
        items: queue_items,
        page_id: PAGE_ID || undefined,
        client_id: CLIENT_ID || user_id || undefined,
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
      // Đánh dấu trạng thái đang chạy test để khóa UI
      setIsRunningTestFlow(true)

      // Delay 2s trước khi gửi tin nhắn đầu tiên để đảm bảo UI/Hệ thống sẵn sàng
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Duyệt qua từng câu hỏi trong danh sách kịch bản
      for (const scenario of scenarios) {
        for (const question of scenario.questions) {
          // Thực hiện gửi nội dung câu hỏi
          await SendMessage(question)
          // Chờ đợi AI phản hồi tin nhắn cho đến khi ngừng soạn thảo
          await WAIT_FOR_TYPING_OFF()
          // Tạo khoảng nghỉ ngẫu nhiên (5-10s) để mô phỏng hành vi tự nhiên
          const random_wait_time = Math.floor(Math.random() * (MAX_TEST_WAIT_MS - MIN_TEST_WAIT_MS + 1)) + MIN_TEST_WAIT_MS
          // Tạm dừng thread xử lý trong thời gian random
          await new Promise((resolve) => setTimeout(resolve, random_wait_time))
        }
      }
    } catch (e) {
      // Ghi log lỗi nếu tiến trình test gặp trục trặc
      console.error('Chạy test AI thất bại:', e)
    } finally {
      // Đảm bảo mở lại trạng thái UI dù test thành công hay thất bại
      setIsRunningTestFlow(false)
    }
  }

  /** 
   * Trích xuất payload từ event
   * @param event_data Dữ liệu event
   * @returns Payload đã được chuẩn hóa
   */
  const EXTRACT_RUN_AI_PAYLOAD = (event_data: any) => {
    /** Tạo biến chứa dữ liệu event đã được chuẩn hóa */
    let normalized_data = event_data
    try {
      // Nếu dữ liệu event là string thì parse thành JSON
      normalized_data = typeof event_data === 'string' ? JSON.parse(event_data) : event_data
    } catch (error) {
      // Nếu dữ liệu event không phải là JSON thì giữ nguyên
      normalized_data = event_data
    }
    // Hàm lấy loại event từ dữ liệu event
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
    /** Tạo biến chứa loại event */
    const event_type = GET_EVENT_TYPE(normalized_data)
    /** Kiểm tra nếu loại event không phải là RUN_AI thì log ra console và return null */
    if (event_type !== 'RUN_AI') {
      console.log('[test-ai-ui] ignore message because event_type is not RUN_AI', {
        event_type,
        normalized_data,
      })
      return null
    }

    /** Hàm lấy danh sách kịch bản từ dữ liệu event */
    const EXTRACT_SCENARIOS_FROM_CANDIDATE = (candidate: any): any[] => {
      // Nếu dữ liệu không phải là object hoặc array thì return array rỗng
      if (!candidate || typeof candidate !== 'object') return []
      // Nếu dữ liệu là array thì return array
      if (Array.isArray(candidate)) {
        return candidate
      }

      // Tạo biến chứa danh sách kịch bản trực tiếp
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
      // Nếu có danh sách kịch bản trực tiếp thì return danh sách kịch bản đó
      if (direct_scenarios.length > 0) {
        return direct_scenarios
      }
      // Nếu có kịch bản thì return kịch bản đó
      if (candidate?.scenario && typeof candidate.scenario === 'object') {
        return [candidate.scenario]
      }

      // Nếu có câu hỏi thì return câu hỏi đó
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
    /** Tạo biến chứa payload candidates */
    const payload_candidates = [
      normalized_data?.payload?.payload,
      normalized_data?.payload?.data,
      normalized_data?.payload,
      normalized_data?.data?.payload,
      normalized_data?.data,
      normalized_data,
    ]
    /** Tạo biến chứa payload */
    const payload =
      payload_candidates.find(
        (candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate)
      ) || {}
    /** Tạo biến chứa danh sách kịch bản */
    const scenarios =
      payload_candidates
        .map(EXTRACT_SCENARIOS_FROM_CANDIDATE)
        .find((candidate) => Array.isArray(candidate) && candidate.length > 0) || []

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
    // Nếu đang chạy test flow hoặc không có user_id hoặc loading thì return
    if (is_running_test_flow || !user_id || loading) return
    /** Lấy pending test flow */
    const pending_test_flow = pending_test_flow_ref.current
    // Nếu pending test flow không có thì return
    if (!pending_test_flow || !Array.isArray(pending_test_flow) || pending_test_flow.length === 0) return
    // Log pending test flow
    console.log('[test-ai-ui] start pending flow', {
      pending_test_flow,
    })
    // Set pending test flow null
    pending_test_flow_ref.current = null
    // Xử lý bắt đầu chạy test flow 
    await handleStartTestFlow(pending_test_flow)
  }

  useEffect(() => {
    // Nếu k phải case test AI thì bỏ qua
    if (!IS_TEST_AI_UI) return
    /** Hàm xử lý khi nhận được RUN_AI event */
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
              questions: questions[0] === '/reset' ? questions : ['/reset', ...questions],
            })
          }
        }
      }

      if (resolved_scenarios.length > 0) {
        console.log('[test-ai-ui] resolved scenarios from RUN_AI', resolved_scenarios)
        pending_test_flow_ref.current = resolved_scenarios
        void TRY_START_PENDING_TEST_FLOW()
      }
    }

    const HANDLE_WINDOW_MESSAGE = (event: MessageEvent) => {
      void HANDLE_RUN_AI_EVENT(event.data)
    }

    window.addEventListener('message', HANDLE_WINDOW_MESSAGE)
    return () => window.removeEventListener('message', HANDLE_WINDOW_MESSAGE)
  }, [IS_TEST_AI_UI, user_id, loading])

  useEffect(() => {
    if (!IS_TEST_AI_UI) return

    const HANDLE_DONE_LLM_EVENT = (event: CustomEvent) => {
      const active_queue = running_test_flow_queue_ref.current
      const EVENT_PAGE_ID = event?.detail?.page_id
      const EVENT_CLIENT_ID = event?.detail?.client_id

      // Bỏ qua nếu hiện tại không có flow test đang chạy
      if (!active_queue) {
        console.log('[test-ai-ui] ignore done_llm because no awaiting queue', {
          detail: event?.detail,
        })
        return
      }

      // Chỉ nhận done_llm của đúng phiên test hiện tại, tránh ăn nhầm luồng khách khác
      if (
        (active_queue.page_id && EVENT_PAGE_ID && active_queue.page_id !== EVENT_PAGE_ID) ||
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

      // Nếu done_llm đến sớm lúc request gửi còn đang pending thì giữ lại để consume sau
      if (active_queue.is_sending_question) {
        active_queue.pending_done_llm = true
        console.log('[test-ai-ui] receive done_llm while sending, mark pending', {
          detail: event?.detail,
          next_index: active_queue.next_index,
          total: active_queue.items.length,
        })
        return
      }

      // Nếu queue không chờ done_llm thì bỏ qua để tránh chạy lố
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
      // Đánh dấu đã nhận done_llm
      active_queue.awaiting_done_llm = false

      // Nếu đây là câu cuối cùng thì báo hoàn tất cho app cha
      if (active_queue.next_index >= active_queue.items.length) {
        FINISH_TEST_AI_UI_FLOW()
        return
      }

      // Nếu còn câu hỏi phía sau thì gửi tiếp sau 1 giây
      SCHEDULE_NEXT_TEST_AI_UI_QUESTION()
    }

    window.addEventListener(DONE_LLM_EVENT_NAME, HANDLE_DONE_LLM_EVENT)
    return () =>
      window.removeEventListener(DONE_LLM_EVENT_NAME, HANDLE_DONE_LLM_EVENT)
  }, [IS_TEST_AI_UI])

  useEffect(() => {
    void TRY_START_PENDING_TEST_FLOW()
  }, [user_id, loading, is_running_test_flow])

  /** Lấy instance dispatch từ thư viện React Redux */
  const DISPATCH = useDispatch()

  /** Lấy thông tin màu sắc tùy chỉnh của khách hàng từ global store */
  const CUSTOM_COLOR = useSelector(selectCustomColor)

  /** Xác định màu sắc nền/chủ đạo cho giao diện */
  const BACKGROUND_COLOR = CUSTOM_COLOR?.primary_color || '#1e293b'

  /** Lưu trữ tham chiếu tới các bộ hẹn giờ nhấn giữ để bật vConsole */
  const HOLD_TIMER = useRef<NodeJS.Timeout | null>(null)
  /** Ghi lại thời điểm bắt đầu hành động tương tác nhấn */
  const HOLD_START = useRef<number | null>(null)

  /**
   * Kích hoạt bảng điều khiển vConsole phục vụ kiểm thử log trên mobile
   */
  const ACTIVATE_V_CONSOLE = () => {
    // Nếu vConsole đã được khởi tạo rồi thì chỉ cần báo log
    if (window.VConsole) {
      // In thông báo đã sẵn sàng
      console.log('🧩 vConsole already loaded')
      return
    }
    // Tạo thẻ script để nhúng thư viện từ bên ngoài
    const script = document.createElement('script')
    // Đường dẫn CDN của thư viện vConsole
    script.src = 'https://unpkg.com/vconsole/dist/vconsole.min.js'
    // Khi script đã được tải hoàn tất vào trình duyệt
    script.onload = () => {
      // Tạo một instance mới để hiển thị nút log phía dưới màn hình
      new window.VConsole()
      // Xác nhận kích hoạt thành công
      console.log('✅ vConsole enabled (via long press)')
    }
    // Chèn script vào DOM
    document.body.appendChild(script)
  }

  /**
   * Khởi chạy hẹn giờ khi có hành động chạm/nhấn giữ
   */
  const handleMouseDown = () => {
    // Lưu lại thời điểm bắt đầu chạm
    HOLD_START.current = Date.now()
    // Đặt bộ đếm thời gian 3 giây
    HOLD_TIMER.current = setTimeout(() => {
      // Nếu đủ thời gian thì thực hiện kích hoạt tool debug
      ACTIVATE_V_CONSOLE()
    }, VCONSOLE_HOLD_THRESHOLD_MS)
  }

  /**
   * Hủy bỏ hẹn giờ khi người dùng buông tay trước 3 giây
   */
  const handleMouseUp = () => {
    // Nếu bộ hẹn giờ đang chạy
    if (HOLD_TIMER.current) {
      // Dừng việc đếm ngược
      clearTimeout(HOLD_TIMER.current)
      // Xóa giá trị trong timer ref
      HOLD_TIMER.current = null
    }
  }

  /** Gán các trình xử lý tương tự cho sự kiện mouse leave và touch */
  const handleMouseLeave = handleMouseUp
  const handleTouchStart = handleMouseDown
  const handleTouchEnd = handleMouseUp

  return (
    <div
      className={`flex flex-col w-full h-full ${
        AI_STATUS && 'bg-ai-bg'
      } relative`}
    >
      {/* 
          Phần Header của hội thoại 
          Tự động ẩn đi khi đang trong giao tiếp với Trợ lý ảo AI
      */}
      <div className={`${AI_STATUS ? 'hidden' : ''}`}>
        <ChatHeader
          onCancel={() => onCancel()}
          user_id={CLIENT_ID}
          setHideForMobile={setHideForMobile}
          page_name={page_name}
          staff_name={staff_name}
          loading_staff={loading_staff}
          employee_list={employee_list}
          loading_chat_data={loading_more}
        />
      </div>

      {/* 
          Khu vực chính hiển thị luồng tin nhắn 
          Sử dụng `flex-col-reverse` để hiển thị tin nhắn mới nhất ở cuối cùng
      */}
      <div
        ref={MESSAGE_CONTAINER_REF}
        className={`px-5 py-3 gap-4 overflow-y-auto scrollbar-thin scrollbar-webkit flex flex-col-reverse relative ${
          AI_STATUS ? (IS_TEST_AI_UI ? 'mt-0 mb-0' : 'mt-0 mb-16') : user_id ? 'my-16' : 'mt-44'
        } `}
        style={{ overflowAnchor: 'auto' }}
      >
        {/* Phần tử kỹ thuật để xác định vị trí cuộn khi có tin nhắn mới */}
        <div ref={MESSAGE_END_REF} />

        {/* Bong bóng thông báo trạng thái AI/Nhân viên đang soạn thảo tin nhắn */}
        <div>
          {TYPING_STATUS && (
            <div
              className={`text-lg font-semibold flex items-center ${
                isEmpty(status_list) ? '' : 'gap-x-2'
              }
                  py-2 px-4 rounded-full bg-slate-300 w-fit mb-2`}
            >
              <div className="flex  ">
                {/* Thành phần hiển thị dấu ba chấm nhấp nháy */}
                <LoadingJumping />
              </div>
            </div>
          )}
        </div>

        {/* 
            Gợi ý các câu trả lời nhanh từ kênh Socket (Quick Chat) 
            Chỉ hiển thị trong chế độ chat thông người (không phải AI tập trung)
        */}
        {!AI_STATUS && (
          <div className="flex flex-wrap gap-2 w-full">
            {socket_quick_chat.map((item: any, index: number) => (
              <div
                key={index}
                onClick={() => {
                  // Phân tích mã kịch bản từ payload truyền vào
                  const flow_id = item?.payload?.split('_')[1]

                  // Kích hoạt gửi tin nhắn kèm các tham số ngữ cảnh
                  HandleSendMessage(item?.title, {
                    message_mid:
                      LIST_MESSAGE[LIST_MESSAGE.length - 1]?.message_mid,
                    button_index: index,
                    flow_id: flow_id,
                  })
                }}
                className="font-medium border-slate-700 bg-white border hover:border-blue-500 hover:bg-blue-500 hover:text-white shadow-lg outline outline-1 outline-slate-200 rounded-lg w-fit max-w-[60%] px-2 p-1 text-sm cursor-pointer truncate "
              >
                {item.title}
              </div>
            ))}
          </div>
        )}

        {/* Hiển thị toàn bộ danh sách bong bóng tin nhắn từ lịch sử */}
        {user_id &&
          !LOADING_GLOBAL &&
          LIST_MESSAGE &&
          [...LIST_MESSAGE].reverse().map((item: any, index: number) => (
            <div
              className={`flex flex-col ${item.sender_id === user_id ? 'items-end' : 'items-start'}`}
              key={item._id || item.message_mid || index}
            >
              <MessageBody
                message_item={item}
                checkStaffExist={CheckStaffExist}
                client_name={client_name}
                checkAgentExist={CheckStaffExistAgent}
              />
            </div>
          ))}

        {/* Giao diện chào mừng khi bắt đầu phiên trò chuyện với AI lần đầu */}
        {AI_STATUS &&
          LIST_MESSAGE.length == 0 &&
          user_id &&
          !LOADING_GLOBAL &&
          check_no_message_ai && (
            IS_TEST_AI_UI ? (
              <div className="flex flex-col items-center gap-2.5 my-auto">
                <img src="./images/assistant_bot.svg" alt="Test AI Avatar" />
                <div className="flex flex-col items-center gap-1">
                  <h4 className="text-sm font-medium flex">Test AI</h4>
                  <div>
                    <h4 className="text-xs text-slate-500 text-center">Dang cho lenh RUN_AI</h4>
                    <h4 className="text-xs text-slate-500 text-center">Nhan du lieu tu postMessage de bat dau</h4>
                  </div>
                </div>
              </div>
            ) : IS_TEST_AI ? (
              <div className="flex flex-col items-center gap-2.5 my-auto">
                <img src="./images/assistant_bot.svg" alt="Test AI Avatar" />
                <div className="flex flex-col items-center gap-1">
                  <h4 className="text-sm font-medium flex">Test AI</h4>
                  <div>
                    <h4 className="text-xs text-slate-500 text-center">Chào bạn,</h4>
                    <h4 className="text-xs text-slate-500 text-center">Bạn muốn test nội dung gì ?</h4>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2.5 my-auto">
                <img src="./images/assistant_bot.svg" alt="Assistant Avatar" />
                <div className="flex flex-col items-center gap-1">
                  <h4 className="text-sm font-medium flex">
                    {CLIENT_INFO?.current_staff_name
                      ? t('_hi') + CLIENT_INFO?.current_staff_name
                      : t('_hi_')}
                    , {t('_im_your_virtual_assistant')}
                  </h4>
                  <div>
                    <h4 className="text-xs text-slate-500 text-center">
                      {t('_how_can_i_help_you')}
                    </h4>
                    <h4 className="text-xs text-slate-500 text-center">
                      {t('asking_anything')}
                    </h4>
                  </div>
                </div>
              </div>
            )
          )}

        {/* Các dòng thông báo lỗi liên quan tới cấu hình Virtual Assistant */}
        {AI_STATUS &&
          invalid_page_id === true &&
          is_loaded &&
          IS_ACTIVE_AGENT_AI === true && (
            <h4 className="flex justify-center font-semibold text-red-600">
              {t('invalid_virtual_assistant')}
            </h4>
          )}
        {AI_STATUS && NO_AI_ID && (
          <h4 className="flex justify-center font-semibold text-red-600">
            {t('no_virtual_assistant')}
          </h4>
        )}
        {AI_STATUS && is_loaded && IS_ACTIVE_AGENT_AI === false && (
          <h4 className="flex justify-center font-semibold text-red-600">
            {t('inactive_virtual_assistant')}
          </h4>
        )}

        {/* Bước nhập liệu ban đầu để định danh khách hàng khi vào chat-box */}
        {!AI_STATUS && !user_id && !error_message && (
          <div className="flex flex-col gap-2 ">
            {/* Component form khởi tạo thông tin khách hàng */}
            <InitClient
              resetData={invalid_page_id}
              onInitClient={(e: any) => {
                // Bật trạng thái loading chờ API xử lý
                setLoadingInit(true)
                // Kích hoạt callback khởi tạo gửi về component cha
                onInitClient({ ...e, page_id: PAGE_ID })
              }}
            />
            {/* Cảnh báo nếu Page ID cấu hình không còn hiệu lực */}
            {invalid_page_id && (
              <h4 className="flex justify-center font-semibold text-red-600">
                {t('invalid_page_id')}
              </h4>
            )}
          </div>
        )}

        {/* Thông điệp báo lỗi từ server khi gặp sự cố máy chủ hoặc kết nối */}
        {!user_id && error_message && !loading_more && (
          <h4 className="flex justify-center font-semibold text-red-600 whitespace-pre-line">
            {error_message}
          </h4>
        )}

        {/* Loader hiển thị giữa màn hình khi đang tạo tiến trình khởi tạo người dùng */}
        {loading_init && (
          <div className="fixed bg-gray-100 top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-lg text-xs z-50 shadow-md">
            <LoadingDots />
          </div>
        )}
      </div>

      {/* Phím bấm cho phép tự động cuộn xuống đáy hội thoại khi có tin nhắn hoặc nội dung mới */}
      {show_jump_button && user_id && (
        <button
          onClick={ScrollToBottom}
          className={`absolute flex justify-center items-center h-7 w-7 shadow-md bg-white rounded-full z-[40] ${
            AI_STATUS ? 'bottom-[16%]' : 'bottom-[13%]'
          } right-[45%]`}
        >
          <ChevronDownIcon className="size-4" />
        </button>
      )}

      {/* Bong bóng thông báo nổi khi quá trình tải tệp tin (ảnh/video) bị thất bại */}
      {error_upload && (
        <div className="absolute bottom-[20%] left-[35%] bg-white shadow-lg rounded-lg p-2 w-full max-w-40 h-fit max-h-40 group">
          <div
            className="flex justify-between cursor-pointer relative "
            onClick={() => {
              // Người dùng nhấn vào thông báo để dọn dẹp lỗi hiện thị
              SetErrorUpload('')
            }}
          >
            {/* Phím đóng thông báo lỗi */}
            <Close className="absolute top-0 right-0 bg-slate-500 p-1 rounded-full opacity-0 group-hover:opacity-100" />
          </div>
          <h4 className="text-red-500 text-sm break-words whitespace-pre-line">
            {error_upload}
          </h4>
        </div>
      )}

      {/* Các khối gợi ý nhắn tin (Call To Action) khi bắt đầu tương tác */}
      {user_id &&
        !AI_STATUS &&
        !LOADING_GLOBAL &&
        !loading_first_time &&
        LIST_MESSAGE &&
        LIST_MESSAGE.length < 2 &&
        LIST_CTA_MESSAGE?.is_active && (
          <div className="absolute bottom-[15%] left-[6%] flex flex-col gap-2 w-full">
            {/* Hiển thị tối đa 4 lời gợi ý ban đầu để kích thích người dùng trò chuyện */}
            {list_cta_message.slice(0, 4).map((item: any, index: number) => (
              <div
                key={index}
                onClick={() => {
                  // Gửi tin nhắn chứa nội dung gợi ý được chọn
                  SendMessage(item)
                }}
                className="font-medium border-slate-700 bg-white border hover:border-blue-500 hover:bg-blue-500 hover:text-white shadow-lg outline outline-1 outline-slate-200 rounded-lg w-fit max-w-[60%] px-2 p-1 text-sm cursor-pointer truncate "
              >
                {item}
              </div>
            ))}
          </div>
        )}

      {/* 
          Bảng điều khiển Kiểm thử AI dành riêng cho kỹ thuật viên 
          Sử dụng cơ chế chọn kịch bản để tự động hóa quy trình trò chuyện thử nghiệm
      */}
      {IS_TEST_AI && user_id && (
        <div
          className={`absolute bottom-1 right-1 z-20 flex w-[min(20rem,calc(100%-0.5rem))] flex-col items-stretch sm:bottom-2 sm:right-3 sm:w-[min(22rem,calc(100%-1.5rem))] ${
            selected_test_scenario ? 'gap-3' : 'gap-0'
          }`}
        >
          {/* Card lựa chọn kịch bản hiện có */}
          <div
            className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur transition-all duration-300 ease-out ${
              selected_test_scenario
                ? 'pointer-events-none max-h-0 translate-y-2 p-0 opacity-0'
                : 'max-h-[min(20rem,42vh)] translate-y-0 p-2 opacity-100 [@media(max-height:760px)]:max-h-[13.5rem] [@media(max-height:760px)]:p-1.5 [@media(max-height:430px)]:max-h-[11.5rem] [@media(max-height:430px)]:p-1'
            }`}
          >
            <div className="mb-2 px-2 pt-1 [@media(max-height:760px)]:mb-1 [@media(max-height:760px)]:px-1.5 [@media(max-height:760px)]:pt-0.5 [@media(max-height:430px)]:mb-0.5 [@media(max-height:430px)]:px-1 [@media(max-height:430px)]:pt-0">
              <p className="text-sm font-semibold text-slate-900 [@media(max-height:760px)]:text-[13px] [@media(max-height:430px)]:text-xs">
                {t('test_scenario_label')}
              </p>
              <p className="text-[10px] text-slate-700 [@media(max-height:760px)]:leading-4 [@media(max-height:430px)]:hidden">
                {t('test_scenario_hint')}
              </p>
            </div>

            {/* Trạng thái tải danh sách kịch bản từ Server */}
            {is_loading_test_scenarios ? (
              <div className="px-3 py-6 text-center text-sm text-slate-500">
                {t('test_scenario_loading')}
              </div>
            ) : test_scenarios_error ? (
              <div className="px-3 py-6 text-center text-sm text-red-500">
                {test_scenarios_error}
              </div>
            ) : test_scenarios.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-slate-500">
                {t('test_scenario_empty')}
              </div>
            ) : (
              // Danh sách kịch bản chọn
              <div className="flex max-h-[min(14rem,30vh)] flex-col gap-2 overflow-y-auto pr-1 [@media(max-height:760px)]:max-h-[8.75rem] [@media(max-height:760px)]:gap-1 [@media(max-height:430px)]:max-h-[7.5rem] [@media(max-height:430px)]:pr-0.5">
                {test_scenarios.map((scenario) => {
                  const is_selected =
                    scenario.id === selected_test_scenario_id

                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      disabled={is_running_test_flow || loading}
                      onClick={() => {
                        // Ghi nhận kịch bản khách hàng đã chọn
                        setSelectedTestScenarioId(scenario.id)
                      }}
                      className={`w-full rounded-2xl border px-2 py-1 text-left transition-all duration-200 [@media(max-height:760px)]:py-1 [@media(max-height:430px)]:rounded-xl [@media(max-height:430px)]:px-1.5 [@media(max-height:430px)]:py-0.5 ${
                        is_selected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <p className="text-xs font-semibold [@media(max-height:760px)]:text-[11px] [@media(max-height:430px)]:text-[10px]">
                        {scenario.title}
                      </p>
                      <p
                        className={`text-[10px] leading-5 [@media(max-height:760px)]:leading-4 [@media(max-height:430px)]:text-[9px] [@media(max-height:430px)]:leading-3 ${
                          is_selected ? 'text-slate-200' : 'text-slate-500'
                        }`}
                      >
                        {scenario.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Vùng điều khiển hành động test khi kịch bản đã sẵn sàng */}
          <div
            className={`transition-all duration-300 ease-out ${
              selected_test_scenario
                ? 'max-h-40 translate-y-0 opacity-100'
                : 'pointer-events-none max-h-0 translate-y-3 overflow-hidden opacity-0'
            }`}
          >
            <div className="flex flex-col items-end gap-2">
              {/* Nút hỗ trợ cho phép người dùng đổi sang kịch bản test khác */}
              {!is_running_test_flow && !loading && selected_test_scenario && (
                <button
                  type="button"
                  onClick={() => {
                    // Reset ID để quay về màn hình chọn kịch bản
                    setSelectedTestScenarioId('')
                  }}
                  className="rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 hover:shadow-md"
                >
                  {t('change_test_scenario')}
                </button>
              )}

              {/* Nút bấm khởi chạy luồng tin nhắn tự động theo kịch bản */}
              <button
                type="button"
                onClick={handleStartTestFlow}
                disabled={
                  is_running_test_flow ||
                  loading ||
                  is_loading_test_scenario_detail ||
                  !selected_test_scenario ||
                  selected_test_scenario.questions.length === 0
                }
                className={`inline-flex max-w-[calc(100%-0.5rem)] self-end rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:hover:translate-y-0 sm:max-w-full ${
                  is_running_test_flow || loading || is_loading_test_scenario_detail
                    ? 'bg-slate-800 ring-4 ring-slate-200/80'
                    : 'bg-slate-900 hover:-translate-y-0.5 hover:shadow-xl'
                }`}
              >
                {/* Trạng thái thực thi các hành động gửi tin */}
                {is_running_test_flow || loading ? (
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
                    </span>
                    <span>{t('running')}</span>
                  </span>
                ) : is_loading_test_scenario_detail ? (
                  // Trạng thái đang tải bộ câu hỏi chi tiết
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>{t('test_scenario_loading_detail')}</span>
                  </span>
                ) : (
                  // Trạng thái nút bấm hiển thị tên kịch bản đang chọn để thực thi
                  <span className="block truncate sm:max-w-[14rem]">
                    {`${t('test')}: ${selected_test_scenario?.title || ''}`}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
          Vùng nhập liệu văn bản của khách hàng 
          Tự động ẩn đi khi đang trong giao diện kiểm thử của kỹ thuật viên
      */}
      {user_id && !IS_TEST_AI_ROUTE ? (
        <InputChat
          error_message={error_message}
          handleSend={(e: string) => {
            // Thực hiện kịch hoạt hàm gửi nội dung văn bản
            SendMessage(e)
          }}
          handleUpload={(file: File) => {
            // Thực hiện kịch hoạt gửi tệp đính kèm
            SendImageMessage(file)
          }}
          loading={loading}
          page_name={page_name}
          client_id={user_id}
          setLoading={(e: boolean) => SetLoading(e)}
          handleError={(e: any) => {
            // Nhận kết quả lỗi khi thao tác nhập liệu không hợp lệ
            SetErrorUpload(e)
          }}
        />
      ) : !IS_TEST_AI_UI ? (
        // UI thay thế nếu chưa khởi tạo khách hàng hoặc đang chạy kiểm AI tự động (chỉ cho test-ai)
        <InputChatNoUI />
      ) : null}
    </div>
  )
}

export default DetailChat
