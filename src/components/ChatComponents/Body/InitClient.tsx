import { useEffect, useState } from 'react'

import { InitClientProps } from '../type'
import Input from './Input'
import Loading from '@/components/Loading/Loading'
import { selectLoadingGlobal } from '@/stores/appSlice'
import { t } from 'i18next'
import { useSelector } from 'react-redux'

function InitClient({ resetData, onInitClient }: InitClientProps) {
  /** Loading Global */
  const LOADING_GLOBAL = useSelector(selectLoadingGlobal)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [email_error, setEmailError] = useState('')
  const [phone_error, setPhoneError] = useState('')
  const [name_error, setNameError] = useState('')

  useEffect(() => {
    if (resetData) {
      setEmail('')
      setName('')
      setPhone('')
      setEmailError('')
      setPhoneError('')
      setNameError('')
    }
  }, [resetData])

  /** Kiếm tra regex email */
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  /** Kiếm tra regex sđt vn */
  const VN_PHONE_REGEX =
    /^(?:\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])\d{7}$/
  /** Kiếm tra regex sđt uk */
  const UK_PHONE_REGEX = /^(?:\+44|44|0)7\d{9}$/

  /** Hàm xử lý thay đổi email
   * @param {any} e
   */
  const handleEmailChange = (e: any) => {
    const value = e.target.value
    setEmail(value)

    if (!value || EMAIL_REGEX.test(value)) {
      setEmailError('')
    } else {
      setEmailError(t('invalid_format_email'))
    }
  }
  /** Hàm xử lý thay đổi sdt */
  const handlePhoneChange = (e: any) => {
    const value = e.target.value
    setPhone(value)

    if (!value) {
      setPhoneError(t('input_data')) // Thông báo bắt buộc nhập số điện thoại
    } else if (VN_PHONE_REGEX.test(value) || UK_PHONE_REGEX.test(value)) {
      setPhoneError('')
    } else {
      setPhoneError(t('invalid_format_phone'))
    }
  }
  /** Hàm xử lý thay đổi tên */
  const handleNameChange = (e: any) => {
    const value = e.target.value
    setName(value)

    if (!value) {
      setNameError(t('input_data')) // Thông báo bắt buộc nhập tên
    } else {
      setNameError('')
    }
  }
  /**  Hàm kiểm tra còn lỗi không
   * @returns {boolean} true: 1 trong các điều kiện không thoả man
   * false: Tất cả điều kiện đều thoả mãn
   *
   */
  const isButtonDisabled = () => {
    return !name || !phone || phone_error || name_error || email_error
  }

  return (
    <div className="flex flex-col gap-4 w-full h-full justify-center items-center">
      {LOADING_GLOBAL ? (
        <div className={`flex w-full justify-center items-center h-60`}>
          <Loading />
        </div>
      ) : (
        <div className="flex flex-col w-full gap-4 h-full justify-center items-center">
          <div className="flex flex-col gap-4 bg-white w-full py-4 justify-center items-center px-4 rounded-md">
            <div className="w-full">
              <Input
                title={t('your_name')}
                placeholder={t('input_your_name')}
                required
                type="text"
                onChange={handleNameChange}
              />
              {name_error && (
                <span className="text-xs text-red-600">{name_error}</span>
              )}
            </div>

            <div className="w-full">
              <Input
                title={t('your_phone')}
                placeholder={t('input_your_phone')}
                required
                type="tel"
                onChange={handlePhoneChange}
              />
              {phone_error && (
                <span className="text-xs text-red-600">{phone_error}</span>
              )}
            </div>

            <div className="w-full">
              <Input
                title={'Email'}
                placeholder={t('input_your_email')}
                required={false}
                type="email"
                onChange={handleEmailChange}
              />
              {email_error && (
                <span className="text-xs text-red-600">{email_error}</span>
              )}
            </div>
          </div>

          <button
            className={`text-white ${
              isButtonDisabled()
                ? 'bg-slate-400 cursor-not-allowed'
                : ' bg-black'
            } rounded-md px-4 py-2 text-sm font-medium`}
            // disabled={isButtonDisabled()}
            onClick={() => {
              if (!isButtonDisabled()) {
                onInitClient({
                  name,
                  phone,
                  email,
                })
              }
            }}
          >
            {t('start_to_chat')}
          </button>
        </div>
      )}
    </div>
  )
}

export default InitClient
