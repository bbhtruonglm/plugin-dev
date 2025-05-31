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
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

/**
 * Kiểu dữ liệu khởi tạo input
 */
export type INIT_INPUT = {
  /**
   * ID trang
   */
  page_id: string
  /**
   * ID user = client_id
   */
  client_id?: string
  /**
   * Tên user
   */
  name?: string
  /**
   * Sđt user
   */
  phone?: string
  /**
   * Email user
   */
  email?: string
}

export function useChatClient(invalid_page_id_parent?: boolean) {
  /** Hook dispatch để gửi action lên Redux */
  const dispatch = useDispatch()

  /** Lấy các endpoint API từ custom hook useAPI */
  const { INIT_CLIENT_API, READ_CLIENT_INFO } = useAPI()

  /** ID của page hiện tại (dùng để lưu và lấy client_id từ localStorage) */
  const PAGE_ID = useSelector(selectPageId)

  /** Thông tin user được nhập từ form hoặc từ ngoài truyền vào */
  const USER_INFO = useSelector(selectUserInfo)

  /** Trạng thái cho biết hệ thống đang ở chế độ AI */
  const AI_STATUS = useSelector(selectStatusAI)

  /** Trạng thái đang xem màn hình view (không phải chat) */
  const IS_VIEW_SCREEN = useSelector(selectIsViewScreen)

  /** Client ID toàn cục lưu trong Redux */
  const GLOBAL_CLIENT_ID = useSelector(selectGlobalClientId)

  /** Client ID đang được sử dụng trong hook */
  const [client_id, setClientId] = useState<string | null | any>('')

  /** Cờ kiểm tra page_id có hợp lệ hay không */
  const [invalid_page_id, setInvalidPageId] = useState<boolean | undefined>(
    undefined
  )

  /** Trạng thái loading khi khởi tạo hoặc xử lý client */
  const [loading, setLoading] = useState(false)

  /** Ảnh đại diện của nhân viên hỗ trợ */
  const [staff_avatar, setStaffAvatar] = useState<string | null | any>(
    null as any
  )

  /** Tên của nhân viên hỗ trợ */
  const [staff_name, setStaffName] = useState<string | null | any>(null as any)

  /** Trạng thái loading khi đang lấy thông tin nhân viên */
  const [loading_staff, setLoadingStaff] = useState(false)

  /** Tên của client (người dùng cuối) */
  const [client_name, setClientName] = useState<string | null | any>(
    null as any
  )

  /** Trạng thái cho biết đã khởi tạo client_id hay chưa */
  const [is_init, setIsInit] = useState(false)

  /** Lấy client_id từ localStorage (nếu có) theo page_id */
  const CLIENT_ID =
    typeof window !== 'undefined'
      ? localStorage.getItem(`client_id_${PAGE_ID}`) ?? ''
      : ''

  /** Handle invalid page_id */
  useEffect(() => {
    /** Phải có giá trị invalid thì mới cập nhật */
    if (invalid_page_id_parent !== undefined) {
      setInvalidPageId(invalid_page_id_parent)
    }
  }, [invalid_page_id_parent])

  /** Set client_id from localStorage */
  useEffect(() => {
    /** Nếu có page_id thì mới xử lý tiếp
     *  Nếu có CLIENT_ID thì set CLIENT_ID
     */
    if (PAGE_ID && CLIENT_ID && CLIENT_ID !== 'undefined') {
      setClientId(CLIENT_ID)
    } else if (PAGE_ID && !AI_STATUS) {
      setClientId('')
    }
  }, [PAGE_ID, CLIENT_ID])

  /** Fetch client info */
  useEffect(() => {
    /** Nếu có client_id thì mới gọi hàm đọc data khách hàng*/
    if (client_id) fetchClientData(client_id, PAGE_ID)
  }, [client_id])

  /** AI mode init client */
  useEffect(() => {
    /**
     * Kiểm tra USER_INFO có chứa ít nhất một giá trị thực
     */
    const HAS_VALID_USER = USER_INFO && USER_INFO?.client_id?.trim()
    if (
      AI_STATUS &&
      !GLOBAL_CLIENT_ID &&
      PAGE_ID &&
      HAS_VALID_USER &&
      !IS_VIEW_SCREEN
    ) {
      const PARAMS: INIT_INPUT = {
        page_id: PAGE_ID,
        client_id: USER_INFO.client_id,
      }
      /**
       * Gọi hàm khởi tạo client id
       */
      initGetClientId(PARAMS)
    }
  }, [AI_STATUS, GLOBAL_CLIENT_ID, PAGE_ID, USER_INFO, IS_VIEW_SCREEN])

  /** Normal user init client */
  useEffect(() => {
    /**
     * Kiểm tra USER_INFO có chứa ít nhất một giá trị thực
     */
    const HAS_VALID_USER =
      USER_INFO &&
      (USER_INFO.user_name?.trim() ||
        USER_INFO.user_phone?.trim() ||
        USER_INFO.user_email?.trim() ||
        USER_INFO.client_id?.trim())
    /**
     * Nếu có USER_INFO và chưa có CLIENT_ID
     */
    if (HAS_VALID_USER && !CLIENT_ID && !AI_STATUS) {
      /**
       * Gọi hàm khởi tạo client id
       */
      const PARAM: INIT_INPUT = {
        page_id: PAGE_ID,
        ...(USER_INFO.user_name && { name: USER_INFO.user_name }),
        ...(USER_INFO.user_phone && { phone: USER_INFO.user_phone }),
        ...(USER_INFO.user_email && { email: USER_INFO.user_email }),
        ...(USER_INFO.client_id && { client_id: USER_INFO.client_id }),
      }
      /**
       * Nếu có client_id thì thêm vào PARAMS
       */
      if (USER_INFO.client_id) setClientId(USER_INFO.client_id)
      initGetClientId(PARAM)
    }
  }, [CLIENT_ID, USER_INFO, AI_STATUS])

  /** Init client id */
  const initGetClientId = useCallback(
    async (value: INIT_INPUT) => {
      try {
        /** Set loading */
        setLoading(true)
        /** Tạo đối tượng URL từ chuỗi init URL client */
        const URL_CLIENT = new URL(INIT_CLIENT_API)
        /**
         * Gán chuỗi truy vấn vào URL
         */
        URL_CLIENT.search = new URLSearchParams(value as any).toString()
        /** Lấy client_ID */
        const RES = await fetch(URL_CLIENT.toString(), { method: 'GET' })
        /** Chuyển đổi dữ liệu trả về thành JSON*/
        const RESULT = await RES.json()
        /**  Nếu lỗi 403 thì lưu lại chuỗi rỗng*/
        if (RESULT.code === 403) {
          /** Nếu lỗi thì lưu lại chuỗi rỗng */
          localStorage.setItem(`client_id_${PAGE_ID}`, '')
          /** Báo lỗi page_id không hợp lệ*/
          setInvalidPageId(true)
          return
        }
        /** Client Id */
        const NEW_CLIENT_ID = RESULT.data
        /** Lưu client_id */
        localStorage.setItem(`client_id_${PAGE_ID}`, NEW_CLIENT_ID)
        /** Set status init client thành true*/
        dispatch(setStatusIsInit(true))
        /** Set global client id*/
        dispatch(setGlobalClientId(NEW_CLIENT_ID))
        /** Lưu tên client vào store */
        dispatch(setClientNameStore(value?.name))
        /** Sau khi khởi tạo client thì xoá hết thông tin trong store*/
        dispatch(
          setUserInfo({
            user_name: '',
            user_phone: '',
            user_email: '',
            client_id: '',
          })
        )

        /** luu vao state */
        setClientId(NEW_CLIENT_ID)
        /** Set is init thành true*/
        setIsInit(true)
        /** Xoá báo lỗi page_id không hợp lệ*/
        setInvalidPageId(false)
      } catch (err) {
        console.error('initGetClientId error:', err)
      } finally {
        setLoading(false)
      }
    },
    [INIT_CLIENT_API, dispatch, PAGE_ID]
  )
  /**
   * Hàm lấy dữ liệu client
   * @param {string} client_id - ID client
   * @param {string} page_id - ID trang
   */
  const fetchClientData = useCallback(
    async (client_id: string, page_id: string | null) => {
      try {
        /** Set loading staff - Cần fix */
        setLoadingStaff(true)
        /** Lấy URL */
        const URL_READ = new URL(READ_CLIENT_INFO)
        /** Gán chuỗi truy vấn vào URL*/
        URL_READ.search = new URLSearchParams({
          client_id,
          page_id,
        } as any).toString()
        /** Lấy thông tin client */
        const RES = await fetchAPI(URL_READ.toString(), 'GET')
        /** Lưu tên client */
        setClientName(RES?.data?.client_name || null)
        /** Lấy avatar staff từ fb_staff_id */
        if (RES?.data?.fb_staff_id) {
          const avatar = apiImage(
            `/app/facebook/avatar/${RES.data.fb_staff_id}?width=64&height=64`
          )
          /** Set avatar nhân viên*/
          setStaffAvatar(avatar)
        }
        /** Lấy Tên nhân viên */
        if (RES?.data?.snap_staff?.name) {
          /** Set tên nhân viên*/
          setStaffName(RES.data.snap_staff.name)
        }
      } catch (err) {
        console.error('fetchClientData error:', err)
      } finally {
        /** Tắt loading staff*/
        setLoadingStaff(false)
      }
    },
    [READ_CLIENT_INFO]
  )

  return {
    client_id,
    initGetClientId,
    loading,
    setLoading,
    invalid_page_id,
    setInvalidPageId,
    staff_avatar,
    staff_name,
    loading_staff,
    client_name,
    is_init,
    setIsInit,
  }
}
