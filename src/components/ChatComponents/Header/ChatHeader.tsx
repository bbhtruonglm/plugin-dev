import 'react-loading-skeleton/dist/skeleton.css' // Đảm bảo CSS được import

import {
  selectCurrentWidth,
  selectIsAvatar,
  selectIsViewScreen,
  selectLoadingGlobal,
  selectOrgAllowLogo,
  selectPageAvatar,
  selectPageLogo,
  selectShowHome,
  selectShowSupportStaff,
  setIsAvatar,
} from '@/stores/appSlice'
import { useEffect, useState } from 'react'

import { ReactComponent as BackArrow } from '@/assets/white-arrow.svg'
import { ChatHeaderProps } from '../type'
import { ReactComponent as Close } from '@/assets/close.svg'
import OnlineStaff from '../../Container/OnlineStaff'
import Skeleton from 'react-loading-skeleton'
import { t } from 'i18next'
import { useSelector } from 'react-redux'

function ChatHeader({
  onCancel,
  user_id,
  setHideForMobile,
  page_name,
  staff_name,
  loading_staff,
  employee_list,
  loading_chat_data,
}: ChatHeaderProps) {
  /** Độ rộng màn hình hiện tại */
  const CURRENT_WIDTH = useSelector(selectCurrentWidth)

  /** Loading Global */
  const LOADING_GLOBAL = useSelector(selectLoadingGlobal)

  /** Check list nhân viên có ai online không */
  const ANY_ONLINE = employee_list?.some((employee) => employee.is_online)
  /**
   * Hiển thị avatar nhân viên/page
   */
  const IS_AVATAR = useSelector(selectIsAvatar)
  console.log(IS_AVATAR, 'is avatar')

  /**Show support staff */
  const SHOW_SUPPORT_STAFF = useSelector(selectShowSupportStaff)
  console.log(SHOW_SUPPORT_STAFF, 'show support staff')
  /**
   * link avatar cua page
   */
  const PAGE_AVATAR = useSelector(selectPageAvatar)

  /**
   * Trạng thái hiện thị home page
   */
  const IS_SHOW_HOME = useSelector(selectShowHome)

  /** IS View screen */
  const IS_VIEW_SCREEN = useSelector(selectIsViewScreen)
  /**
   * Trạng thái hiện thị home page
   */
  const [is_show_home, setIsShowHome] = useState(true)
  /**
   * org custom logo
   */
  const ORG_ALLOW_LOGO = useSelector(selectOrgAllowLogo)

  /**
   * link logo
   */
  const LOGO_PAGE_CUSTOM = useSelector(selectPageLogo)
  /**
   * Trạng thái hiện thị home page
   */
  useEffect(() => {
    console.log(IS_SHOW_HOME, 'is show home')
    setIsShowHome(IS_SHOW_HOME || false)
  }, [IS_SHOW_HOME])

  return (
    <>
      {LOADING_GLOBAL ? (
        <div
          className={`flex w-full absolute justify-center items-center top-0 bg-slate-800 ${
            user_id ? 'h-16 items-center' : 'h-44'
          }`}
        >
          {user_id ? (
            <div className="flex justify-between items-center w-full h-16 py-3 px-5">
              <div className="flex justify-center items-center gap-x-3 py-4 h-16">
                {is_show_home ? (
                  <BackArrow
                    className="w-7 h-7 cursor-pointer"
                    onClick={() => onCancel()}
                  />
                ) : (
                  <div className="w-7 h-7"></div>
                )}
                <div className="flex flex-col">
                  <Skeleton
                    count={1}
                    height={10}
                    width={100}
                  />
                  <Skeleton
                    count={1}
                    height={8}
                    width={100}
                  />
                </div>
              </div>
              <Skeleton
                count={1}
                height={32}
                width={32}
                style={{ borderRadius: '50%' }}
              />
            </div>
          ) : (
            <div className="flex flex-col w-full items-center py-3 px-5 gap-2 h-44">
              <div className="flex justify-between w-full ">
                {is_show_home ? (
                  <BackArrow
                    className="w-7 h-7 cursor-pointer"
                    onClick={() => onCancel()}
                  />
                ) : (
                  <div className="w-7 h-7"></div>
                )}
                <Skeleton
                  count={1}
                  height={18}
                  width={100}
                />
                <div className="w-7 h-7"></div>
              </div>
              <Skeleton
                count={1}
                height={48}
                width={48}
                style={{ borderRadius: '50%' }}
              />
              <Skeleton
                count={1}
                height={12} // Độ cao thay đổi dựa trên user_id
                width={160} // Skeleton sẽ chiếm toàn bộ chiều rộng
              />
              <Skeleton
                count={1}
                height={6} // Độ cao thay đổi dựa trên user_id
                width={300} // Skeleton sẽ chiếm toàn bộ chiều rộng
              />
            </div>
          )}
        </div>
      ) : (
        <div
          className={`flex bg-slate-800  w-full py-3 px-5 gap-2 absolute top-0 ${
            user_id ? 'h-16 items-center' : 'h-44'
          }`}
        >
          {user_id ? (
            <div className="flex justify-between items-center w-full gap-x-2">
              <div className="flex gap-2 items-center flex-1 overflow-hidden">
                {is_show_home && !IS_VIEW_SCREEN ? (
                  <BackArrow
                    className="w-7 h-7 cursor-pointer"
                    onClick={() => onCancel()}
                  />
                ) : (
                  <div className="w-7 h-7"></div>
                )}

                <div className="flex flex-col overflow-hidden flex-1">
                  {loading_staff ? (
                    <div className="h-5 flex items-center"></div>
                  ) : (
                    <h2 className="text-white text-sm font-medium truncate overflow-hidden whitespace-nowrap">
                      {SHOW_SUPPORT_STAFF &&
                      SHOW_SUPPORT_STAFF?.is_active &&
                      IS_AVATAR
                        ? staff_name || page_name
                        : page_name}
                    </h2>
                  )}
                  <h5 className="flex gap-1 items-center font-normal text-xs text-onlineColor">
                    <div className="w-3 h-3 rounded-full bg-onlineColor"></div>
                    {t('online')}
                  </h5>
                </div>
              </div>

              <div className="flex gap-x-5">
                {SHOW_SUPPORT_STAFF && SHOW_SUPPORT_STAFF?.is_active && (
                  <div className="flex h-8 justify-center">
                    <OnlineStaff
                      data={employee_list}
                      size="small"
                    />
                  </div>
                )}

                <div
                  onClick={setHideForMobile}
                  className={`${
                    CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0
                      ? 'flex w-9 h-9 items-center justify-center'
                      : 'hidden'
                  }`}
                >
                  <Close />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full gap-y-1">
              <div className="flex w-full justify-between items-center h-[30px] ">
                {is_show_home && !IS_VIEW_SCREEN ? (
                  <BackArrow
                    className="w-7 h-7 cursor-pointer"
                    onClick={() => onCancel()}
                  />
                ) : (
                  <div className="w-7 h-7"></div>
                )}
                {loading_staff ? (
                  <></>
                ) : (
                  <h2 className="text-lg font-medium text-white truncate overflow-hidden whitespace-nowrap">
                    {page_name}
                  </h2>
                )}
                {CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0 ? (
                  <div
                    onClick={setHideForMobile}
                    className="w-8 h-8  flex justify-center items-center cursor-pointer"
                  >
                    <Close className="flex cursor-pointer " />
                  </div>
                ) : (
                  <div className=" flex justify-center items-center w-7 h-7"></div>
                )}
              </div>
              <div className="flex items-center py-3 justify-center h-[72px] w-full">
                <div className="flex h-12 justify-center">
                  {SHOW_SUPPORT_STAFF && SHOW_SUPPORT_STAFF?.is_active ? (
                    <OnlineStaff
                      data={employee_list}
                      size="medium"
                    />
                  ) : (
                    <img
                      src={
                        ORG_ALLOW_LOGO
                          ? LOGO_PAGE_CUSTOM
                          : './images/Logo_retion_white.png'
                      }
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-center items-center h-10 gap-1">
                {ANY_ONLINE ? (
                  <>
                    <h4 className="flex gap-2 items-center font-normal text-sm h-5 text-onlineColor">
                      <div className="w-3 h-3 rounded-full bg-onlineColor"></div>
                      {t('we_are_online')}
                    </h4>
                    <h5 className="flex items-center font-normal text-xs h-4 text-slate-300">
                      {t('your_options')}
                    </h5>
                  </>
                ) : (
                  <>
                    <h4 className="flex gap-2 items-center font-normal text-sm h-5 text-slate-300">
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      {t('we_will_reply_soon')}
                    </h4>
                    <h5 className="flex items-center font-normal text-xs h-4 text-slate-300">
                      {t('your_options')}
                    </h5>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default ChatHeader
