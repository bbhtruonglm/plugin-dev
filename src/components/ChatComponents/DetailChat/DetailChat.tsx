import ChatHeader from '../Header/ChatHeader'
import { ChatScreenProps } from '../type'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { ReactComponent as Close } from '@/assets/close.svg'
import InitClient from '../Body/InitClient'
import InputChat from '../Body/InputChat/InputChat'
import InputChatNoUI from '../Body/InputChat/InputChatNoUI'
import Loading from '../../Loading/Loading'
import LoadingDots from '../../Loading/LoadingDot'
import LoadingJumping from '../../Loading/LoadingJumping'
import MessageBody from '../Body/MessageBody'
import { t } from 'i18next'
import useDetailChat from './useDetailChat'

/** Chi tiết component chat */
function DetailChat({
  onCancel,
  user_id,
  onInitClient,
  loading_init,
  setLoadingInit,
  invalid_page_id,
  error_message,
  setHideForMobile,
  page_name,
  staff_name,
  loading_staff,
  client_name,
  employee_list,
  is_init,
  setIsInit,
}: ChatScreenProps) {
  const {
    AI_STATUS,
    client_id: CLIENT_ID,
    loading_more,
    MESSAGE_CONTAINER_REF,
    PAGE_ID,
    IS_ACTIVE_AGENT_AI,
    is_loaded,
    NO_AI_ID,
    LIST_MESSAGE,
    LATEST_MESSAGE,
    checkStaffExist,
    checkStaffExistAgent,
    LOADING_GLOBAL,
    check_no_message_ai,
    CLIENT_INFO,
    TYPING_STATUS,
    STATUSES,
    MESSAGE_END_REF,
    loading,
    show_jump_button,
    scrollToBottom,
    error_upload,
    setErrorUpload,
    status_index,
    sendMessage,
    setLoading,
    loading_first_time,
    LIST_CTA,
    status_list,
    list_cta_message,
    LIST_CTA_MESSAGE,
  } = useDetailChat({
    user_id,
    onInitClient,
    is_init,
    setIsInit,
  })
  return (
    <div
      className={`flex flex-col w-full h-full ${
        AI_STATUS && 'bg-ai-bg'
      }  relative `}
    >
      {/* header */}
      <div className={`${AI_STATUS ? 'hidden' : ''}`}>
        <ChatHeader
          onCancel={() => onCancel()}
          user_id={CLIENT_ID}
          setHideForMobile={setHideForMobile}
          page_name={page_name}
          staff_name={staff_name}
          loading_staff={loading_staff}
          employee_list={employee_list}
          loading_chat_data={loading_more}
        />
      </div>
      {/* body */}
      <div
        ref={MESSAGE_CONTAINER_REF}
        className={`px-5 py-3 gap-4 overflow-y-auto scrollbar-thin scrollbar-webkit flex flex-col relative ${
          AI_STATUS ? 'mt-0 mb-16' : user_id ? 'my-16' : 'mt-44'
        } `}
      >
        {user_id && loading_more && (
          <div className="fixed bg-white-300 top-[12%] left-[48%] p-2 rounded-full text-xs z-50">
            <Loading />
          </div>
        )}
        {/* Không có page Id sẽ báo lỗi k kết nối với hệ thống */}
        {!user_id && error_message && !loading_more && (
          <h4 className="flex justify-center font-semibold text-red-600 whitespace-pre-line">
            {error_message}
          </h4>
        )}
        {/* Không có page Id sẽ báo lỗi */}
        {/* {!user_id && !error_message && Khi bấm vào chat lần đầu */}
        {!AI_STATUS && !user_id && !error_message && (
          <div className="flex flex-col gap-2 ">
            <InitClient
              resetData={invalid_page_id}
              onInitClient={(e: any) => {
                setLoadingInit(true)
                onInitClient({ ...e, page_id: PAGE_ID })
              }}
            />
            {invalid_page_id && (
              <h4 className="flex justify-center font-semibold text-red-600">
                {t('invalid_page_id')}
              </h4>
            )}
          </div>
        )}

        {AI_STATUS &&
          invalid_page_id === true &&
          is_loaded &&
          IS_ACTIVE_AGENT_AI === true && (
            <h4 className="flex justify-center font-semibold text-red-600">
              {t('invalid_virtual_assistant')}
            </h4>
          )}
        {AI_STATUS && NO_AI_ID && (
          <h4 className="flex justify-center font-semibold text-red-600">
            {t('no_virtual_assistant')}
          </h4>
        )}
        {AI_STATUS && is_loaded && IS_ACTIVE_AGENT_AI === false && (
          <h4 className="flex justify-center font-semibold text-red-600">
            {t('inactive_virtual_assistant')}
          </h4>
        )}
        {/* Hiển thị Phần chào mừng với AI */}
        {AI_STATUS &&
          LIST_MESSAGE.length == 0 &&
          user_id &&
          !LOADING_GLOBAL &&
          check_no_message_ai && (
            <div className="flex flex-col items-center gap-2.5">
              <img
                src="./images/assistant_bot.svg"
                alt=""
              />
              <div className="flex flex-col items-center gap-1">
                <h4 className="text-sm font-medium flex">
                  {CLIENT_INFO?.current_staff_name
                    ? t('_hi') + CLIENT_INFO?.current_staff_name
                    : t('_hi_')}
                  , {t('_im_your_virtual_assistant')}
                </h4>
                <div>
                  <h4 className="text-xs text-slate-500 text-center">
                    {t('_how_can_i_help_you')}
                  </h4>
                  <h4 className="text-xs text-slate-500 text-center">
                    {t('asking_anything')}
                  </h4>
                </div>
              </div>
            </div>
          )}
        {/* render nội dung tin nhắn từ list có sẵn */}
        {user_id &&
          !LOADING_GLOBAL &&
          LIST_MESSAGE &&
          LIST_MESSAGE.map((item: any, index: number) => (
            <div
              className="flex flex-col"
              key={index}
            >
              <MessageBody
                item={item}
                checkStaffExist={checkStaffExist}
                client_name={client_name}
                checkAgentExist={checkStaffExistAgent}
              />
            </div>
          ))}
        <div>
          {TYPING_STATUS && (
            <div className="text-lg font-semibold flex items-center gap-x-2 py-2 px-4 rounded-full bg-slate-300 w-fit">
              <span className="text-xs text-slate-700">
                {status_list[status_index]}
              </span>

              <div className="flex  ">
                {/* <LoadingDots /> */}
                <LoadingJumping />
              </div>
            </div>
          )}
        </div>

        {/* Thẻ div này đóng vai trò là nơi đánh dấu để cuộn tới
         * khi có tin nhắn mới thì sẽ cuộn xuống dưới cùng
         */}

        <div ref={MESSAGE_END_REF} />

        {/* Khi gửi tin nhắn sẽ hiển thị loading để call api */}
        {loading && (
          <div className="fixed bg-blue-300 bottom-[22%] left-[48%] p-2 rounded-full text-xs z-50">
            <LoadingDots />
          </div>
        )}

        {/* Khi khởi tạo sẽ hiển thị loading này */}
        {loading_init && (
          <div className="fixed bg-red-300 bottom-[22%] left-[48%] p-2 rounded-full text-xs z-50">
            <LoadingDots />
          </div>
        )}
      </div>
      {/* Hiển thị nút nhảy về cuối trang */}
      {show_jump_button && user_id && (
        <button
          onClick={scrollToBottom}
          className={`absolute flex justify-center items-center h-7 w-7 shadow-md bg-white rounded-full z-[40] ${
            AI_STATUS ? 'bottom-[16%]' : 'bottom-[13%]'
          } right-[45%]`}
        >
          <ChevronDownIcon className="size-4" />
        </button>
      )}
      {/** Khi upload lỗi, thông báo cho user */}
      {error_upload && (
        <div className="absolute bottom-[20%] left-[35%] bg-white shadow-lg rounded-lg p-2 w-full max-w-40 h-fit max-h-40 group">
          <div
            className="flex justify-between cursor-pointer relative "
            onClick={() => {
              setErrorUpload('')
            }}
          >
            <Close className="absolute top-0 right-0 bg-slate-500 p-1 rounded-full opacity-0 group-hover:opacity-100" />
          </div>
          <h4 className="text-red-500 text-sm break-words whitespace-pre-line">
            {error_upload}
          </h4>
        </div>
      )}

      {user_id &&
        !AI_STATUS &&
        !LOADING_GLOBAL &&
        !loading_first_time &&
        LIST_MESSAGE &&
        LIST_MESSAGE.length < 2 &&
        LIST_CTA_MESSAGE?.is_active && (
          <div className="absolute bottom-[15%] left-[6%] flex flex-col gap-2 w-full">
            {list_cta_message.slice(0, 4).map((item: any, index: number) => (
              <div
                key={index}
                onClick={() => {
                  sendMessage(item)
                }}
                className="font-medium border-slate-700 bg-white border hover:border-blue-500 hover:bg-blue-500 hover:text-white shadow-lg outline outline-1 outline-slate-200 rounded-lg w-fit max-w-[60%] px-2 p-1 text-sm cursor-pointer truncate "
              >
                {item}
              </div>
            ))}
          </div>
        )}

      {/* ô input  Khi có text trong input thì hiển thị thêm icon send */}
      {user_id ? (
        <InputChat
          error_message={error_message}
          handleSend={(e: string) => {
            sendMessage(e)
            setLoading(true)
          }}
          loading={loading}
          page_name={page_name}
          client_id={user_id}
          setLoading={(e: boolean) => setLoading(e)}
          handleError={(e: any) => {
            setErrorUpload(e)
          }}
        />
      ) : (
        <InputChatNoUI />
      )}
    </div>
  )
}

export default DetailChat
