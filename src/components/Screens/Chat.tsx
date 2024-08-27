import React, { useEffect, useState } from 'react'
import { replace, useNavigate } from 'react-router-dom'

import DetailChat from '../ChatComponents/DetailChat'
import { INIT_CLIENT_API } from '../../utils/api'

const INIT_CLIENT = process.env.REACT_APP_INIT_CLIENT_URL
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
  currentPosition,
  setPosition,
  userName,
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

  useEffect(() => {
    // Lấy các tham số từ URL
    const queryParams = new URLSearchParams(window.location.search)
    const page_id = queryParams.get('page_id')
    // console.log(page_id, 'page_id')
    if (page_id) {
      setPageId(page_id)
      // localStorage.setItem(`client_id_<${page_id}>`, '')
      const client_id = localStorage.getItem(`client_id_<${page_id}>`)
      // console.log(client_id, 'client_id')
      if (client_id && client_id !== 'undefined') {
        setClientId(client_id)
      }
      // console.log(client_id, 'client Id')
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
  const [loading, setLoading] = useState(false)

  const initGetClientId = async (e: any) => {
    // console.log('init client ', INIT_CLIENT_API)
    try {
      const url = new URL(INIT_CLIENT_API ?? '')

      //setup params
      const params = e
      url.search = new URLSearchParams(params).toString()
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // Nếu cần token xác thực
        },
      })
      const result = await response.json()

      // luu vao localStorage
      setClientId(result.data)
      // console.log(result, 'data')
      if (result.code === 403) {
        localStorage.setItem(`client_id_<${pageId}>`, '')
        setInvalidPageId(true)
      } else {
        localStorage.setItem(`client_id_<${pageId}>`, result.data)
      }
      // localStorage.setItem(`client_id_<${pageId}>`, '')
    } catch (err) {
    } finally {
      // Tắt loading init client
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full h-full justify-center items-center flex-col">
      {position === 'detail' && (
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
      )}
    </div>
  )
}

export default ChatScreen
