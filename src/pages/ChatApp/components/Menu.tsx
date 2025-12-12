import React from 'react'

/**
 * Interface cho Menu Item
 */
interface MenuItem {
  /** Tên hiển thị */
  name: string
  /** Icon khi inactive */
  src: React.ElementType
  /** Giá trị định danh */
  value: string
  /** Icon khi active */
  srcA: React.ElementType
}

/**
 * Interface cho props của Component Menu
 */
interface MenuProps {
  /** Danh sách các item trong menu */
  menuList: MenuItem[]
  /** Sự kiện click item */
  onClick: (value: string) => void
  /** Tab hiện tại đang active */
  currentTab: string
  /** Số tin nhắn chưa đọc global */
  unreadCount: number
}

/**
 * Component Menu (Thanh điều hướng bên dưới)
 */
const Menu: React.FC<MenuProps> = ({
  menuList,
  onClick,
  currentTab,
  unreadCount,
}) => {
  return (
    /** Container menu */
    <div className="md:w-[400px] flex flex-shrink-0 h-16 flex-col justify-evenly">
      <div className="p-2 h-16 w-full">
        <div className="flex">
          {/** Map qua danh sách menu item */}
          {menuList.map(
            ({ src: Icon, srcA: IconActive, value, name }, index) => (
              <div
                key={index}
                className="flex flex-col w-full h-full justify-center items-center cursor-pointer"
                /** Sự kiện click đổi tab */
                onClick={() => onClick(value)}
              >
                <div className="relative">
                  <div className="">
                    {/** Hiển thị badge số tin nhắn chưa đọc nếu là tab message */}
                    {value === 'message' && unreadCount > 0 && (
                      <div className="flex justify-center items-center text-xxs text-white border absolute right-0 top-0 w-4 h-4 bg-red-500 rounded-full translate-x-1 -translate-y-1">
                        {unreadCount < 10 ? unreadCount : '9+'}
                      </div>
                    )}
                  </div>
                  {/* active menu tab */}
                  {currentTab === value ? (
                    <IconActive className="size-5" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </div>
                <p className={'text-sm font-medium'}>{name}</p>
              </div>
            )
          )}
        </div>
        {/* Thông tin đơn vị phát triển */}
        <h4 className="text-xs text-center text-slate-700">
          powered by{' '}
          <a
            href="https://retion.ai"
            className="underline"
            target="_blank"
          >
            Retion.ai
          </a>
        </h4>
      </div>
    </div>
  )
}

export default Menu
