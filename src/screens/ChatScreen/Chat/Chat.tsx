import { apiImage, fetchAPI, useAPI } from '@/api/api'
import {
  selectGlobalClientId,
  selectIsViewScreen,
  selectPageId,
  selectStatusAI,
  selectUserInfo,
  setClientNameStore,
  setGlobalClientId,
  setStatusIsInit,
  setUserInfo,
} from '@/stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

import { ChatProps } from '../type'
import DetailChat from '@/components/ChatComponents/DetailChat'

/**
 * Kiểu dữ liệu khởi tạo input
 */
type INIT_INPUT = {
  /**
   * ID trang
   */
  page_id: string
  /**
   * ID user = client_id
   */
  client_id?: string
  /**
   * Tên khách hàng
   */
  name?: string
  /**
   * Số điện thoại
   */
  phone?: string
  /**
   * Email
   */
  email?: string
}
function ChatScreen({
  userOutChat,
  error_message,
  setHideForMobile,
  page_name,
  employee_list,
  invalid_page_id_parent,
}: ChatProps) {
  /** Lấy API từ useAPI */
  const { INIT_CLIENT_API, READ_CLIENT_INFO } = useAPI()
  /** ID trang được lấy từ store */
  const PAGE_ID = useSelector(selectPageId)
  /** Lấy thông tin user từ store */
  const USER_INFO = useSelector(selectUserInfo)
  /** IS View screen */
  const IS_VIEW_SCREEN = useSelector(selectIsViewScreen)
  /** Lấy dữ liệu từ store */
  const dispatch = useDispatch()
  /** State client ID */
  const [client_id, setClientId] = useState<String | null | any>('')
  /** State báo sai page_id */
  const [invalid_page_id, setInvalidPageId] = useState<undefined | boolean>(
    undefined
  )
  /** State loading init client */
  const [loading, setLoading] = useState(false)
  /** State avatar nhân viên */
  const [staff_avatar, setStaffAvatar] = useState(null as any)
  /** State tên nhân viên */
  const [staff_name, setStaffName] = useState(null as any)
  /** State loading staff*/
  const [loading_staff, setLoadingStaff] = useState(false)
  /**  State tên khách hàng*/
  const [client_name, setClientName] = useState(null as any)
  /**  State khởi tạo xong*/
  const [is_init, setIsInit] = useState(false)
  /** AI_STATUS */
  const AI_STATUS = useSelector(selectStatusAI)
  /** Hàm khởi tạo client id */
  const CLIENT_ID = localStorage.getItem(`client_id_${PAGE_ID}`)
  /** Global client id */
  const GLOBAL_CLIENT_ID = useSelector(selectGlobalClientId)
  /** Hàm lý tập báo sai page_id*/
  useEffect(() => {
    /** Phải có giá trị invalid thì mới cập nhật */
    if (invalid_page_id_parent !== undefined)
      setInvalidPageId(invalid_page_id_parent)
  }, [invalid_page_id_parent])

  useEffect(() => {
    /** Nếu có page_id thì mới xử lý tiếp */
    if (PAGE_ID) {
      /** Nếu có CLIENT_ID thì set CLIENT_ID */
      if (CLIENT_ID && CLIENT_ID !== 'undefined') {
        setClientId(CLIENT_ID)
      } else {
        if (!AI_STATUS) {
          setClientId('')
        }
      }
    }
  }, [PAGE_ID, CLIENT_ID])
  /** Hàm lấy dữ liệu khách hàng*/
  useEffect(() => {
    /** Nếu có client_id thì mới gọi hàm đọc data khách hàng*/
    if (client_id) {
      /** Có client_id thì Gọi hàm đọc data khách hàng */
      fetchClientData(client_id, PAGE_ID)
    }
  }, [client_id])

  /** hàm khởi tạo client id
   * @param {Object} value - Đối tượng chứa các tham số cần chuyển đổi thành chuỗi query string
   */
  const initGetClientId = async (value: INIT_INPUT) => {
    try {
      /** Tạo đối tượng URL từ chuỗi init URL client */
      const URL_CLIENT = new URL(INIT_CLIENT_API)

      /**
       * Lấy các tham số từ một đối tượng property và gán chúng vào URL.
       * Chuyển đổi `PARAMS` thành chuỗi truy vấn và thêm vào `URL_CLIENT`.
       *
       * @param {Object} value - Đối tượng chứa các tham số cần chuyển đổi thành chuỗi query string
       * @type {string} URL_CLIENT.search - Chuỗi query string mới được gán vào `URL_CLIENT.search`
       *
       * @example
       * const value = { page: 1, sort: 'asc' };
       * const PARAMS = value;
       * URL_CLIENT.search = new URLSearchParams(PARAMS).toString();
       * // URL_CLIENT.search sẽ là "page=1&sort=asc"
       */
      const PARAMS = value

      /**
       * Gán chuỗi truy vấn vào URL
       */
      URL_CLIENT.search = new URLSearchParams(PARAMS).toString()
      /** Lấy client_ID */
      const RES = await fetch(URL_CLIENT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      /**
       * Chuyển đổi dữ liệu trả về thành JSON
       */
      const RESULT = await RES.json()

      /** luu vao localStorage */
      setClientId(RESULT.data)

      /**
       *  Nếu lỗi 403 thì lưu lại chuỗi rỗng
       */
      if (RESULT.code === 403) {
        /** Nếu lỗi thì lưu lại chuỗi rỗng */
        localStorage.setItem(`client_id_${PAGE_ID}`, '')
        /**
         * Báo lỗi page_id không hợp lệ
         */
        setInvalidPageId(true)
      } else {
        /** Có data thì lưu vào local storage */
        localStorage.setItem(`client_id_${PAGE_ID}`, RESULT.data)
        // localStorage.setItem(`client_id_<${PAGE_ID}>`, '6131478076934694')
        /**
         * Set status init client thành true
         */
        dispatch(setStatusIsInit(true))
        console.log('RESULT.data', RESULT.data)
        /**
         * Set global client id
         */
        dispatch(setGlobalClientId(RESULT.data))
        /** Lưu tên client vào store */
        dispatch(setClientNameStore(value?.name))

        /**
         * Xoá báo lỗi page_id không hợp lệ
         */
        setInvalidPageId(false)

        /**
         * Sau khi khởi tạo client thì xoá hết thông tin trong store
         */
        dispatch(
          setUserInfo({
            user_name: '',
            user_phone: '',
            user_email: '',
            client_id: '',
          })
        )
        /**
         * Nếu là AI_STATUS thì return
         */
        if (AI_STATUS) return
        /**
         * Set is init thành true
         */
        setIsInit(true)
      }
    } catch (err) {
    } finally {
      /** Tắt loading init client */
      setLoading(false)
    }
  }
  /**
   * Nếu là case AI_STATUS và chưa có CLIENT_ID
   */
  useEffect(() => {
    console.log('CHẠY VÀO ĐÂY USER_INFO', USER_INFO)
    console.log(CLIENT_ID, 'CHẠY VÀO ĐÂY CLLIENT ID')

    /**
     * Kiểm tra USER_INFO có chứa ít nhất một giá trị thực
     */
    const HAS_VALID_VALUE = USER_INFO && USER_INFO.client_id?.trim()

    /**
     * Nếu là case AI_STATUS và chưa có CLIENT_ID
     */
    if (
      AI_STATUS &&
      !GLOBAL_CLIENT_ID &&
      PAGE_ID &&
      HAS_VALID_VALUE &&
      !IS_VIEW_SCREEN
    ) {
      /**
       * Gọi hàm khởi tạo client id
       */
      const PARAMS: INIT_INPUT = { page_id: PAGE_ID }
      /**
       * Nếu có client_id thì thêm vào PARAMS
       */
      if (USER_INFO?.client_id) {
        /**
         * Thêm client_id vào PARAMS
         */
        PARAMS.client_id = USER_INFO.client_id
      }
      console.log('CHẠY VÀO ĐÂY')
      /**
       * Gọi hàm khởi tạo client id
       */
      initGetClientId(PARAMS)
    }
  }, [AI_STATUS, GLOBAL_CLIENT_ID, PAGE_ID, USER_INFO, IS_VIEW_SCREEN])

  useEffect(() => {
    /**
     * Kiểm tra USER_INFO có chứa ít nhất một giá trị thực
     */
    const HAS_VALID_VALUE =
      USER_INFO &&
      (USER_INFO.user_name?.trim() ||
        USER_INFO.user_phone?.trim() ||
        USER_INFO.user_email?.trim() ||
        USER_INFO.client_id?.trim())

    /**
     * Nếu có USER_INFO và chưa có CLIENT_ID
     */
    if (HAS_VALID_VALUE && !CLIENT_ID && !AI_STATUS) {
      /**
       * Gọi hàm khởi tạo client id
       */
      const PARAMS: INIT_INPUT = {
        page_id: PAGE_ID,
        ...(USER_INFO?.user_name && { name: USER_INFO.user_name }),
        ...(USER_INFO?.user_phone && { phone: USER_INFO.user_phone }),
        ...(USER_INFO?.user_email && { email: USER_INFO.user_email }),
      }
      /**
       * Nếu có client_id thì thêm vào PARAMS
       */
      if (USER_INFO?.client_id) {
        /**
         * Thêm client_id vào PARAMS
         */
        PARAMS.client_id = USER_INFO.client_id

        setClientId(USER_INFO.client_id)
      }

      /**
       * Gọi hàm khởi tạo client id
       */
      initGetClientId(PARAMS)
    }
  }, [CLIENT_ID, USER_INFO, AI_STATUS])

  /** Hàm đọc data khách hàng
   * @param {string} client_id - ID khách hàng
   * @param {string} page_id - ID trang
   *
   */
  const fetchClientData = async (client_id: string, page_id: String | null) => {
    /** Set loading staff - Cần fix */
    setLoadingStaff(true)

    /** Body lấy thông tin Client */
    const BODY = {
      client_id: client_id,
      page_id: page_id,
    }
    /** Lấy URL */
    const URL_READ = new URL(READ_CLIENT_INFO)
    /**
     * Gán chuỗi truy vấn vào URL
     */
    URL_READ.search = new URLSearchParams(BODY as any).toString()

    /** Lấy thông tin client */
    const RES = await fetchAPI(URL_READ.toString(), 'GET')

    /** Lưu tên client */
    setClientName(RES?.data?.client_name)

    /** Lấy avatar staff từ fb_staff_id */
    if (RES?.data?.fb_staff_id) {
      const LINK_AVATAR = apiImage(
        `/app/facebook/avatar/${RES.data.fb_staff_id}?width=64&height=64`
      )
      /**
       * Set avatar nhân viên
       */
      setStaffAvatar(LINK_AVATAR)
      /**
       * Tắt loading staff
       */
      setLoadingStaff(false)
    }

    /** Lấy Tên nhân viên */
    if (RES?.data?.snap_staff?.name) {
      /**
       * Set tên nhân viên
       */
      setStaffName(RES.data.snap_staff.name)
      /**
       * Tắt loading staff
       */
      setLoadingStaff(false)
    }
    /**
     * Tắt loading staff
     */
    setLoadingStaff(false)
  }

  return (
    <div className="flex flex-col w-full h-full justify-center items-center ">
      <DetailChat
        onCancel={() => {
          userOutChat(client_id)
        }}
        user_id={client_id}
        onInitClient={(e: INIT_INPUT) => initGetClientId(e)}
        loading_init={loading}
        setLoadingInit={(e: boolean) => setLoading(e)}
        invalid_page_id={invalid_page_id}
        onResetInput={() => setInvalidPageId(false)}
        error_message={error_message}
        setHideForMobile={setHideForMobile}
        page_name={page_name}
        staff_avatar={staff_avatar}
        staff_name={staff_name}
        loading_staff={loading_staff}
        client_name={client_name}
        employee_list={employee_list}
        is_init={is_init}
        setIsInit={() => setIsInit(false)}
      />
    </div>
  )
}

export default ChatScreen

// import { ChatProps } from '../type'
// import DetailChat from '@/components/ChatComponents/DetailChat'
// import { useChatClient } from './useChatClient'

// function ChatScreen({
//   userOutChat,
//   error_message,
//   setHideForMobile,
//   page_name,
//   employee_list,
//   invalid_page_id_parent,
// }: ChatProps) {
//   const {
//     client_id,
//     initGetClientId,
//     loading,
//     setLoading,
//     invalid_page_id,
//     setInvalidPageId,
//     staff_avatar,
//     staff_name,
//     loading_staff,
//     client_name,
//     is_init,
//     setIsInit,
//   } = useChatClient(invalid_page_id_parent)

//   return (
//     <div className="flex flex-col w-full h-full justify-center items-center">
//       <DetailChat
//         onCancel={() => userOutChat(client_id)}
//         user_id={client_id}
//         onInitClient={initGetClientId}
//         loading_init={loading}
//         setLoadingInit={setLoading}
//         invalid_page_id={invalid_page_id}
//         onResetInput={() => setInvalidPageId(false)}
//         error_message={error_message}
//         setHideForMobile={setHideForMobile}
//         page_name={page_name}
//         staff_avatar={staff_avatar}
//         staff_name={staff_name}
//         loading_staff={loading_staff}
//         client_name={client_name}
//         employee_list={employee_list}
//         is_init={is_init}
//         setIsInit={() => setIsInit(false)}
//       />
//     </div>
//   )
// }

// export default ChatScreen
