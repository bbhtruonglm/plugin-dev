import { useEffect, useState } from 'react'

import DetailChat from 'components/ChatComponents/DetailChat'
import { useAPI } from 'utils/api'
import { useNavigate } from 'react-router-dom'

interface ChatProps {
  userOutChat: (e?: any) => void
  error_message: String | null
  onError: () => void
  setHideForMobile?: () => void
  current_width: Number | null
}
function ChatScreen({
  userOutChat,
  error_message,
  setHideForMobile,
  current_width,
}: ChatProps) {
  const [pageId, setPageId] = useState<String | null>('')
  const navigate = useNavigate()
  const [clientId, setClientId] = useState<String | null | any>('')
  const [invalidPageId, setInvalidPageId] = useState(false)
  const [loading, setLoading] = useState(false)
  const { INIT_CLIENT_API } = useAPI()

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

    if (clientId) {
      // Lấy ra URL
      const newUrl = new URL(window.location.href)
      // Thêm client_id vào params
      newUrl.searchParams.set('client_id', clientId)

      // add url mới
      navigate(`/${newUrl.search}`)
    }
  }, [clientId])

  /** hàm khởi tạo client id */
  const initGetClientId = async (value: any) => {
    try {
      /** Tạo đối tượng URL từ chuỗi init URL client */
      const URL_CLIENT = new URL(INIT_CLIENT_API ?? '')

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
        localStorage.setItem(`client_id_<${pageId}>`, '')
        setInvalidPageId(true)
      } else {
        // Có data thì lưu vào local storage
        localStorage.setItem(`client_id_<${pageId}>`, RESULT.data)
      }
    } catch (err) {
    } finally {
      // Tắt loading init client
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full h-full justify-center items-center ">
      <DetailChat
        onCancel={() => {
          userOutChat(clientId)
        }}
        user_id={clientId}
        onInitClient={(e) => initGetClientId(e)}
        loading_init={loading}
        setLoadingInit={(e) => setLoading(e)}
        page_id={pageId}
        invalid_page_id={invalidPageId}
        onResetInput={() => setInvalidPageId(false)}
        error_message={error_message}
        setHideForMobile={setHideForMobile}
        current_width={current_width}
      />
    </div>
  )
}

export default ChatScreen
