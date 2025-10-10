import { setDataFeedback, setGlobalPreviewUrl } from '@/stores/appSlice'

import { ElementType } from '../../../type'
import { postMessageToParent } from '@/utils'
import { useDispatch } from 'react-redux'

const MessageGenericTemplateFeedback = ({
  data,
  SHOW_POPUP,
  POSITION,
  POSITION_DETAIL,
}: any) => {
  /** Check giá trị generic template */
  const IS_TEMPLATE_FEEDBACK =
    data?.message_attachments?.type === 'template' &&
    data?.message_attachments?.payload?.template_type === 'customer_feedback'
  /** Nếu không phải dạng generic template thì trả về null */
  if (!IS_TEMPLATE_FEEDBACK) return null
  /** Khai báo kiểu dữ liệu */
  const ELEMENTS: ElementType = data.message_attachments?.payload || {}
  /** Hàm dispatch */
  const dispatch = useDispatch()
  /** Hàm xử lý khi click vào hình ảnh
   * @param {string} url - Link preview
   */
  const handleClickPreview = () => {
    /** Lưu vào STORE */
    dispatch(setDataFeedback(ELEMENTS))

    /** Click vào ảnh thì gửi thông tin cho sdk */
    postMessageToParent(
      SHOW_POPUP,
      false,
      674,
      'preview',
      POSITION,
      POSITION_DETAIL?.bottom,
      POSITION_DETAIL?.right,
      POSITION_DETAIL?.left
    )
  }
  return (
    <div className="flex overflow-x-auto rounded-2xl shadow-lg gap-1 bg-gray-100 cursor-pointer">
      <div className="rounded-2xl flex flex-col gap-x-2 flex-shrink-0 w-full p-3 gap-2">
        <div className="text-xs">
          <div className="font-semibold text-lg text-black line-clamp-3 leading-6">
            {ELEMENTS?.title}
          </div>
          <div className="text-slate-500 line-clamp-3 text-sm leading-4">
            {ELEMENTS?.subtitle}
          </div>
        </div>
        <div className="p-1 w-full items-center justify-center flex">
          <button
            onClick={() => handleClickPreview()}
            className={`px-3 bg-gray-200 w-full rounded-lg font-semibold flex items-center leading-8 justify-center`}
          >
            {ELEMENTS?.button_title}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MessageGenericTemplateFeedback
