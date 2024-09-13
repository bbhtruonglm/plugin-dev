import { useEffect, useState } from 'react'

import DetailChat from 'components/ChatComponents/DetailChat'
import { useAPI } from 'utils/api'
import { useNavigate } from 'react-router-dom'

// import { INIT_CLIENT_API } from '../../utils/api'

interface ChatProps {
  currentPosition: string
  setPosition: (e: string) => void
  userName: string
  userLoggedIn: (e: any) => void
  errorMessage: String | null
  onError: () => void
  setHide?: () => void
  currentW: Number | null
}
function ChatScreen({
  userLoggedIn,
  errorMessage,
  onError,
  setHide,
  currentW,
}: ChatProps) {
  const [position, setPos] = useState('detail')
  const [pageId, setPageId] = useState<String | null>('')
  const navigate = useNavigate()
  const [clientId, setClientId] = useState<String | null | any>('')
  const [invalidPageId, setInvalidPageId] = useState(false)
  const [loading, setLoading] = useState(false)
  const { INIT_CLIENT_API } = useAPI()

  useEffect(() => {
    // Lấy các tham số từ URL
    const QUERY_PARAMS = new URLSearchParams(window.location.search)
    const PAGE_ID = QUERY_PARAMS.get('page_id')
    // console.log(page_id, 'page_id')
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
  const initGetClientId = async (e: any) => {
    try {
      // Tạo url
      const URL_CLIENT = new URL(INIT_CLIENT_API ?? '')

      //setup params
      const PARAM = e
      URL_CLIENT.search = new URLSearchParams(PARAM).toString()
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
          userLoggedIn(clientId)
        }}
        userId={clientId}
        onInitClient={(e) => initGetClientId(e)}
        loadingInit={loading}
        setLoadingInit={(e) => setLoading(e)}
        pageId={pageId}
        invalidPageId={invalidPageId}
        onResetInput={() => setInvalidPageId(false)}
        errorMessage={errorMessage}
        onError={onError}
        setHide={setHide}
        currentW={currentW}
      />
    </div>
  )
}

export default ChatScreen
