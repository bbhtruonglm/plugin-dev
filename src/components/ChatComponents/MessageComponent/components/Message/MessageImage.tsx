import { postMessageToParent } from '@/utils'
import { setGlobalPreviewUrl } from '@/stores/appSlice'
import { useDispatch } from 'react-redux'

const MessageImage = ({ data, SHOW_POPUP, POSITION, POSITION_DETAIL }: any) => {
  const dispatch = useDispatch()
  /** Néu không phải dạng hình anh thì trả về null */
  if (data?.message_attachments?.[0]?.type !== 'image') return null

  /** Hàm xử lý khi click vào hình ảnh
   * @param {string} url - Link preview
   */
  const handleClickPreview = (url?: string) => {
    if (!url) return
    /** Lưu vào STORE */
    dispatch(setGlobalPreviewUrl(url))
    /** Click vào ảnh thì gửi thông tin cho sdk */
    postMessageToParent(
      SHOW_POPUP,
      false,
      674,
      url,
      POSITION,
      POSITION_DETAIL?.bottom,
      POSITION_DETAIL?.right,
      POSITION_DETAIL?.left
    )
  }
  /** Lấy hình ảnh  */
  const IMAGES = data.message_attachments
  /** Nếu có 1 ảnh */
  if (IMAGES.length === 1) {
    return (
      <div className="flex rounded-lg">
        <img
          src={IMAGES[0]?.payload?.url}
          className="w-32 h-32 object-contain bg-slate-200 rounded-lg hover:cursor-pointer"
          alt=""
          onClick={() => handleClickPreview(IMAGES[0]?.payload?.url)}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto p-2 bg-transparent rounded-lg max-h-[216px]">
      <div className="grid grid-cols-3 grid-rows-2 gap-2 w-[304px]">
        {IMAGES.slice(0, 6).map((attachment: any, index: number) => (
          <div
            key={attachment?.payload?.url}
            className="relative w-24 h-24 bg-slate-200 rounded-lg overflow-hidden border border-slate-100"
          >
            <img
              src={attachment?.payload?.url}
              className="object-cover w-full h-full"
              alt={`attachment ${index + 1}`}
              onClick={() => handleClickPreview(attachment?.payload?.url)}
              loading="lazy"
            />
            {index === 5 && IMAGES.length > 6 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-bold">
                +{IMAGES.length - 6}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MessageImage
