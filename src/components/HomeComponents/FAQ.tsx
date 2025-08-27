import { ArrowRightCircleIcon } from '@heroicons/react/24/solid'

interface CTAListProps {
  /** title */
  title?: string
  /** Dữ liệu */
  data: any[]

  /** Hàm gọi lại khi nhấn CTA */
  onClickCTA?: (item: any) => void
}

const FAQ: React.FC<CTAListProps> = ({
  title = 'FAQ Questions',
  data,
  onClickCTA,
}) => {
  return (
    <div className="bg-white p-3 rounded-xl flex justify-between items-center shadow-md w-full">
      <div className="flex flex-col gap-2.5 w-full">
        <h4 className="text-xs font-medium">{title}</h4>

        <div className="flex flex-col gap-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-y-2.5 group"
            >
              <button
                type="button"
                onClick={() => onClickCTA?.(item)}
                className="flex gap-2 px-4 justify-between items-center font-medium border-slate-200 bg-white border hover:border-slate-200 hover:bg-slate-200 text-slate-400 hover:text-slate-800 shadow-sm outline-slate-200 rounded-lg w-full text-left p-2 text-sm cursor-pointer truncate transition-colors duration-300"
              >
                <span className="text-slate-800">{item}</span>
                <div className="transition-transform duration-300 transform group-hover:translate-x-2">
                  <ArrowRightCircleIcon className="size-6" />
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQ
