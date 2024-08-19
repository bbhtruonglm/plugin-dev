import React, { useEffect, useState } from 'react'
interface InitClientProps {
  setUsername: (e: any) => void
  setUserPhone: (e: any) => void
  setUserEmail: (e: any) => void
  resetData: boolean
  onError: (e: boolean) => void
}
function InitClient({
  setUsername,
  setUserPhone,
  setUserEmail,
  resetData,
  onError,
}: InitClientProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  useEffect(() => {
    if (resetData) {
      setEmail('')
      setName('')
      setPhone('')
    }
  }, [resetData])
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  useEffect(() => {
    if (!emailError && !phoneError) {
      onError(false)
    } else {
      onError(true)
    }
  }, [emailError, phoneError])

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  // const vietnamesePhoneRegex = /^(?:\+84|84|0)(?:3|5|7|8|9)([0-9]{8,9})$/
  // const ukPhoneRegex = /^(?:\+44|44|0)(?:7\d{3}|\d{4})\d{6}$/

  const vietnamesePhoneRegex =
    /^(?:\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])\d{7}$/
  const ukPhoneRegex = /^(?:\+44|44|0)7\d{9}$/

  const handleEmailChange = (e: any) => {
    const value = e.target.value
    setEmail(value)

    setUserEmail(value)
    if (!value || emailRegex.test(value)) {
      setEmailError('')
    } else {
      setEmailError('Sai định dạng email')
    }
  }

  const handlePhoneChange = (e: any) => {
    const value = e.target.value
    setPhone(value)
    setUserPhone(value)
    if (
      !value ||
      vietnamesePhoneRegex.test(value) ||
      ukPhoneRegex.test(value)
    ) {
      setPhoneError('')
    } else {
      setPhoneError('Sai định dạng số điện thoại')
    }
  }

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
        <div className="w-full">
          <input
            onChange={(e) => {
              // setPhone(e.target.value)
              handlePhoneChange(e)
            }}
            value={phone}
            onKeyDown={(e) => {}}
            type="text"
            placeholder="Số điện thoại của bạn"
            className={`bg-inputBg w-full flex-grow p-3 rounded-md placeholder:text-colorOpacity text-sm font-medium 
            ${phoneError ? ' border-red-600 border' : ' outline-none '}  `}
          />
          {phoneError && (
            <span className="text-xs text-red-600">{phoneError}</span>
          )}
        </div>
        <div className="w-full">
          <input
            onChange={(e) => {
              // setEmail(e.target.value)
              setUserEmail(e.target.value)
              handleEmailChange(e)
            }}
            value={email}
            onKeyDown={(e) => {}}
            type="text"
            placeholder="Email của bạn"
            className={`bg-inputBg w-full flex-grow p-3 rounded-md placeholder:text-colorOpacity text-sm font-medium 
            ${emailError ? ' border-red-600 border' : ' outline-none '}  `}
          />
          {emailError && (
            <span className="text-xs text-red-600">{emailError}</span>
          )}
        </div>
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
