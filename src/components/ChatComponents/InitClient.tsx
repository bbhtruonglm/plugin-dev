import React, { useState } from 'react'
interface InitClientProps {
  setUsername: (e: any) => void
  setUserPhone: (e: any) => void
  setUserEmail: (e: any) => void
}
function InitClient({
  setUsername,
  setUserPhone,
  setUserEmail,
}: InitClientProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  return (
    <div className="flex flex-col gap-4 w-full h-full justify-center items-center">
      <div className="flex flex-col gap-4 bg-white w-full py-4 justify-center items-center px-4 rounded-md">
        <input
          onChange={(e) => {
            setName(e.target.value)
            setUsername(e.target.value)
          }}
          value={name}
          onKeyDown={(e) => {}}
          type="text"
          placeholder="Tên của bạn"
          className="bg-inputBg outline-none w-full flex-grow p-3 rounded-md placeholder:text-colorOpacity text-sm font-medium"
        />
        <input
          onChange={(e) => {
            setPhone(e.target.value)
            setUserPhone(e.target.value)
          }}
          value={phone}
          onKeyDown={(e) => {}}
          type="text"
          placeholder="Số điện thoại của bạn"
          className="bg-inputBg outline-none w-full flex-grow p-3 rounded-md placeholder:text-colorOpacity text-sm font-medium"
        />
        <input
          onChange={(e) => {
            setEmail(e.target.value)
            setUserEmail(e.target.value)
          }}
          value={email}
          onKeyDown={(e) => {}}
          type="text"
          placeholder="Email của bạn"
          className="bg-inputBg outline-none w-full flex-grow p-3 rounded-md placeholder:text-colorOpacity text-sm font-medium"
        />
      </div>
      {/* <div
        onClick={() => {
          // call api init client
          // if (!clientId) {
          //   initGetClientId()
          // } else {
          //   setPos('detail')
          //   setPosition('detail')
          // }
        }}
        className="cursor-pointer flex justify-center items-center p-2 bg-white w-full rounded-md font-semibold"
      >
        Xác nhận
      </div> */}
    </div>
  )
}

export default InitClient
