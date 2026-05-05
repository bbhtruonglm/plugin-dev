import { fetchAPI } from '@/api/api'
import { t } from 'i18next'
import { useEffect, useMemo, useState } from 'react'

import { TestScenario } from './testAiTypes'

type UseTestScenariosParams = {
  is_test_ai: boolean
  test_ai_page_id: string
  test_ai_access_token: string
  read_flow_api: string
}

/**
 * Quản lý danh sách scenario và chi tiết câu hỏi cho màn test AI cũ
 */
function useTestScenarios({
  is_test_ai,
  test_ai_page_id,
  test_ai_access_token,
  read_flow_api,
}: UseTestScenariosParams) {
  /** Danh sách các kịch bản dùng để kiểm thử luồng AI */
  const [test_scenarios, setTestScenarios] = useState<TestScenario[]>([])
  /** Kịch bản đang được chọn để chạy test */
  const [selected_test_scenario_id, setSelectedTestScenarioId] = useState('')
  /** Trạng thái tải danh sách kịch bản */
  const [is_loading_test_scenarios, setIsLoadingTestScenarios] =
    useState(false)
  /** Trạng thái tải chi tiết kịch bản */
  const [is_loading_test_scenario_detail, setIsLoadingTestScenarioDetail] =
    useState(false)
  /** Thông báo lỗi khi tải kịch bản */
  const [test_scenarios_error, setTestScenariosError] = useState('')

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
    const description_parts: string[] = []

    if (updated_at) {
      description_parts.push(
        `${t('updated_at')}: ${new Intl.DateTimeFormat('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date(updated_at))}`
      )
    }

    if (typeof question_count === 'number' && question_count > 0) {
      description_parts.push(
        t('test_scenario_steps_count', { count: question_count })
      )
    }

    return description_parts.join(' • ') || t('test_scenario_empty_description')
  }

  /**
   * Trích xuất danh sách các câu hỏi từ dữ liệu chi tiết luồng (flow)
   * @param {any} flow_detail - Dữ liệu thô từ API
   * @returns {string[]} - Danh sách các câu hỏi text
   */
  const EXTRACT_QUESTIONS_FROM_FLOW_DETAIL = (flow_detail: any) => {
    const flow_actions = Array.isArray(flow_detail?.flow_list_action)
      ? flow_detail.flow_list_action
      : []

    const action_texts = flow_actions
      .map((action: any) => action?.action_text)
      .filter((text: any) => typeof text === 'string')
      .map((text: string) => text.trim())
      .filter(Boolean)

    if (action_texts.length === 0) {
      return []
    }

    if (action_texts[0] === '/reset') {
      return action_texts
    }

    return ['/reset', ...action_texts]
  }

  /** Theo dõi các thay đổi để tải danh sách các kịch bản kiểm thử */
  useEffect(() => {
    const FETCH_TEST_SCENARIOS = async () => {
      if (!is_test_ai || !test_ai_page_id) {
        return
      }

      if (!test_ai_access_token) {
        setTestScenarios([])
        setTestScenariosError(t('test_scenario_missing_token'))
        return
      }

      try {
        setIsLoadingTestScenarios(true)
        setTestScenariosError('')

        const r = await fetchAPI(
          read_flow_api,
          'POST',
          {
            page_id: test_ai_page_id,
            search: '',
            limit: 10,
            skip: 0,
            select: '',
          },
          {
            headers: {
              Authorization: test_ai_access_token,
            },
          }
        )

        const flow_list = Array.isArray(r?.data) ? r.data : []

        setTestScenarios(
          flow_list
            .map((flow: any) => ({
              id: flow?.flow_id || flow?._id || '',
              title: flow?.flow_name || t('test_scenario_untitled'),
              description: BUILD_SCENARIO_DESCRIPTION(flow?.updatedAt),
              questions: [],
              updated_at: flow?.updatedAt,
            }))
            .filter((flow: TestScenario) => Boolean(flow.id))
        )
      } catch (e) {
        console.error('Tải danh sách kịch bản thất bại:', e)
        setTestScenarios([])
        setTestScenariosError(t('test_scenario_load_failed'))
      } finally {
        setIsLoadingTestScenarios(false)
      }
    }

    FETCH_TEST_SCENARIOS()
  }, [is_test_ai, test_ai_page_id, read_flow_api, test_ai_access_token])

  /** Theo dõi để tải chi tiết kịch bản khi kịch bản được chọn */
  useEffect(() => {
    const FETCH_TEST_SCENARIO_DETAIL = async () => {
      if (
        !is_test_ai ||
        !test_ai_page_id ||
        !selected_test_scenario_id ||
        !test_ai_access_token
      ) {
        return
      }

      const current_scenario = test_scenarios.find(
        (scenario) => scenario.id === selected_test_scenario_id
      )

      if (!current_scenario || current_scenario.questions.length > 0) {
        return
      }

      try {
        setIsLoadingTestScenarioDetail(true)
        setTestScenariosError('')

        const r = await fetchAPI(
          read_flow_api,
          'POST',
          {
            page_id: test_ai_page_id,
            flow_id: selected_test_scenario_id,
            select: '',
          },
          {
            headers: {
              Authorization: test_ai_access_token,
            },
          }
        )

        const flow_detail = Array.isArray(r?.data) ? r.data[0] : r?.data
        const questions = EXTRACT_QUESTIONS_FROM_FLOW_DETAIL(flow_detail)

        setTestScenarios((prev_scenarios) =>
          prev_scenarios.map((scenario) =>
            scenario.id === selected_test_scenario_id
              ? {
                  ...scenario,
                  questions,
                  description: BUILD_SCENARIO_DESCRIPTION(
                    scenario.updated_at,
                    questions.filter((q: string) => q !== '/reset').length
                  ),
                }
              : scenario
          )
        )

        if (questions.length === 0) {
          setTestScenariosError(t('test_scenario_detail_empty'))
        }
      } catch (e) {
        console.error('Tải chi tiết kịch bản thất bại:', e)
        setTestScenariosError(t('test_scenario_detail_load_failed'))
      } finally {
        setIsLoadingTestScenarioDetail(false)
      }
    }

    FETCH_TEST_SCENARIO_DETAIL()
  }, [
    is_test_ai,
    test_ai_page_id,
    read_flow_api,
    test_ai_access_token,
    selected_test_scenario_id,
    test_scenarios,
  ])

  const selected_test_scenario = useMemo(
    () =>
      test_scenarios.find(
        (scenario) => scenario.id === selected_test_scenario_id
      ) || null,
    [selected_test_scenario_id, test_scenarios]
  )

  return {
    test_scenarios,
    selected_test_scenario_id,
    setSelectedTestScenarioId,
    is_loading_test_scenarios,
    is_loading_test_scenario_detail,
    test_scenarios_error,
    selected_test_scenario,
  }
}

export default useTestScenarios
