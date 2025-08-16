import { apiImage, fetchAPI, useAPI } from '@/api/api'
import { getCookie, setCookie } from '@/utils'
import {
  selectConsultationGlobal,
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
import { useCallback, useEffect, useRef, useState } from 'react'
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
  /** Trạng thái consultation */
  const GLOBAL_CONSULTATION = useSelector(selectConsultationGlobal)

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
  let stored_client_id =
    typeof window !== 'undefined'
      ? localStorage.getItem(`client_id_${PAGE_ID}`) ?? ''
      : ''
  if (!stored_client_id) {
    stored_client_id = getCookie(`client_id_${PAGE_ID}`) || ''
  }
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
    if (PAGE_ID && stored_client_id && stored_client_id !== 'undefined') {
      setClientId(stored_client_id)
    } else if (PAGE_ID && !AI_STATUS) {
      setClientId('')
    }
  }, [PAGE_ID, stored_client_id])

  /** Fetch client info */
  useEffect(() => {
    /** Nếu có client_id thì mới gọi hàm đọc data khách hàng*/
    if (client_id) fetchClientData(client_id, PAGE_ID)
  }, [client_id])

  /** Token */
  const LATEST_TOKEN = useRef<symbol | null>(null)
  /**
   * Hàm khởi tạo client
   */
  const initGetClientId = useCallback(
    async (
      value: INIT_INPUT & { __token?: symbol; __isLatest?: () => boolean }
    ) => {
      try {
        /** Check nếu không phải request mới nhất thì bỏ */
        if (value.__isLatest && !value.__isLatest()) {
          console.log('⛔️ Bỏ qua vì request cũ:', value.client_id)
          return
        }
        /** Set loading */
        setLoading(true)
        /**
         * Tạo URL
         */
        const URL_CLIENT = new URL(INIT_CLIENT_API)
        /**
         * Tách phần khóa trên URL
         */
        const { __token, __isLatest, ...cleanedParams } = value
        /**
         * Tạo URLSearchParams
         */
        URL_CLIENT.search = new URLSearchParams(cleanedParams as any).toString()

        // URL_CLIENT.search = new URLSearchParams(value as any).toString()
        /**
         * Lấy thống tin client
         */
        const RES = await fetch(URL_CLIENT.toString(), { method: 'GET' })
        /**
         * Parse thống tin
         */
        const RESULT = await RES.json()

        /** Check lại 1 lần nữa sau khi API xong */
        if (value.__isLatest && !value.__isLatest()) {
          console.log('⛔️ Response về chậm, bỏ:', value.client_id)
          return
        }
        /** Nếu code là 403 */
        if (RESULT.code === 403) {
          /** Xóa client_id trong localStorage */
          localStorage.setItem(`client_id_${PAGE_ID}`, '')

          /** Gửi sang SDK , do lỗi nên lưu là rỗng */
          window.parent.postMessage(
            {
              from: 'BBH-EMBED-IFRAME',
              type: 'CLIENT_ID',
              key: `data_embed_chat_${PAGE_ID}`,
              data_embed_chat: {
                client_id: '',
                page_id: PAGE_ID,
              },
            },
            '*'
          )

          /**
           * Set invalid page_id
           */
          setInvalidPageId(true)
          return
        }
        /**
         * Lấy client_id mới
         */
        const NEW_CLIENT_ID = RESULT.data
        /**
         * Lưu client_id mới
         */
        setClientId(NEW_CLIENT_ID)
        /**
         * Lưu client_id mới vào localStorage
         */
        localStorage.setItem(`client_id_${PAGE_ID}`, NEW_CLIENT_ID)
        /** Gửi sang SDK */
        window.parent.postMessage(
          {
            from: 'BBH-EMBED-IFRAME',
            type: 'CLIENT_ID',
            key: `data_embed_chat_${PAGE_ID}`,
            data_embed_chat: {
              client_id: NEW_CLIENT_ID,
              page_id: PAGE_ID,
            },
          },
          '*'
        )

        /**
         * Lưu trạng thái mới init
         */
        dispatch(setStatusIsInit(true))
        /**
         * Lưu client_id mới vào Redux
         */
        dispatch(setGlobalClientId(NEW_CLIENT_ID))
        /** Lưu tên client */
        dispatch(setClientNameStore(value?.name))
        /**
         * Reset user_info
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
         * Lưu client_id mới vào Redux
         */
        if (AI_STATUS) return
        /**
         * Lưu client_id mới vào Redux
         */
        setIsInit(true)
        /** Set invalid page_id */
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
   * Hàm khởi tạo client
   * @param params - Tham số khởi tạo
   */
  const safeInitGetClientId = useCallback(
    (params: INIT_INPUT) => {
      /**
       * Tạo token mới
       */
      const TOKEN = Symbol(params.client_id)
      LATEST_TOKEN.current = TOKEN
      /**
       * Gọi hàm khởi tạo client
       */
      initGetClientId({
        ...params,
        __token: TOKEN,
        __isLatest: () => LATEST_TOKEN.current === TOKEN,
      })
    },
    [initGetClientId]
  )

  useEffect(() => {
    if (
      AI_STATUS &&
      !GLOBAL_CLIENT_ID &&
      PAGE_ID &&
      USER_INFO?.client_id?.trim() &&
      !IS_VIEW_SCREEN
    ) {
      /**
       * Gọi hàm khởi tạo client
       */
      safeInitGetClientId({
        page_id: PAGE_ID,
        client_id: USER_INFO.client_id,
      })
    }
  }, [
    AI_STATUS,
    GLOBAL_CLIENT_ID,
    PAGE_ID,
    USER_INFO,
    IS_VIEW_SCREEN,
    // GLOBAL_CONSULTATION,
  ])

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
    if (HAS_VALID_USER && !stored_client_id && !AI_STATUS) {
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
  }, [stored_client_id, USER_INFO, AI_STATUS])

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
