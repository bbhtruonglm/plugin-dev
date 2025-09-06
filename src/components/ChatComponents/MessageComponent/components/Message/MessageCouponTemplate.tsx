import COUPON_URL from '@/assets/coupon.png'
import { CouponType } from '@/components/ChatComponents/type'

/** Define the MessageAttachments type */
interface MessageAttachments {
  /**TYpe */
  type: string
  /** Payload */
  payload: CouponType
}

/** Define the Data type */
interface Data {
  /**  MessageAttachments */
  message_attachments?: MessageAttachments
  message_mid?: string
}

const MessageCouponTemplate = ({ data }: { data: Data }) => {
  /** check coupon */
  const IS_COUPON_TEMPLATE =
    data?.message_attachments?.type === 'template' &&
    data?.message_attachments?.payload?.template_type === 'coupon'
  /** Không phải thì return */
  if (!IS_COUPON_TEMPLATE) return null
  /** Tạo Coupon */
  const COUPON: CouponType = data.message_attachments?.payload || {
    template_type: '',
    title: '',
    subtitle: '',
    coupon_code: '',
    coupon_url: '',
    coupon_url_button_title: '',
    coupon_pre_message: '',
    image_url: '',
    payload: '',
  }
  /** Handle click
   * @param buttonType
   * @param url
   */
  const handleOnClick = (buttonType: string, url: string) => {
    /** Check buttonType */
    if (buttonType === 'web_url') {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="flex flex-col p-2 gap-y-2 ">
      <h4 className="text-sm font-medium w-fit bg-gray-200 rounded-full py-2 px-4 shadow">
        {COUPON.coupon_pre_message}
      </h4>
      <div className="flex flex-col gap-y-2 bg-gray-200 rounded-lg shadow">
        <img
          // src={COUPON.image_url}
          src={COUPON_URL}
          alt="Coupon"
          className="w-full h-auto mb-2 rounded-t-lg"
        />
        <div className="flex flex-col gap-y-2 p-2 bg-gray-200 rounded-lg">
          <div className="flex flex-col text-sm font-medium">
            <span className="text-lg font-bold">{COUPON.title}</span>
            <span className="text-xs text-gray-600">{COUPON.subtitle}</span>
          </div>
          <button
            onClick={() => handleOnClick('web_url', COUPON?.coupon_url || '')}
            className="bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 shadow"
          >
            {COUPON.coupon_url_button_title}
          </button>
          <button
            onClick={() => alert(`Coupon code: ${COUPON.coupon_code}`)}
            className="bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 shadow"
          >
            Reveal code
          </button>
        </div>
      </div>
    </div>
  )
}

export default MessageCouponTemplate
