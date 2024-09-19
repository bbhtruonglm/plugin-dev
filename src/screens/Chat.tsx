import { apiImage, fetchAPI, useAPI } from '@/api/api'
import { useEffect, useState } from 'react'

import DetailChat from '@/components/ChatComponents/DetailChat'
import { useNavigate } from 'react-router-dom'

interface ChatProps {
  userOutChat: (e?: any) => void
  error_message: String | null
  onError: () => void
  setHideForMobile?: () => void
  current_width: number
  page_name?: string
  employee_list?: { fb_staff_id: string; is_online: boolean }[]
}
function ChatScreen({
  userOutChat,
  error_message,
  setHideForMobile,
  current_width,
  page_name,
  employee_list,
}: ChatProps) {
  const navigate = useNavigate()
  const [page_id, setPageId] = useState<string>('')
  const [client_id, setClientId] = useState<String | null | any>('')
  const [invalid_page_id, setInvalidPageId] = useState(false)
  const [loading, setLoading] = useState(false)
  const { INIT_CLIENT_API, READ_PAGE_INFO, READ_CLIENT_INFO } = useAPI()
  const [staff_avatar, setStaffAvatar] = useState(null as any)
  const [staff_name, setStaffName] = useState(null as any)
  const [loading_staff, setLoadingStaff] = useState(false)
  const [client_name, setClientName] = useState(null as any)

  useEffect(() => {
    /**
     * Lấy các tham số truy vấn từ URL hiện tại.
     * Sử dụng đối tượng `URLSearchParams` để phân tích các tham số trong chuỗi truy vấn của URL.
     * @type {URLSearchParams}
     *
     * @example
     * // Giả sử URL là: https://example.com?page=1&sort=asc
     * const QUERY_PARAMS = new URLSearchParams(window.location.search);
     * console.log(QUERY_PARAMS.get('page')); // Outputs: '1'
     * console.log(QUERY_PARAMS.get('sort')); // Outputs: 'asc'
     */
    const QUERY_PARAMS = new URLSearchParams(window.location.search)

    /** page_id được lấy từ params */
    const PAGE_ID = QUERY_PARAMS.get('page_id')
    // Nếu có page_id thì mới xử lý tiếp
    if (PAGE_ID) {
      setPageId(PAGE_ID)
      // console.log(PAGE_ID, 'check')
      // fetchPageData(PAGE_ID)
      // Tạo client Id = page_id từ cha
      const CLIENT_ID = localStorage.getItem(`client_id_<${PAGE_ID}>`)
      // Có CLIENT_ID mới set vào state
      if (CLIENT_ID && CLIENT_ID !== 'undefined') {
        setClientId(CLIENT_ID)
      }
    }
  }, [])

  useEffect(() => {
    // Cập nhật URL với client_id

    if (client_id) {
      // Lấy ra URL
      const newUrl = new URL(window.location.href)
      // Thêm client_id vào params
      newUrl.searchParams.set('client_id', client_id)
      fetchClientData(client_id, page_id)
      // add url mới
      navigate(`/${newUrl.search}`)
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
        localStorage.setItem(`client_id_<${page_id}>`, '')
        setInvalidPageId(true)
      } else {
        // Có data thì lưu vào local storage
        localStorage.setItem(`client_id_<${page_id}>`, RESULT.data)
      }
    } catch (err) {
    } finally {
      // Tắt loading init client
      setLoading(false)
    }
  }

  /** Hàm đọc data khách hàng */
  const fetchClientData = async (client_id: string, page_id: string) => {
    setLoadingStaff(true)
    const BODY = {
      client_id: client_id,
      page_id: page_id,
    }
    const URL_READ = new URL(READ_CLIENT_INFO)

    URL_READ.search = new URLSearchParams(BODY as any).toString()

    const RES = await fetchAPI(URL_READ.toString(), 'GET')
    setClientName(RES?.data?.client_name)
    if (RES?.data?.fb_staff_id) {
      const LINK_AVATAR = apiImage(
        `/app/facebook/avatar/${RES.data.fb_staff_id}?width=64&height=64`
      )
      console.log(LINK_AVATAR, 'LINK_AVATAR')

      setStaffAvatar(LINK_AVATAR)
      setLoadingStaff(false)
    }
    if (RES?.data?.snap_staff?.name) {
      setStaffName(RES.data.snap_staff.name)
      setLoadingStaff(false)
    }
    setLoadingStaff(false)
    console.log(RES, 'RES client')
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
        page_id={page_id}
        invalid_page_id={invalid_page_id}
        onResetInput={() => setInvalidPageId(false)}
        error_message={error_message}
        setHideForMobile={setHideForMobile}
        current_width={current_width}
        page_name={page_name}
        staff_avatar={staff_avatar}
        staff_name={staff_name}
        loading_staff={loading_staff}
        client_name={client_name}
        employee_list={employee_list}
      />
    </div>
  )
}

export default ChatScreen
