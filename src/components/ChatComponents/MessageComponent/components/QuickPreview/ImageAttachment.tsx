import { MessageProps } from '@/components/ChatComponents/type'

const ImageAttachment = ({ data }: MessageProps) => {
  /** Lấy thông tin hình ảnh từ dữ liệu tin nhắn */
  const IMAGE = data?.message_attachments?.[0]
  /** Kiểm tra xem hình ảnh có URL không */
  if (!IMAGE?.payload?.url) return null

  return (
    <div className="flex rounded-lg w-full h-full">
      <img
        src={IMAGE.payload.url}
        className="w-full h-full object-contain bg-slate-200 p-1 rounded-lg hover:cursor-pointer"
        alt=""
        loading="lazy"
        onClick={() => {
          // handleClickPreview(image.payload.url)
        }}
      />
    </div>
  )
}

export default ImageAttachment
