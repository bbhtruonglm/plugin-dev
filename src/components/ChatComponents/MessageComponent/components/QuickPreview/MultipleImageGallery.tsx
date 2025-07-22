import { MessageProps } from '@/components/ChatComponents/type'

const MultipleImageGallery = ({ data }: MessageProps) => {
  /** Lấy danh sách hình ảnh từ dữ liệu tin nhắn */
  const IMAGES = data?.message_attachments?.slice(0, 6)
  /** Kiểm tra xem có hình ảnh nào không */
  if (!IMAGES?.length) return null
  /** Xác định lớp CSS cho lưới dựa trên số lượng hình ảnh */
  const GRID_CLASS =
    IMAGES.length === 1
      ? 'grid-cols-1 w-32 h-32'
      : IMAGES.length === 2
      ? 'grid-cols-2 w-[200px]'
      : IMAGES.length <= 3
      ? 'grid-cols-3 w-[304px]'
      : 'grid-cols-3 grid-rows-2 w-[304px]'

  return (
    <div className="overflow-x-auto p-2 bg-transparent rounded-lg max-h-[216px]">
      <div className={`grid gap-2 ${GRID_CLASS}`}>
        {IMAGES.map((attachment, index) => (
          <div
            key={attachment?.payload?.url}
            className="relative w-24 h-24 bg-slate-200 rounded-lg overflow-hidden border border-slate-100"
          >
            <img
              src={attachment?.payload?.url}
              className="object-cover w-full h-full"
              alt={`attachment ${index + 1}`}
              loading="lazy"
              onClick={() => {
                // openPreview(attachment?.payload?.url)
              }}
            />
            {index === 5 && data?.message_attachments?.length > 6 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-bold">
                +{data?.message_attachments?.length - 6}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MultipleImageGallery
