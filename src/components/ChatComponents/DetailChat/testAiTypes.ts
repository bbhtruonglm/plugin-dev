/**
 * Định nghĩa cấu trúc dữ liệu cho kịch bản kiểm thử
 */
export type TestScenario = {
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
export type TestFlowQueueItem = {
  /** Mã kịch bản chứa câu hỏi */
  scenario_id: string
  /** Tên kịch bản chứa câu hỏi */
  scenario_title: string
  /** Nội dung câu hỏi sẽ gửi */
  question: string
}

/** Trạng thái hàng đợi test AI UI */
export type TestFlowQueueState = {
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

/** Phần dữ liệu chi tiết được phát kèm event done_llm */
export type DoneLlmEventDetail = {
  source?: string
  client_id?: string
  page_id?: string
  scenario_id?: string
  scenario_title?: string
  question?: string
  socket_data?: any
}

declare global {
  interface Window {
    VConsole?: any
  }

  interface WindowEventMap {
    done_llm: CustomEvent<DoneLlmEventDetail>
  }
}
