import React, { useEffect, useState } from 'react'

import DetailChat from '../ChatComponents/DetailChat'

interface ChatProps {
  currentPosition: string
  setPosition: (e: string) => void
  userName: string
}
function ChatScreen({ currentPosition, setPosition, userName }: ChatProps) {
  const [position, setPos] = useState('overview')
  // const [clientId, setClientId] = useState('679be5049cac4e2e9caadfee547ff7eb')
  const [pageId, setPageId] = useState('3861367970af4b7cadacaec5d1443473')
  const [clientId, setClientId] = useState(() => {
    // Lấy ID từ localStorage khi component được tạo
    return localStorage.getItem(`client_id_<${pageId}>`) || ''
  })

  useEffect(() => {
    // Lưu ID vào localStorage khi nó thay đổi
    if (clientId) {
      localStorage.setItem(`client_id_<${pageId}>`, clientId)
      setPos('detail')
      setPosition('detail')
    }
  }, [clientId])
  const initGetClientId = async () => {
    try {
      const response = await fetch(
        'https://dev-api.botbanhang.vn/v1/n7_public/embed/conversation/init_identify?page_id=3861367970af4b7cadacaec5d1443473',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const result = await response.json()
      // Test thi luu vao state
      // sau khi test xong thi luu vao localStorage
      setClientId(result.data)
      // console.log(result, 'json')
    } catch (err) {}
  }

  return (
    <div className="flex w-full h-full justify-center items-center flex-col">
      {position === 'overview' && !clientId && (
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
      )}
      {position === 'detail' && (
        <DetailChat
          onCancel={() => {
            setPos('overview')
            setPosition('overview')
          }}
          userId={clientId}
        />
      )}
    </div>
  )
}

export default ChatScreen
