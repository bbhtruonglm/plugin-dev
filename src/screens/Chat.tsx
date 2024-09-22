import { apiImage, fetchAPI, useAPI } from '@/api/api'
import { useEffect, useState } from 'react'

import DetailChat from '@/components/ChatComponents/DetailChat'
import { selectPageId } from '@/stores/appSlice'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ChatScreen({
  userOutChat,
  error_message,
  setHideForMobile,
  page_name,
  employee_list,
  latest_message,
}: ChatProps) {
  const { INIT_CLIENT_API, READ_CLIENT_INFO } = useAPI()
  /** ID trang được lấy từ store */
  const PAGE_ID = useSelector(selectPageId)

  const [client_id, setClientId] = useState<String | null | any>('')
  const [invalid_page_id, setInvalidPageId] = useState(false)
  const [loading, setLoading] = useState(false)
  const [staff_avatar, setStaffAvatar] = useState(null as any)
  const [staff_name, setStaffName] = useState(null as any)
  const [loading_staff, setLoadingStaff] = useState(false)
  const [client_name, setClientName] = useState(null as any)
  const [is_init, setIsInit] = useState(false)

  useEffect(() => {
    // Nếu có page_id thì mới xử lý tiếp
    if (PAGE_ID) {
      // Tạo client Id = page_id từ cha
      const CLIENT_ID = localStorage.getItem(`client_id_<${PAGE_ID}>`)
      // Có CLIENT_ID mới set vào state
      if (CLIENT_ID && CLIENT_ID !== 'undefined') {
        setClientId(CLIENT_ID)
      }
    }
  }, [])

  useEffect(() => {
    if (client_id) {
      // Có client_id thì Gọi hàm đọc data khách hàng
      fetchClientData(client_id, PAGE_ID)
      // add url mới
    }
  }, [client_id])

  /** hàm khởi tạo client id */
  const initGetClientId = async (value: any) => {
    try {
      /** Tạo đối tượng URL từ chuỗi init URL client */
      const URL_CLIENT = new URL(INIT_CLIENT_API)

      /**
       * Lấy các tham số từ một đối tượng property và gán chúng vào URL.
       * Chuyển đổi `PARAMS` thành chuỗi truy vấn và thêm vào `URL_CLIENT`.
       *
       * @param {Object} value - Đối tượng chứa các tham số cần chuyển đổi thành chuỗi query string
       * @type {string} URL_CLIENT.search - Chuỗi query string mới được gán vào `URL_CLIENT.search`
       *
       * @example
       * const value = { page: 1, sort: 'asc' };
       * const PARAMS = value;
       * URL_CLIENT.search = new URLSearchParams(PARAMS).toString();
       * // URL_CLIENT.search sẽ là "page=1&sort=asc"
       */
      const PARAMS = value

      URL_CLIENT.search = new URLSearchParams(PARAMS).toString()
      // Lấy client_ID
      const res = await fetch(URL_CLIENT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const RESULT = await res.json()

      // luu vao localStorage
      setClientId(RESULT.data)

      if (RESULT.code === 403) {
        // Nếu lỗi thì lưu lại chuỗi rỗng
        localStorage.setItem(`client_id_<${PAGE_ID}>`, '')
        setInvalidPageId(true)
      } else {
        // Có data thì lưu vào local storage
        localStorage.setItem(`client_id_<${PAGE_ID}>`, RESULT.data)
        setIsInit(true)
      }
    } catch (err) {
    } finally {
      // Tắt loading init client
      setLoading(false)
    }
  }

  /** Hàm đọc data khách hàng */
  const fetchClientData = async (client_id: string, page_id: String | null) => {
    // Set loading staff - Cần fix
    setLoadingStaff(true)

    // Body lấy thông tin Client
    const BODY = {
      client_id: client_id,
      page_id: page_id,
    }
    // Lấy URL
    const URL_READ = new URL(READ_CLIENT_INFO)

    URL_READ.search = new URLSearchParams(BODY as any).toString()

    const RES = await fetchAPI(URL_READ.toString(), 'GET')
    // Lưu tên client
    setClientName(RES?.data?.client_name)

    // Cần check sửa lại
    // Lấy avatar staff từ fb_staff_id
    if (RES?.data?.fb_staff_id) {
      const LINK_AVATAR = apiImage(
        `/app/facebook/avatar/${RES.data.fb_staff_id}?width=64&height=64`
      )

      setStaffAvatar(LINK_AVATAR)
      setLoadingStaff(false)
    }

    // Cần check để sửa lại
    // Lấy Tên nhân viên
    if (RES?.data?.snap_staff?.name) {
      setStaffName(RES.data.snap_staff.name)
      setLoadingStaff(false)
    }
    setLoadingStaff(false)
  }

  return (
    <div className="flex flex-col w-full h-full justify-center items-center ">
      <DetailChat
        onCancel={() => {
          userOutChat(client_id)
        }}
        user_id={client_id}
        onInitClient={(e) => initGetClientId(e)}
        loading_init={loading}
        setLoadingInit={(e) => setLoading(e)}
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
        latest_message={latest_message}
        setIsInit={setIsInit}
        is_init={is_init}
      />
    </div>
  )
}

export default ChatScreen
