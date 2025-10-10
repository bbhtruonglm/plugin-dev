import { setDataFeedback, setGlobalPreviewUrl } from '@/stores/appSlice'

import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { postMessageToParent } from '@/utils'
import { t } from 'i18next'
import { useDispatch } from 'react-redux'

const MessageTemplateReceipt = ({
  data,
  SHOW_POPUP,
  POSITION,
  POSITION_DETAIL,
}: any) => {
  /** Check giá trị generic template */
  const IS_TEMPLATE_FEEDBACK =
    data?.message_attachments?.type === 'template' &&
    data?.message_attachments?.payload?.template_type === 'receipt'
  /** Nếu không phải dạng generic template thì trả về null */
  if (!IS_TEMPLATE_FEEDBACK) return null
  /** Khai báo kiểu dữ liệu */
  const ELEMENTS = data.message_attachments?.payload?.elements || []
  const DATA_DETAIL = data?.message_attachments?.payload || {}
  /** Hàm dispatch */
  const dispatch = useDispatch()
  /** Hàm xử lý khi click vào hình ảnh
   * @param {string} url - Link preview
   */
  const handleClickPreview = () => {
    console.log(DATA_DETAIL, 'data detail')

    /** Lưu vào STORE */
    dispatch(setDataFeedback(DATA_DETAIL))
    /** bật option preview */
    dispatch(setGlobalPreviewUrl('url'))
    /** Click vào ảnh thì gửi thông tin cho sdk */
    postMessageToParent(
      SHOW_POPUP,
      false,
      674,
      '',
      POSITION,
      POSITION_DETAIL?.bottom,
      POSITION_DETAIL?.right,
      POSITION_DETAIL?.left
    )
  }
  return (
    <div
      onClick={() => {
        handleClickPreview()
      }}
      className="flex overflow-x-auto rounded-2xl shadow-lg gap-1 bg-gray-100 cursor-pointer"
    >
      <div className="rounded-2xl flex gap-3 flex-shrink-0 w-full p-3">
        <div className="flex justify-center items-center p-1 size-9 rounded-full bg-slate-200">
          <CheckCircleIcon className="size-6" />
        </div>
        <div className="">
          <p className="font-semibold text-lg leading-6">
            {t('order_confirmation')}
          </p>
          <div className="font-medium text-slate-500">
            <p className="text-sm leading-5">
              {ELEMENTS?.length} items {'$' + DATA_DETAIL?.summary?.total_cost}
            </p>
            <p className="text-sm leading-5">{DATA_DETAIL?.payment_method}</p>
            <p className="text-sm leading-5">
              Deliver to {DATA_DETAIL?.address.city}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageTemplateReceipt
