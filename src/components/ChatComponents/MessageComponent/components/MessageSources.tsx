import { BookOpenIcon } from '@heroicons/react/24/outline'
import { t } from 'i18next'

/** Khai báo kiểu dữ liệu */
type Source = {
  /** Tiêu đề */
  title?: string
  /** Đường dẫn */
  link?: string
}

const MessageSources = ({ sources }: { sources: Source[] }) => {
  return (
    <div className="flex flex-col gap-y-1 text-xs">
      <div className="flex gap-x-1">
        <BookOpenIcon className="size-4" />
        <p className="text-xs">
          {t('based_on_sources', {
            count: sources.length || 0,
          })}
        </p>
      </div>
      <div className="pl-4">
        {sources.map((item, index) => (
          <div
            key={index}
            className="flex gap-x-2 items-center"
          >
            • <span>{item?.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MessageSources
