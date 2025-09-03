import { selectCustomColor, selectPageAllowAvatar } from '@/stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'

import OnlineStaff from '@/components/Container/OnlineStaff'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { renderLogo } from '@/utils'

const Header = ({
  current_tab,
  IS_VIEW_SCREEN,
  AI_STATUS,
  ORG_ALLOW_LOGO,
  LOGO_PAGE_CUSTOM_BLACK,
  SHOW_SUPPORT_STAFF,
  EMPLOYEE_LIST,
  setHideForMobile,
}: {
  /** Tab hien tai */
  current_tab: string
  /** Có phải trang view */
  IS_VIEW_SCREEN?: boolean
  /** Có phải trạng thái AI */
  AI_STATUS?: boolean
  /** Cho phép hiển thị logo */
  ORG_ALLOW_LOGO?: boolean
  /** Link logo */
  LOGO_PAGE_CUSTOM_BLACK?: string
  /** Cho phép hiển thị staff */
  SHOW_SUPPORT_STAFF: any
  /** Danh sách nhân viên */
  EMPLOYEE_LIST: any
  /** Ẩn Trạng thái mobile */
  setHideForMobile?: () => void
}) => {
  /** Hàm dispatch */
  const dispatch = useDispatch()

  /** CUSTOM color */
  const CUSTOM_COLOR = useSelector(selectCustomColor)

  /** Lấy màu nền từ custom color hoặc fallback về màu mặc định */
  const BACKGROUND_COLOR = CUSTOM_COLOR?.primary_color || '#1e293b'

  /** Page Allow Avatar */
  const ORG_ALLOW_AVATAR = useSelector(selectPageAllowAvatar)

  return (
    <>
      {current_tab !== 'message' && (
        <div
          className={`flex justify-between items-center px-5 py-3 ${
            AI_STATUS || IS_VIEW_SCREEN ? 'hidden' : 'flex'
          }`}
          style={{
            backgroundColor: BACKGROUND_COLOR,
            color: '#FFFFFF',
          }}
        >
          <div>
            {(() => {
              /** Default logo */
              const DEFAULT_LOGO = './images/Logo_retion_white.png'
              /** Link logo */
              const LOGO_SRC = renderLogo(
                ORG_ALLOW_AVATAR,
                LOGO_PAGE_CUSTOM_BLACK,
                DEFAULT_LOGO
              )
              /** Kiểm tra logo mặc định */
              const IS_DEFAULT_LOGO = LOGO_SRC === DEFAULT_LOGO

              return (
                <img
                  src={LOGO_SRC}
                  alt="Logo Retion"
                  width={30}
                  height={30}
                  className={`${
                    IS_DEFAULT_LOGO ? '' : 'rounded-full'
                  } size-8 object-cover`}
                />
              )
            })()}
          </div>

          <div className="flex items-center gap-x-5">
            <div className="flex items-center h-8">
              {SHOW_SUPPORT_STAFF && SHOW_SUPPORT_STAFF?.is_active && (
                <OnlineStaff data={EMPLOYEE_LIST} />
              )}
            </div>
            <div
              onClick={setHideForMobile}
              className="cursor-pointer size-7 flex justify-center items-center"
            >
              <XMarkIcon className="size-7" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
