import React, { useEffect, useState } from 'react'

import DetailChat from '../ChatComponents/DetailChat'
import InitClient from '../ChatComponents/InitClient'

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
  const [pageId, setPageId] = useState('3861367970af4b7cadacaec5d1443473')

  const [clientId, setClientId] = useState(() => {
    // Lấy ID từ localStorage khi component được tạo
    return localStorage.getItem(`client_id_<${pageId}>`) || ''
    // return ''
  })
  const [loading, setLoading] = useState(false)

  const initGetClientId = async (e: any) => {
    console.log(e, 'eeeee')
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
    } catch (err) {
    } finally {
      setTimeout(() => {
        // Tắt loading init client
        setLoading(false)
      }, 1000)
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
        />
      )}
    </div>
  )
}

export default ChatScreen
