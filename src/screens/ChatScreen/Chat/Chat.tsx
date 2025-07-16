import { ChatProps } from '../type'
import DetailChat from '@/components/ChatComponents/DetailChat/DetailChat'
import { useChatClient } from './useChatClient'

function ChatScreen({
  userOutChat,
  error_message,
  setHideForMobile,
  page_name,
  employee_list,
  invalid_page_id_parent,
  consultation,
}: ChatProps) {
  const {
    client_id,
    initGetClientId,
    loading,
    setLoading,
    invalid_page_id,
    setInvalidPageId,
    staff_avatar,
    staff_name,
    loading_staff,
    client_name,
    is_init,
    setIsInit,
  } = useChatClient(invalid_page_id_parent)

  return (
    <div className="flex flex-col w-full h-full justify-center items-center">
      <DetailChat
        onCancel={() => userOutChat(client_id)}
        user_id={client_id}
        onInitClient={initGetClientId}
        loading_init={loading}
        setLoadingInit={setLoading}
        invalid_page_id={invalid_page_id}
        onResetInput={() => setInvalidPageId(false)}
        error_message={error_message}
        setHideForMobile={setHideForMobile}
        page_name={page_name}
        staff_avatar={staff_avatar}
        staff_name={staff_name}
        loading_staff={loading_staff}
        client_name={client_name}
        employee_list={employee_list}
        is_init={is_init}
        setIsInit={() => setIsInit(false)}
      />
    </div>
  )
}

export default ChatScreen
