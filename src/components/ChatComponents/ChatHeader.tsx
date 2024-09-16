import { ReactComponent as BackArrow } from '@/assets/white-arrow.svg'
import { ReactComponent as Close } from '@/assets/close.svg'
import Loading from '../Loading/Loading'
import LoadingDots from '../Loading/LoadingDot'
import { apiImage } from '@/api/api'
import avatar1 from '@/assets/avatar1.png'
import avatar2 from '@/assets/avatar2.png'
import avatar3 from '@/assets/avatar3.png'
import { t } from 'i18next'

interface ChatScreenProps {
  onCancel: () => void
  user_id: string
  setHideForMobile?: () => void
  current_width: Number | null | any
  page_name: String | null | undefined
  staff_avatar?: String | null
  staff_name?: String | null
  loading_staff?: boolean
}
function ChatHeader({
  onCancel,
  user_id,
  setHideForMobile,
  current_width,
  page_name,
  staff_avatar,
  staff_name,
  loading_staff,
}: ChatScreenProps) {
  return (
    <div
      className={`flex bg-slate-800  w-full py-3 px-5 gap-2 absolute top-0 ${
        user_id ? 'h-16 items-center' : 'h-44'
      }`}
    >
      {user_id ? (
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            <BackArrow
              className="w-7 h-7 cursor-pointer"
              onClick={() => onCancel()}
            />
            <div>
              {loading_staff ? (
                <div className="h-5 flex items-center">
                  <Loading />
                </div>
              ) : (
                <img
                  src={staff_avatar ?? avatar1}
                  className="mask h-8 w-8 object-cover rounded-lg"
                  alt=""
                />
              )}
            </div>
            <div>
              {loading_staff ? (
                <div className="h-5 flex items-center">
                  <LoadingDots />
                </div>
              ) : (
                <h2 className="text-white text-sm font-medium">
                  {/* {t('org_name')} */}
                  {staff_name}
                </h2>
              )}
              <h5 className="flex gap-1 items-center font-normal text-xs text-onlineColor">
                <div className="w-3 h-3 rounded-full bg-onlineColor"></div>
                {t('online')}
              </h5>
            </div>
          </div>

          <div
            onClick={setHideForMobile}
            className={`${
              current_width < 768 && current_width !== 0
                ? ' flex w-9 h-9 items-center justify-center'
                : ' hidden'
            }`}
          >
            <Close />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full gap-y-1">
          <div className="flex w-full justify-between items-center h-[30px] ">
            <BackArrow
              className="w-7 h-7 cursor-pointer"
              onClick={() => onCancel()}
            />
            <h2 className="text-lg font-medium text-white">{page_name}</h2>
            {current_width < 768 && current_width !== 0 ? (
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
              {/* <img
                src={avatar1}
                className="mask -mr-2 h-12 w-12"
                alt=""
              />
              <img
                src={avatar2}
                className="mask -mr-1 h-12 w-12"
                alt=""
              />
              <img
                src={avatar3}
                className="mask  h-12 w-12"
                alt=""
                /> */}
              <img
                className="mask  h-12 w-12"
                src={'./images/earth.svg'}
                alt="page_logo"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center h-10 gap-1">
            <h4 className="flex gap-2 items-center font-normal text-sm h-5 text-onlineColor">
              <div className="w-3 h-3 rounded-full bg-onlineColor"></div>
              {t('we_are_online')}
            </h4>
            <h5 className="flex items-center font-normal text-xs h-4  text-slate-300">
              {t('your_options')}
            </h5>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatHeader
