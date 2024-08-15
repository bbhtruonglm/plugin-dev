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
  // const [clientId, setClientId] = useState('679be5049cac4e2e9caadfee547ff7eb')
  const [pageId, setPageId] = useState('3861367970af4b7cadacaec5d1443473')
  const [clientId, setClientId] = useState(() => {
    // Lấy ID từ localStorage khi component được tạo
    return localStorage.getItem(`client_id_<${pageId}>`) || ''
    // return ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Lưu ID vào localStorage khi nó thay đổi
    if (clientId) {
      localStorage.setItem(`client_id_<${pageId}>`, clientId)
      // localStorage.setItem(`client_id_<${pageId}>`, '')
      setPos('detail')
      setPosition('detail')
    }
  }, [clientId])
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
      console.log(result, 'json')
    } catch (err) {
    } finally {
      console.log('finally')
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    }
  }

  return (
    <div className="flex w-full h-full justify-center items-center flex-col">
      {/* {position === 'overview' && !clientId && (
        <div
          onClick={() => {
            // call api init client
            if (!clientId) {
              initGetClientId()
            } else {
              setPos('detail')
              setPosition('detail')
            }
          }}
          className="cursor-pointer flex justify-center items-center border-2 p-4 bg-red-50 rounded-md"
        >
          Start to Chat
        </div>
      )} */}
      {/* <InitClient /> */}
      {position === 'detail' && (
        <DetailChat
          onCancel={() => {
            // setPos('overview')
            // setPosition('overview')
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
