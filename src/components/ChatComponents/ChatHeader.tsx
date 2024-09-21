import { t, use } from 'i18next'

import { ReactComponent as BackArrow } from '@/assets/white-arrow.svg'
import { ReactComponent as Close } from '@/assets/close.svg'
import OnlineStaff from '../Container/OnlineStaff'
import { selectCurrentWidth } from '@/stores/appSlice'
import { useSelector } from 'react-redux'

function ChatHeader({
  onCancel,
  user_id,
  setHideForMobile,
  page_name,
  staff_avatar,
  staff_name,
  loading_staff,
  employee_list,
  loading_chat_data,
}: ChatHeaderProps) {
  /** Độ rộng màn hình hiện tại */
  const CURRENT_WIDTH = useSelector(selectCurrentWidth)

  /** Check list nhân viên có ai online không */
  const ANY_ONLINE = employee_list?.some((employee) => employee.is_online)

  return (
    <div
      className={`flex bg-slate-800  w-full py-3 px-5 gap-2 absolute top-0 ${
        user_id ? 'h-16 items-center' : 'h-44'
      }`}
    >
      {user_id ? (
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2 items-center">
            <BackArrow
              className="w-7 h-7 cursor-pointer"
              onClick={() => onCancel()}
            />

            <div>
              {loading_staff ? (
                <div className="h-5 flex items-center">
                  {/* <LoadingDots /> */}
                </div>
              ) : (
                <h2 className="text-white text-sm font-medium">
                  {staff_name || page_name}
                </h2>
              )}
              <h5 className="flex gap-1 items-center font-normal text-xs text-onlineColor">
                <div className="w-3 h-3 rounded-full bg-onlineColor"></div>
                {t('online')}
              </h5>
            </div>
          </div>
          <div>
            <div className="flex h-8 justify-center">
              <OnlineStaff
                data={employee_list}
                size="small"
              />
            </div>

            <div
              onClick={setHideForMobile}
              className={`${
                CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0
                  ? ' flex w-9 h-9 items-center justify-center'
                  : ' hidden'
              }`}
            >
              <Close />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full gap-y-1">
          <div className="flex w-full justify-between items-center h-[30px] ">
            <BackArrow
              className="w-7 h-7 cursor-pointer"
              onClick={() => onCancel()}
            />
            {loading_staff ? (
              <></>
            ) : (
              <h2 className="text-lg font-medium text-white">{page_name}</h2>
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
              <OnlineStaff
                data={employee_list}
                size="medium"
              />
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
  )
}

export default ChatHeader
