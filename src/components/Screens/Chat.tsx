import React, { useEffect, useState } from 'react'
import { replace, useNavigate } from 'react-router-dom'

import DetailChat from '../ChatComponents/DetailChat'

interface ChatProps {
  currentPosition: string
  setPosition: (e: string) => void
  userName: string
  userLoggedIn: (e: any) => void
}
function ChatScreen({
  currentPosition,
  setPosition,
  userName,
  userLoggedIn,
}: ChatProps) {
  const [position, setPos] = useState('detail')
  const [pageId, setPageId] = useState<String | null>('')
  const navigate = useNavigate()
  const [clientId, setClientId] = useState<String | null | any>('')
  useEffect(() => {
    // Lấy các tham số từ URL
    const queryParams = new URLSearchParams(window.location.search)
    const page_id = queryParams.get('page_id')

    setPageId(page_id)
    // localStorage.setItem(`client_id_<${page_id}>`, '')
    const client_id = localStorage.getItem(`client_id_<${page_id}>`)
    setClientId(client_id)
  }, [])

  useEffect(() => {
    // Cập nhật URL với client_id
    // console.log(clientId, 'mmmmmmmmmm')
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
    try {
      const url = new URL(
        'https://dev-api.botbanhang.vn/v1/n7_public/embed/conversation/init_identify'
      )

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
      // console.log(result, 'json')
      localStorage.setItem(`client_id_<${pageId}>`, result.data)
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
        />
      )}
    </div>
  )
}

export default ChatScreen
