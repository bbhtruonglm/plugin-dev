// import {
//   selectPageId,
//   selectStatusAI,
//   selectStatusPopup,
// } from '@/stores/appSlice'
// import { useEffect, useRef, useState } from 'react'

// import { ReactComponent as Arrow } from '@/assets/Icon_up_circle.svg'
// import { ReactComponent as ArrowSlate } from '@/assets/Icon_up_circle_slate.svg'
// import { ReactComponent as Close } from '@/assets/close.svg'
// import { InputProps } from '../type'
// import Upload from './Upload'
// import { t } from 'i18next'
// import { useAPI } from '@/api/api'
// import { useSelector } from 'react-redux'

// function InputChat({
//   handleSend,
//   loading,
//   error_message,
//   page_name,
//   client_id,
//   setLoading,
// }: InputProps) {
//   /** Tạo ref cho ô input */
//   const INPUT_REF = useRef<HTMLInputElement>(null)
//   /** Trạng thái đóng mở popup */
//   const SHOW_POPUP = useSelector(selectStatusPopup)

//   useEffect(() => {
//     if (SHOW_POPUP) {
//       /** When the popup is open, focus the input */
//       const TIMER = setTimeout(() => {
//         if (INPUT_REF.current) {
//           INPUT_REF.current.focus()
//           INPUT_REF.current.scrollIntoView({ behavior: 'smooth' }) // Đảm bảo input không bị khuất
//         }
//       }, 200) // Delay to ensure layout is stable

//       /** Disable body scroll when popup is open Mobile */
//       document.body.style.overflow = 'hidden'

//       return () => {
//         clearTimeout(TIMER)
//       }
//     } else {
//       /** Enable body scroll when popup is closed Mobile */
//       document.body.style.overflow = 'auto'
//     }
//   }, [SHOW_POPUP])

//   const [value, setValue] = useState('')
//   const [preview_url, setPreviewUrl] = useState<string | null>(null)
//   const [file, setFile] = useState<File | null>(null)

//   const { SEND_MESSAGE_API } = useAPI()

//   /** ID trang được lấy từ store */
//   const PAGE_ID = useSelector(selectPageId)

//   /** Upload file
//    * @param {File | null} file
//    */
//   const uploadFile = async (file: File | null) => {
//     if (file) {
//       /** Set loading */
//       setLoading(true)
//       /** Khởi tạo form data */
//       const FORM_DATA = new FormData()
//       /** Thêm file ảnh vào form */
//       FORM_DATA.append('file', file)
//       /** Thêm các trường còn lại vào form */
//       FORM_DATA.append('page_id', PAGE_ID)
//       FORM_DATA.append('client_id', client_id)

//       /** gửi tin nhắn đi */
//       try {
//         await fetch(SEND_MESSAGE_API, {
//           method: 'POST',
//           body: FORM_DATA,
//         })
//         /** Gửi tin nhắn đi, reset các file */
//         setLoading(false)
//         setFile(null)
//         setPreviewUrl(null)
//       } catch (error) {
//       } finally {
//       }
//     }
//   }

//   /** Cho phép ấn Enter để gửi */
//   const handleKeyDown = (event: any) => {
//     if (event.key === 'Enter' && value) {
//       /** Cho phép ấn enter */
//       event.preventDefault()
//       handleSend(value)
//       setValue('')
//     }
//   }
//   /**Status AI */
//   const AI_STATUS = useSelector(selectStatusAI)

//   return (
//     <div
//       className={`absolute bottom-4 flex justify-center items-center h-12 bg-transparent w-full ${
//         AI_STATUS ? '' : 'px-5'
//       }  gap-2`}
//     >
//       <div className="bg-white w-full flex justify-between gap-2 items-center h-full py-2 px-4 rounded-full">
//         <Upload
//           setPreviewUrl={(e: File) => {
//             /** Lưu file */
//             setFile(e)
//             /** Tạo đối tượng READER */
//             const READER = new FileReader()
//             READER.onload = () => {
//               /** Lưu base64 để preview */
//               setPreviewUrl(READER.result as string)
//             }
//             /** Đọc file dưới dạng URL data */
//             READER.readAsDataURL(e)
//           }}
//         />
//         {/* ô input chat */}
//         <input
//           ref={INPUT_REF}
//           onChange={(e) => {
//             setValue(e.target.value)
//           }}
//           disabled={preview_url ? true : false}
//           value={value}
//           onKeyDown={(e) => {
//             if (!error_message) {
//               handleKeyDown(e)
//             }
//           }}
//           type="text"
//           placeholder={
//             preview_url
//               ? 'Đã chọn 1 ảnh'
//               : t('send_message_to_us') + ' ' + page_name
//           }
//           className="bg-transparent outline-none flex-grow placeholder:text-slate-500 text-sm font-medium"
//         />
//         {/* Preview ảnh */}
//         {!loading && preview_url && (
//           <div className="absolute bottom-16 left-4 bg-white shadow-lg rounded-lg p-1">
//             <div
//               className="flex justify-between cursor-pointer relative"
//               onClick={() => {
//                 /** Xoá Preview url */
//                 setPreviewUrl(null)
//                 setFile(null)
//               }}
//             >
//               <Close className="absolute bg-slate-500 p-1 rounded-full" />
//             </div>
//             <img
//               src={preview_url}
//               alt="Preview"
//               className="w-16 h-16 object-contain  bg-gray-100 rounded-lg"
//             />
//           </div>
//         )}

//         <div>
//           {value || preview_url ? (
//             <div
//               className="cursor-pointer"
//               onClick={() => {
//                 /** Khi không có preview ảnh thì gửi text như bình thường */
//                 if (!loading && !error_message && preview_url === null) {
//                   handleSend(value)
//                   setValue('')
//                 } else {
//                   uploadFile(file)
//                 }
//               }}
//             >
//               <Arrow />
//             </div>
//           ) : (
//             <ArrowSlate />
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

import {
  selectPageId,
  selectStatusAI,
  selectStatusPopup,
} from '@/stores/appSlice'
// export default InputChat
import { useEffect, useRef, useState } from 'react'

import { ReactComponent as Arrow } from '@/assets/Icon_up_circle.svg'
import { ReactComponent as ArrowSlate } from '@/assets/Icon_up_circle_slate.svg'
import { ReactComponent as Close } from '@/assets/close.svg'
import { InputProps } from '../type'
import Upload from './Upload'
import { t } from 'i18next'
import { useAPI } from '@/api/api'
import { useSelector } from 'react-redux'

function InputChat({
  handleSend,
  loading,
  error_message,
  page_name,
  client_id,
  setLoading,
  handleError,
}: InputProps) {
  const INPUT_REF = useRef<HTMLInputElement>(null)
  const SHOW_POPUP = useSelector(selectStatusPopup)

  const [value, setValue] = useState('')
  const [preview_url, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const { SEND_MESSAGE_API } = useAPI()
  const PAGE_ID = useSelector(selectPageId)
  const AI_STATUS = useSelector(selectStatusAI)

  useEffect(() => {
    if (SHOW_POPUP) {
      /**
       * Focus vào input khi popup mở
       */
      const TIMER = setTimeout(() => {
        if (INPUT_REF.current) {
          // Focus vào input khi popup mở
          INPUT_REF.current.focus()
          INPUT_REF.current.scrollIntoView({ behavior: 'smooth' })
        }
      }, 200)

      // Chặn cuộn trang khi popup mở
      document.body.style.overflow = 'hidden'

      return () => {
        clearTimeout(TIMER)
      }
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [SHOW_POPUP])

  const uploadFile = async (file: File | null) => {
    if (file) {
      setLoading(true)
      const FORM_DATA = new FormData()
      FORM_DATA.append('file', file)
      FORM_DATA.append('page_id', PAGE_ID)
      FORM_DATA.append('client_id', client_id)
      console.log(file, 'file')

      // Kiểm tra kích thước file
      if (file.size > 1 * 1024 * 1024) {
        // 1MB = 1 * 1024 * 1024 bytes
        // alert('Ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn 1MB.')
        handleError &&
          handleError('Ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn 1MB.')

        setFile(null)
        setPreviewUrl(null)
        setLoading(false)
        return
      }
      try {
        const RES = await fetch(SEND_MESSAGE_API, {
          method: 'POST',
          body: FORM_DATA,
        })
        console.log(RES, 'res')
        setLoading(false)
        setFile(null)
        setPreviewUrl(null)
      } catch (error) {
        // Handle error
        /** Gửi tin nhắn đi, reset các file
         * Đoạn này cần check lại vì không có xử lý error
         */

        handleError && handleError('Có lỗi xảy ra, vui lòng thử lại sau.')

        setLoading(false)
        setFile(null)
        setPreviewUrl(null)
      }
    }
  }

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter' && value) {
      event.preventDefault()
      handleSend(value)
      setValue('')
    }
  }

  const handleClickPopup = () => {
    // Chắc chắn focus vào input khi popup được mở và người dùng click vào popup
    if (INPUT_REF.current) {
      INPUT_REF.current.focus()
      INPUT_REF.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div
      className={`absolute bottom-4 flex justify-center items-center h-12 bg-transparent w-full ${
        AI_STATUS ? '' : 'px-5'
      } gap-2`}
      onClick={handleClickPopup} // Thêm sự kiện click để trigger focus
    >
      <div className="bg-white w-full flex justify-between gap-2 items-center h-full py-2 px-4 rounded-full">
        <Upload
          setPreviewUrl={(e: File) => {
            setFile(e)
            const READER = new FileReader()
            READER.onload = () => {
              setPreviewUrl(READER.result as string)
            }
            READER.readAsDataURL(e)
          }}
        />
        <input
          ref={INPUT_REF}
          onChange={(e) => setValue(e.target.value)}
          disabled={preview_url ? true : false}
          value={value}
          onKeyDown={(e) => {
            if (!error_message) {
              handleKeyDown(e)
            }
          }}
          id="input-embed-chat"
          type="text"
          placeholder={
            preview_url
              ? 'Đã chọn 1 ảnh'
              : t('send_message_to_us') + ' ' + page_name
          }
          className="bg-transparent outline-none flex-grow placeholder:text-slate-500 text-sm font-medium"
        />
        {!loading && preview_url && (
          <div className="absolute bottom-16 left-4 bg-white shadow-lg rounded-lg p-1">
            <div
              className="flex justify-between cursor-pointer relative"
              onClick={() => {
                setPreviewUrl(null)
                setFile(null)
              }}
            >
              <Close className="absolute bg-slate-500 p-1 rounded-full" />
            </div>
            <img
              src={preview_url}
              alt="Preview"
              className="w-16 h-16 object-contain bg-gray-100 rounded-lg"
            />
          </div>
        )}
        <div>
          {value || preview_url ? (
            <div
              className="cursor-pointer"
              onClick={() => {
                if (!loading && !error_message && preview_url === null) {
                  handleSend(value)
                  setValue('')
                } else {
                  uploadFile(file)
                }
              }}
            >
              <Arrow />
            </div>
          ) : (
            <ArrowSlate />
          )}
        </div>
      </div>
    </div>
  )
}

export default InputChat
