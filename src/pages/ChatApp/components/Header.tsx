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
  current_tab: string
  IS_VIEW_SCREEN?: boolean
  AI_STATUS?: boolean
  ORG_ALLOW_LOGO?: boolean
  LOGO_PAGE_CUSTOM_BLACK?: string
  SHOW_SUPPORT_STAFF: any
  EMPLOYEE_LIST: any
  setHideForMobile?: () => void
}) => {
  return (
    <>
      {current_tab !== 'message' && (
        <div
          className={`flex justify-between items-center px-5 py-3 bg-slate-800 text-white ${
            AI_STATUS || IS_VIEW_SCREEN ? 'hidden' : 'flex'
          }`}
        >
          <div>
            {/* <RetionLogo /> */}
            <img
              src={renderLogo(ORG_ALLOW_LOGO, LOGO_PAGE_CUSTOM_BLACK, '')}
              alt="Logo Retion"
              width={30}
              height={30}
            />
          </div>

          <div className="flex items-center gap-x-5">
            <div className="flex items-center h-8">
              {SHOW_SUPPORT_STAFF && SHOW_SUPPORT_STAFF?.is_active && (
                <OnlineStaff data={EMPLOYEE_LIST} />
              )}
            </div>
            <div
              onClick={setHideForMobile}
              className={`cursor-pointer size-7 flex justify-center items-center`}
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
