// import {
//   selectLoadingGlobal,
//   selectShowForm,
//   selectUserInfo,
// } from '@/stores/appSlice'
// import { useEffect, useState } from 'react'

// import { InitClientProps } from '../type'
// import Input from './Input'
// import Loading from '@/components/Loading/Loading'
// import { isEmpty } from 'lodash'
// import { t } from 'i18next'
// import { useSelector } from 'react-redux'

// function InitClient({ resetData, onInitClient }: InitClientProps) {
//   /** Loading Global */
//   const LOADING_GLOBAL = useSelector(selectLoadingGlobal)
//   /** Lấy thông tin user từ store */
//   const USER_INFO = useSelector(selectUserInfo)

//   /**
//    * State tên
//    */
//   const [name, setName] = useState('')
//   /**
//    * State sđt
//    */
//   const [phone, setPhone] = useState('')
//   /**
//    * State email
//    */
//   const [email, setEmail] = useState('')
//   /**
//    * State lỗi email
//    */
//   const [email_error, setEmailError] = useState('')
//   /**
//    * State lỗi sđt
//    */
//   const [phone_error, setPhoneError] = useState('')
//   /**
//    * State lỗi tên
//    */
//   const [name_error, setNameError] = useState('')
//   /**
//    * Effect lấy thông tin user từ store
//    */
//   useEffect(() => {
//     /**
//      * Nếu user info không rỗng
//      */
//     if (!isEmpty(USER_INFO)) {
//       /**
//        * Set giá trị cho name
//        */
//       setName(USER_INFO?.user_name)
//       /**
//        * Set giá trị cho phone
//        */
//       setPhone(USER_INFO?.user_phone)
//       /**
//        * Set giá trị cho email
//        */
//       setEmail(USER_INFO?.user_email)
//     }
//   }, [USER_INFO])

//   useEffect(() => {
//     /**
//      * Nếu resetData = true
//      */
//     if (resetData) {
//       /**
//        * Set giá trị cho email
//        */
//       setEmail('')
//       /**
//        * Set giá trị cho name
//        */
//       setName('')
//       /**
//        * Set giá trị cho phone
//        */
//       setPhone('')
//       /**
//        * Set lỗi cho email
//        */
//       setEmailError('')
//       /**
//        * Set lỗi cho phone
//        */
//       setPhoneError('')
//       /**
//        * Set lỗi cho name
//        */
//       setNameError('')
//     }
//   }, [resetData])

//   /** Kiếm tra regex email */
//   const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

//   /** Kiếm tra regex sđt vn */
//   const VN_PHONE_REGEX =
//     /^(?:\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])\d{7}$/
//   /** Kiếm tra regex sđt uk */
//   const UK_PHONE_REGEX = /^(?:\+44|44|0)7\d{9}$/

//   /** Hàm xử lý thay đổi email
//    * @param {any} e
//    */
//   const handleEmailChange = (e: any) => {
//     /**
//      * Lấy giá trị từ input
//      */
//     const VALUE = e.target.value
//     /**
//      * Set giá trị email
//      */
//     setEmail(VALUE)
//     /**
//      * Nếu không có giá trị hoặc giá trị tho
//      */
//     if (!VALUE || EMAIL_REGEX.test(VALUE)) {
//       /**
//        * Set lỗi email
//        */
//       setEmailError('')
//     } else {
//       /**
//        * Set lỗi email
//        */
//       setEmailError(t('invalid_format_email'))
//     }
//   }
//   /** Hàm xử lý thay đổi sdt
//    * @param {any} e
//    */
//   const handlePhoneChange = (e: any) => {
//     /**
//      * Lấy giá trị từ input
//      */
//     const VALUE = e.target.value
//     /**
//      * Set giá trị sđt
//      */
//     setPhone(VALUE)
//     /**
//      * Nếu không có giá trị hoặc giá trị tho
//      */
//     if (!VALUE) {
//       /**
//        * Set lỗi sđt
//        * Thông báo bắt buộc nhập số điện thoại
//        */
//       setPhoneError(t('input_data'))
//     } else if (VN_PHONE_REGEX.test(VALUE) || UK_PHONE_REGEX.test(VALUE)) {
//       /**
//        * Set lỗi sđt
//        */
//       setPhoneError('')
//     } else {
//       /**
//        * Set lỗi sđt
//        */
//       setPhoneError(t('invalid_format_phone'))
//     }
//   }
//   /** Hàm xử lý thay đổi tên
//    * @param {any} e
//    */
//   const handleNameChange = (e: any) => {
//     /**
//      * Lấy giá trị từ input
//      */
//     const VALUE = e.target.value
//     /**
//      * Set giá trị tên
//      */
//     setName(VALUE)
//     /**
//      *  Nếu không có giá trị hoặc giá trị tho
//      */
//     if (!VALUE) {
//       /**
//        * Set lỗi tên
//        * Thông báo bắt buộc nhập tên
//        */
//       setNameError(t('input_data'))
//     } else {
//       /**
//        * Set lỗi tên
//        */
//       setNameError('')
//     }
//   }
//   /**  Hàm kiểm tra còn lỗi không
//    * @returns {boolean} true: 1 trong các điều kiện không thoả man
//    * false: Tất cả điều kiện đều thoả mãn
//    *
//    */
//   const isButtonDisabled = () => {
//     return !name || !phone || phone_error || name_error || email_error
//   }
//   /**
//    * show init client từ store
//    */
//   const FORM_BEFORE_CHAT = useSelector(selectShowForm)

//   return (
//     <div className="flex flex-col gap-4 w-full h-full justify-center items-center">
//       {LOADING_GLOBAL ? (
//         <div className={`flex w-full justify-center items-center h-60`}>
//           <Loading />
//         </div>
//       ) : (
//         <div className="flex flex-col w-full gap-4 h-full justify-center items-center">
//           <div className="flex flex-col gap-4 bg-white w-full py-4 justify-center items-center px-4 rounded-md">
//             <div className="w-full">
//               <Input
//                 title={t('your_name')}
//                 placeholder={t('input_your_name')}
//                 required
//                 value_input={name}
//                 type="text"
//                 onChange={handleNameChange}
//               />
//               {name_error && (
//                 <span className="text-xs text-red-600">{name_error}</span>
//               )}
//             </div>

//             <div className="w-full">
//               <Input
//                 title={t('your_phone')}
//                 placeholder={t('input_your_phone')}
//                 required
//                 value_input={phone}
//                 type="tel"
//                 onChange={handlePhoneChange}
//               />
//               {phone_error && (
//                 <span className="text-xs text-red-600">{phone_error}</span>
//               )}
//             </div>

//             <div className="w-full">
//               <Input
//                 title={'Email'}
//                 placeholder={t('input_your_email')}
//                 required={false}
//                 value_input={email}
//                 type="email"
//                 onChange={handleEmailChange}
//               />
//               {email_error && (
//                 <span className="text-xs text-red-600">{email_error}</span>
//               )}
//             </div>
//           </div>

//           <button
//             className={`text-white ${
//               isButtonDisabled()
//                 ? 'bg-slate-400 cursor-not-allowed'
//                 : ' bg-black'
//             } rounded-md px-4 py-2 text-sm font-medium`}
//             // disabled={isButtonDisabled()}
//             onClick={() => {
//               if (!isButtonDisabled()) {
//                 onInitClient({
//                   name,
//                   phone,
//                   email,
//                 })
//               }
//             }}
//           >
//             {t('start_to_chat')}
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

// export default InitClient
import {
  selectLoadingGlobal,
  selectShowForm,
  selectUserInfo,
} from '@/stores/appSlice'
import { useEffect, useState } from 'react'

import { InitClientProps } from '../type'
import Input from './Input'
import Loading from '@/components/Loading/Loading'
import { isEmpty } from 'lodash'
import { t } from 'i18next'
import { useSelector } from 'react-redux'

function InitClient({ resetData, onInitClient }: InitClientProps) {
  /** Loading Global */
  const LOADING_GLOBAL = useSelector(selectLoadingGlobal)
  /** Lấy thông tin user từ store */
  const USER_INFO = useSelector(selectUserInfo)
  /** show init client từ store */
  const FORM_BEFORE_CHAT = useSelector(selectShowForm)
  /** Form values */
  const [form_values, setFormValues] = useState<Record<string, string>>({})
  /** Form errors */
  const [form_errors, setFormErrors] = useState<Record<string, string>>({})

  /** Pre-fill nếu có dữ liệu từ store */
  useEffect(() => {
    if (!isEmpty(USER_INFO)) {
      setFormValues((prev) => ({
        ...prev,
        name: USER_INFO?.user_name || t('anonymous'),
        phone: USER_INFO?.user_phone || '',
        email: USER_INFO?.user_email || '',
      }))
    }
  }, [USER_INFO])
  /** Reset data */
  useEffect(() => {
    if (resetData) {
      setFormValues({})
      setFormErrors({})
    }
  }, [resetData])
  /** Handle change
   * @param field: string
   * @param value: string
   */
  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: '' }))
  }
  /**
   *  Validate form
   * @returns  true/false
   */
  const validate = () => {
    /**
     * Danh sách lỗi
     */
    const ERRORS: Record<string, string> = {}
    /**
     * Danh sách trên form
     */
    FORM_BEFORE_CHAT?.data?.forEach((field) => {
      if (field.is_active && field.is_require && !form_values[field.field]) {
        ERRORS[field.field] = t('input_data')
      }
    })
    /**
     * Set lỗi
     */
    setFormErrors(ERRORS)
    /**danh sach lỗi trả về*/
    return Object.keys(ERRORS).length === 0
  }
  /** Trạng thái disable */
  const isButtonDisabled = () => {
    return !validate()
  }
  /**
   *  Render input type
   * @param field
   * @returns
   */
  const renderInputType = (field: string) => {
    if (field === 'EMAIL') return 'email'
    if (field === 'PHONE') return 'tel'
    return 'text'
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
            {FORM_BEFORE_CHAT?.data?.map((field, idx) => {
              if (!field.is_active) return null

              return (
                <div
                  className="w-full"
                  key={idx}
                >
                  <Input
                    title={field.title}
                    placeholder={field.placeholder}
                    required={field.is_require}
                    value_input={form_values[field.field] || ''}
                    type={renderInputType(field.field)}
                    onChange={(e: any) =>
                      handleChange(field.field, e.target.value)
                    }
                  />
                  {form_errors[field.field] && (
                    <span className="text-xs text-red-600">
                      {form_errors[field.field]}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <button
            className={`text-white ${
              Object.keys(form_errors).length > 0
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-black'
            } rounded-md px-4 py-2 text-sm font-medium`}
            onClick={() => {
              if (validate()) {
                if (isEmpty(USER_INFO)) {
                  onInitClient({
                    user_name: t('anonymous'),
                  })
                  return
                }
                onInitClient(form_values)
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
