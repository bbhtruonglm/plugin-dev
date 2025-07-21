import { fetchAPI, useAPI } from '../api/api'
import { parsedString, postMessageToParent } from '../utils'
import {
  resetConversation,
  selectEmbedPosition,
  selectEmbedPositionDetail,
  selectPageId,
  setActiveAiAgent,
  setAiMessageAutoSend,
  setClientNameStore,
  setConsultationGlobal,
  setCurrentHeight,
  setCurrentUserId,
  setCurrentWidth,
  setCustomBackground,
  setFixedDataClient,
  setGlobalClientId,
  setGlobalUnreadCount,
  setIsAvatar,
  setIsViewScreen,
  setLatestMessageGlobal,
  setListAiRenderText,
  setListCTAMessage,
  setListMessage,
  setLoadingGlobal,
  setNoAiId,
  setNoViewport,
  setOrgAllowLogo,
  setPageAvatar,
  setPageId,
  setPageInfoAI,
  setPageLogo,
  setPageLogoBlack,
  setRefreshData,
  setShowForm,
  setShowHome,
  setShowSupportStaff,
  setStatusIsAI,
  setStatusPopup,
  setSuggestMessage,
  setUserInfo,
} from '../stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

import WIDGET from 'bbh-chatbox-widget-js-sdk'
import i18next from 'i18next'

export function useApp() {
  /**
   * @type {Object} API - API lấy thông tin khách hàng
   * @type {string} READ_CLIENT_INFO - URL API lấy thông tin khách hàng
   */
  const { READ_CLIENT_INFO, READ_PAGE_INFO, ID_WIDGET, DATA_WIDGET } = useAPI()

  useEffect(() => {
    /** Load WIDGET nếu trang hiện tại là trang AI Assistant*/
    if (
      window.location.pathname.includes('/ai-assistant') ||
      window.location.pathname.includes('/active-sdk')
    ) {
      try {
        /** Bật chế độ debug */
        WIDGET.debugOn()

        if (DATA_WIDGET && DATA_WIDGET.APP?.trim()) {
          /** Load WIDGET */
          WIDGET.load(ID_WIDGET, DATA_WIDGET)
        } else {
          /** Load WIDGET */
          WIDGET.load(ID_WIDGET)
        }
      } catch (error) {
        console.error('Lỗi khi giải mã token:', error)
      }
    } else {
      console.warn('Không phải trang AI Assistant, bỏ qua việc load WIDGET')
    }
    /** Chạy 1 lần khi component mount */
  }, [])
  /**
   *  Hàm giải mã dữ liệu khách hàng
   * @returns {Promise<Object>} - Dữ liệu khách hàng
   */
  const decodeClientData = async () => {
    WIDGET.onEvent(async (e: any, value: any) => {
      /**
       * Nếu là tin nhắn từ khách hàng thì gửi tin nhắn suggest
       * Tạm thời không dùng return tránh bị lỗi phần còn lại
       */
      if (value?.type === 'CLIENT_MESSAGE') {
        return
      } else {
        /** dispatch để reset data */
        dispatch(setRefreshData(true))
        /** Xoá danh sách tin nhắn */
        dispatch(setListMessage([]))
        /** Xoá tin nhắn mới nhất */
        dispatch(setLatestMessageGlobal(null))
        /** Reset lại client_id Mỗi khi phát hiện có sự kiện mới */
        dispatch(setGlobalClientId(''))
        /** Reset tin nhắn suggest */
        dispatch(setSuggestMessage(''))
        /** setLoading global là true */
        dispatch(setLoadingGlobal(true))
        /** ghi lại thông tin khách hàng mới */
        let client = await WIDGET.getClientInfo()

        console.log('CHẠY VÀO ĐÂY USER_INFO hàm decode', client)
        /** PAGE_ID mới*/
        const N_PAGE_ID = client?.public_profile?.ai_agent_id

        dispatch(
          setCurrentUserId(client?.public_profile?.current_user_id || '')
        )

        /** nếu không có ai_agent_id thì setNoAiId(true)*/
        if (!N_PAGE_ID) {
          /** Set No AI ID store*/
          dispatch(setNoAiId(true))
          return
        }

        /** ID khách hàng mới */
        const N_CLIENT_ID =
          client?.public_profile?.page_id +
          '__' +
          client?.public_profile?.fb_client_id

        /** Reset lại client_id */
        localStorage.setItem(`client_id_${N_PAGE_ID}`, '')

        console.log('CHẠY VÀO ĐÂY USER_INFO hàm refresh', client)

        /** Gửi tin nhắn Cập nhật lại client_id*/
        dispatch(
          setUserInfo({
            user_name: '',
            user_email: '',
            user_phone: '',
            client_id: N_CLIENT_ID,
          })
        )
      }
    })
  }

  /**
   * Hàm giải mã dữ liệu khách hàng
   * @returns {Promise<Object>} - Dữ liệu khách hàng
   */
  const decodeInitClientData = async () => {
    /** khai báo biến lưu trữ dữ liệu khách hàng + init dữ liệu lần đầu */
    let client = await WIDGET.getClientInfo()

    /** Trả về client */
    return client
  }

  /** Lấy thông tin vị trí */
  const POSITION = useSelector(selectEmbedPosition)

  /** Vị trí chi tiết của chatbox */
  const POSITION_DETAIL = useSelector(selectEmbedPositionDetail)

  /** Trạng thái hiển thị Popup */
  const [is_show, setShow] = useState(false)

  /** Trạng thái hiển thị Popup tư vấn */
  const [type_consultation, setTypeConsultation] = useState(false)
  /** Page_id được lưu trong Store */
  const PAGE_ID = useSelector(selectPageId)
  /** Client_id được lưu trong localStorage theo Page_id */
  const CLIENT_ID = localStorage.getItem(`client_id_<${PAGE_ID}>`)
  /** Dispatch */
  const dispatch = useDispatch()

  /** Hàm xử lý thông điệp postMessage từ parent - mobile
   * @param {MessageEvent} event - Sự kiện tin nhắn
   */
  const handleMessage = async (event: MessageEvent) => {
    /** @type {Object} PAYLOAD - Dữ liệu từ event */
    let PAYLOAD: any

    // console.log('EVENT::', event)
    try {
      /** Nếu event.data là string, cố gắng parse nó */
      PAYLOAD =
        typeof event.data === 'string' ? JSON.parse(event.data) : event.data
    } catch (error) {
      console.error('Lỗi khi parse event.data:', error)
      return
    }
    /**
     * @type {string} user_name - Tên người dùng
     * @type {string} user_email - Email người dùng
     * @type {string} user_phone - Số điện thoại người dùng
     * @type {string} client_id - ID người dùng
     * @type {string} from - Nguồn gửi tin nhắn
     * @type {string} action - Hành động từ app cha
     * @type {string} locale - Ngôn ngữ
     */
    const {
      user_name,
      user_email,
      user_phone,
      client_id,
      from,
      action,
      type,
      locale,
      reset_conversation,
      reset_page_id,
    } = PAYLOAD

    /** Nếu từ chatbox và là tin nhắn từ khách hàng thì gửi tin nhắn suggest
     * AI_AGENT
     * */
    if (from === 'CHATBOX' && type === 'CLIENT_MESSAGE') {
      dispatch(setSuggestMessage(PAYLOAD?.payload?.message))
    }

    /** Check tin nhắn tự động từ Web hoặc mobile
     * Mở trợ lý ảo và và tự động gửi tin nhắn Cho Trợ lý ảo
     */
    if (
      type === 'AI.SEND_TEXT_FROM_MOBILE' ||
      type === 'AI.SEND_TEXT_FROM_WEBSITE'
    ) {
      /**
       * Gửi tin nhắn tư vấn
       */
      dispatch(setAiMessageAutoSend(PAYLOAD?.payload?.text))
    }
    /**
     * Nếu từ parent-app-preview
     * Trang Preview xem Trước
     */
    if (from === 'parent-app-preview') {
      /**
       * Nếu trạng thái auto thì fix lại theo setting page
       */
      if (locale === 'auto') {
        /**
         * Lấy cài đặt trang
         */
        const PAGE_SETTING = await fetchPageSetting(reset_page_id)
        /**
         * Chế độ ngôn ngữ trang
         */
        const WEB_LANGUAGE = PAGE_SETTING?.web_language
        /**
         * Ngôn ngữ trang
         */
        const PAGE_LANGUAGE = PAGE_SETTING?.page_language
        /**
         * Ngôn ngữ Mặc định của trang
         */
        const DEFAULT_LANGUAGE = PAGE_SETTING?.default_language

        /**
         * Ngôn ngữ Mặc định
         */
        const DEFAULT_LANGUAGE_CONFIG = 'vi'

        /** Khai báo biến lưu trữ ngôn ngữ */
        let embed_locale
        /**
         * Kiem tra xem WEB_LANGUAGE co hop le khong
         */
        switch (true) {
          /**
           * Nếu trạng thái mặc định sẽ lấy theo field default_language (Trong Setting)
           * hoặc Default config
           */
          case DEFAULT_LANGUAGE:
            embed_locale = DEFAULT_LANGUAGE || DEFAULT_LANGUAGE_CONFIG
            break
          /**
           * Nếu không có case nào thoả mã thì lấy mặc định (fix cứng Tiếng việt)
           */
          default:
            embed_locale = DEFAULT_LANGUAGE_CONFIG
            break
        }
        console.log(embed_locale, 'EMBED_LOCALE')
        /**
         *  Cập nhật ngôn ngữ vào i18next
         */
        await i18next.changeLanguage(embed_locale)
      }
      /**
       * Nếu ngôn ngữ khác mặc định thì cập nhật ngôn ngữ
       */
      if (locale && locale !== 'auto') {
        /**
         *  Cập nhật ngôn ngữ vào i18next
         */
        await i18next.changeLanguage(locale)
      }
      /**
       * Nếu reset conversation thì xóa client_id trong localStorage
       * va reset conversation
       */
      if (reset_conversation) {
        /**
         * Xóa client_id trong localStorage
         */
        localStorage?.removeItem(`client_id_${reset_page_id}`)

        /**
         * Reset conversation
         */
        dispatch(resetConversation())

        dispatch(setClientNameStore(undefined))
      }
    }

    /** Kiểm tra thông tin từ app cha
     * Trang chủ Retion hoặc BotBanHang
     */
    if (from === 'parent-app') {
      console.log(
        'Nhận tin nhắn từ app cha. Thông tin nhận được là:',
        event.data
      )
      /**
       * Nếu có action thì hiển thị popup
       */
      if (action) {
        /**
         * Lưu kiểu type_consultation là true để hiển thị popup tư vấn
         */
        setTypeConsultation(true)
        /** Lưu vào store */
        dispatch(setConsultationGlobal(true))
        /**
         * Kiểm tra xem popup đã mở chưa
         */
        if (!is_show) {
          /**
           * Nếu mở chỉ reset tin nhắn mới nhất trong store
           */
          dispatch(setListMessage([]))
          /**
           *  Hiển thị popup
           */
          setShow(true)
        }
        return
      }

      /** Lưu thông tin user vào store
       * Chỉ lưu thông tin nếu có giá trị
       */
      dispatch(
        setUserInfo({
          ...(user_name && { user_name }),
          ...(user_email && { user_email }),
          ...(user_phone && { user_phone }),
          ...(client_id && { client_id }),
        })
      )
      dispatch(setFixedDataClient(true))
    }
  }

  useEffect(() => {
    /** Thêm event listener cho thông điệp */
    window.addEventListener('message', handleMessage)
    /** Hàm giải mã dữ liệu khách hàng*/
    decodeClientData()

    /** Hàm cleanup */
    return () => {
      /** Xóa event listener */
      window.removeEventListener('message', handleMessage)
      /** Hàm giải má dữ liệu khách hàng */
      decodeClientData()
    }
  }, [])
  /**
   * Gọi Hàm Lấy dự liệu setting Trang
   * @param page_id id trang
   * @returns
   */
  const fetchPageSetting = async (page_id: string) => {
    /** Tạo đối tượng URL */
    const URL_READ = new URL(READ_PAGE_INFO)
    /**
     * Thêm search vào URLs
     */
    URL_READ.search = new URLSearchParams({ page_id }).toString()
    /**
     * Lấy thông tin trang
     */
    const RES = await fetchAPI(URL_READ.toString(), 'GET')

    /**
     * Trả về cài đặt trang
     */
    return RES?.data
  }

  useEffect(() => {
    /**
     * Hàm lấy dữ liệu
     */
    const fetchData = async () => {
      try {
        /** Lấy url của page cha */
        const FULL_SRC = window.location.href
        /** URL_PARENT - URL của page cha đúng dạng URL*/
        const URL_PARENT = new URL(FULL_SRC)
        /** URL_PARAMS - Tham số của URL */
        const URL_PARAMS = new URLSearchParams(window.location.search)

        /** Lấy page_id */
        const STORED_PAGE_ID = URL_PARENT.searchParams.get('page_id') || null

        /**
         * Fix cứng với page_id 860086820907512 của khách cần hotfix
         * se Update lại
         */
        if (STORED_PAGE_ID === '860086820907512') {
          // if (STORED_PAGE_ID === '388339911461476') {
          /** Lưu trạng thái logo trong store*/
          dispatch(setOrgAllowLogo(true))
          /** Lưu logo trong store */
          dispatch(setPageLogo('./images/Logo_AIG.svg'))
          /** Lưu logo black trong store */
          dispatch(setPageLogoBlack('./images/AIG_white.png'))
          // dispatch(setPageLogo(''))
        }

        /** Kiểm tra xem có phải AI không*/
        const IS_AI = URL_PARENT?.pathname.includes('ai-assistant')
        /** Kiểm tra xem có phải view screen */
        const IS_VIEW_SCREEN = URL_PARENT?.pathname.includes('view-screen')

        /** Lưu trạng thái AI vào store*/
        dispatch(setStatusIsAI(IS_AI))

        /** Lưu trạng thái view screen vào store */
        dispatch(setIsViewScreen(IS_VIEW_SCREEN))

        /** Cập nhật trạng thái hiển thị popup
         * Nếu có AI hoặc view screen thì luôn mở popup
         */
        setShow(IS_AI || IS_VIEW_SCREEN)
        /** Khai báo cài đặt trang */
        let page_setting = {} as any

        /** Nếu có page_id ====> call API Lấy cài đặt trang */
        if (STORED_PAGE_ID) {
          page_setting = await fetchPageSetting(STORED_PAGE_ID)
        }
        /** Trạng thái mở popup lần đầu */
        if (!IS_AI && !IS_VIEW_SCREEN) {
          const AUTO_OPEN_INIT = page_setting?.auto_open || false

          /** Cập nhật trạng thái */
          setShow(AUTO_OPEN_INIT)
        }
        /** Trạng thái không phải AI */
        if (!IS_AI) {
          /** Lưu cài đặt background từ setting */
          const CUSTOM_BACKGROUND = page_setting?.custom_background || false
          /** Lưu cài đặt background vào store */
          dispatch(setCustomBackground(CUSTOM_BACKGROUND))
          /** Lưu cái đặt CTA message từ setting */
          // const CUSTOM_CTA_MESSAGE = page_setting?.custom_cta_message
          /** Lưu cài đặt CTA message vào store */
          dispatch(
            setListCTAMessage(
              page_setting?.custom_cta_message || {
                is_active: false,
                data: {
                  vi: [
                    'Chat với AI',
                    'Tư vấn giải pháp',
                    'Hỗ trợ cài đặt',
                    'Liên hệ cho tôi',
                  ],
                  en: [
                    'Chat with AI',
                    'Solve your problem',
                    'Support setting',
                    'Contact me',
                  ],
                },
              }
            )
          )
        }
        /** Lưu dũe liệu ai_render_text */
        dispatch(
          setListAiRenderText(
            page_setting?.ai_render_text || {
              is_active: false,
              data: {
                vi: [
                  'Đang xử lý',
                  'AI đang phân tích',
                  'AI đang chạy',
                  'AI đang tìm kiếm',
                  'AI đang chạy',
                  'AI đang tìm kiếm',
                ],
                en: [
                  'AI is processing',
                  'AI is analyzing',
                  'AI is running',
                  'AI is searching',
                  'AI is running',
                  'AI is searching',
                ],
              },
            }
          )
        )

        /**  Lấy ngôn ngữ từ trình duyệt*/
        const BROWSER_LANGUAGE = navigator.language || navigator.languages[0]

        /** Nếu chỉ cần mã ngôn ngữ chính (không có region) */
        const PRIMARY_LANGUAGE = BROWSER_LANGUAGE.split('-')[0]
        console.log(PRIMARY_LANGUAGE) // Ví dụ: "vi", "en", "ja"

        /** Trạng thái hình thị avatar*/
        const IS_AVATAR = page_setting?.is_use_persona_id
        /** Avatar trang*/
        const PAGE_AVATAR = page_setting?.avatar
        /** Lưu trạng thái hình thị avatar vào store */
        dispatch(setIsAvatar(IS_AVATAR))
        /** Lưu avatar vào store */
        dispatch(setPageAvatar(PAGE_AVATAR))
        /** Chế độ ngôn ngữ trang */
        const WEB_LANGUAGE = page_setting?.web_language
        /**
         * Ngôn ngữ trang
         */
        const PAGE_LANGUAGE = page_setting?.page_language
        /**
         * Ngôn ngữ Mặc định của trang
         */
        const DEFAULT_LANGUAGE = page_setting?.default_language

        /** Show support staff   */
        const SHOW_SUPPORT_STAFF = page_setting?.is_visible_staff
        /** Hiển thị danh sách nhân viên hỗ trợ */
        dispatch(setShowSupportStaff(SHOW_SUPPORT_STAFF))
        /** Hiển thị form*/
        const SHOW_FORM = page_setting?.form_before_chat
        /** Nếu hiển thị form */
        if (SHOW_FORM) {
          /** Chuyển field thành lowercase */
          SHOW_FORM.data = SHOW_FORM?.data.map((item: any) => ({
            ...item,
            field: item.field.toLowerCase(),
          }))

          /**  Trạng thái Hiển thị trang chủ */
          /** Lưu vào store */
          dispatch(setShowForm(SHOW_FORM))
        }

        /** Show home page */
        const SHOW_HOME_PAGE = page_setting?.is_visible_home_page || false
        /**
         * Lưu vào store trạng thái hiển thị trang chủ
         */
        dispatch(setShowHome(SHOW_HOME_PAGE))
        /**
         * Trạng thái tự động đổi ngôn ngữ theo khu vực
         */
        const AUTO_CHANGE_BY_REGION =
          page_setting?.auto_change_language_by_region
        /**
         * Ngôn ngữ Mặc định
         */
        const DEFAULT_LANGUAGE_CONFIG = 'vi'
        /**
         * Lấy ngôn ngữ từ URL
         */
        const LOCALE_PARAMS = URL_PARAMS?.get('locale')

        /**
         * Xử lý ngôn ngữ
         * 1. Ưu tiên số 1: lấy theo ngôn ngữ từ SDK config hoặc Default config
         * 2. Nếu WEB_LANGUAGE = DEFAULT thì lý ngôn ngữ từ PAGE_LANGUAGE (Trong Setting) hoặc Default config
         * 3. Nếu WEB_LANGUAGE != DEFAULT thì lý ngôn ngữ từ DEFAULT (Trong Setting) hoặc Default config
         */
        let embed_locale

        /** Kiem tra xem LOCALE_PARAMS co hop le khong */
        const IS_VALID_LOCALE =
          LOCALE_PARAMS &&
          LOCALE_PARAMS !== 'undefined' &&
          LOCALE_PARAMS !== 'auto'
        /**
         * Kiem tra xem WEB_LANGUAGE co hop le khong
         */
        switch (true) {
          /**
           * Nếu ngôn ngữ ở sdk hợp lệ thì chọn ngôn ngữ ở sdk
           */
          case IS_VALID_LOCALE:
            embed_locale = LOCALE_PARAMS
            break
          /**
           * Nếu không có case nào thoả mã thì lấy mặc định (fix cứng Tiếng việt)
           */
          default:
            embed_locale = DEFAULT_LANGUAGE || DEFAULT_LANGUAGE_CONFIG
            break
        }
        /**Check trường hợp AI */
        if (IS_AI) {
          /** Lấy ngôn ngữ của LOCALE_PARAMS */
          const LOCALE = IS_VALID_LOCALE
            ? LOCALE_PARAMS
            : DEFAULT_LANGUAGE_CONFIG
          /**  Cập nhật ngôn ngữ vào i18next */
          await i18next.changeLanguage(LOCALE)
          console.log('Language changed to::', LOCALE)
        } else {
          console.log(embed_locale, 'embeddd')
          await i18next.changeLanguage(embed_locale)
          console.log('Language changed to::', embed_locale)
        }
        /** Thay đổi ngôn ngữ*/
        if (IS_AI) {
          /** Sử dụng await để lấy dữ liệu CLIENT_INFO */
          const CLIENT_INFO = await decodeInitClientData()
          /** Trạng thái active AI agent */
          const IS_ACTIVE_AGENT_AI =
            CLIENT_INFO?.public_profile?.is_active_ai_agent

          console.log(CLIENT_INFO, 'CLIENT_INFO CHẠY VÀO ĐÂY')

          dispatch(
            setCurrentUserId(CLIENT_INFO?.public_profile?.current_user_id || '')
          )

          /** Nếu khách hàng khóa AI agent thì khóa AI agent */
          if (!IS_ACTIVE_AGENT_AI) {
            /** Lưu vào Store */
            dispatch(setActiveAiAgent(false))
            return null
          }
          /**
           * Trạng thái active AI agent
           */
          dispatch(setActiveAiAgent(true))
          console.log(IS_ACTIVE_AGENT_AI, 'is_active_agent_ai')
          /**
           * New CLIENT ID
           */
          const NEW_CLIENT_ID =
            CLIENT_INFO?.public_profile?.page_id +
            '__' +
            CLIENT_INFO?.public_profile?.fb_client_id
          console.log(NEW_CLIENT_ID, 'newclientid')

          /** Dữ liệu khách hàng */
          const DATA_CLIENT = {
            ai_agent_id: CLIENT_INFO?.public_profile?.ai_agent_id || null,
            page_id: CLIENT_INFO?.public_profile?.page_id || '',
            fb_client_id: CLIENT_INFO?.public_profile?.fb_client_id || '',
            page_name: CLIENT_INFO?.public_profile?.page_name || '',
            current_staff_name:
              CLIENT_INFO?.public_profile?.current_staff_name || '',
            is_active_ai_agent:
              CLIENT_INFO?.public_profile?.is_active_ai_agent || false,
          }

          /** Lưu thông tin khách hàng vào store */
          dispatch(setPageInfoAI(DATA_CLIENT))

          /** Lưu refresh data */
          dispatch(setRefreshData(true))
          /**
           * Nếu có client_id mới thì lưu vào store
           */
          if (NEW_CLIENT_ID) {
            dispatch(
              setUserInfo({
                user_name: '',
                user_email: '',
                user_phone: '',
                client_id: NEW_CLIENT_ID,
              })
            )
          }
          /** Lấy page_id */
          const STORED_PAGE_ID =
            CLIENT_INFO?.public_profile?.ai_agent_id || null

          /**
           * Nếu không có page_id thì setNoAiId(true  )
           */
          if (!STORED_PAGE_ID) {
            dispatch(setNoAiId(true))
          } else {
            dispatch(setNoAiId(false))
            dispatch(setPageId(STORED_PAGE_ID || ''))
          }
          /**
           * Lưu page_id vào store
           */
        } else {
          /** Lấy page_id */
          const STORED_PAGE_ID = URL_PARENT.searchParams.get('page_id') || null

          /**
           * Lưu page_id vào store
           */
          dispatch(setPageId(STORED_PAGE_ID || null))

          /**
           * Cập nhật thông tin kích thước của parent
           */
          /** 1. Width của parent */
          const WIDTH_PARENT = URL_PARENT.searchParams.get('parentWidth')
          /** 2. Height của parent */
          const HEIGHT_PARENT = URL_PARENT.searchParams.get('parentHeight')
          /** 3. Kiểm tra có viewport không */
          const HAS_VIEWPORT = URL_PARENT.searchParams.get('has_viewport')
          /**
           * Nếu không có viewport thì setNoViewport(true)
           */
          if (HAS_VIEWPORT === 'false') {
            dispatch(setNoViewport(true))
          }
          /**
           * Nếu có WIDTH_PARENT thì cập nhật width
           */
          if (WIDTH_PARENT) {
            dispatch(setCurrentWidth(Number(WIDTH_PARENT)))
          }
          /**
           * Nếu có HEIGHT_PARENT thì cập nhật height
           */
          if (HEIGHT_PARENT) {
            dispatch(setCurrentHeight(Number(HEIGHT_PARENT)))
          }
          /**
           * Lấy client_id từ localStorage
           */
          const STORED_CLIENT_ID = localStorage.getItem(
            `client_id_${STORED_PAGE_ID}`
          )
          /**
           * Trường hợp KHông phải chat AI thì lưu client_id vào store
           */
          dispatch(setGlobalClientId(STORED_CLIENT_ID || ''))
          /**
           * Lấy dữ liệu khách hàng
           */
          fetchClientData(STORED_CLIENT_ID, STORED_PAGE_ID)
          /**
           * Lấy tin nhắn mới nhất
           */
          const STORED_MESSAGE_LATEST = parsedString(
            localStorage.getItem(
              `latest_message__${STORED_PAGE_ID}__${STORED_CLIENT_ID}`
            ) || ''
          )
          /**
           * Lấy số tin nhắn chưa đọc
           */
          const STORED_UNREAD_COUNT = Number(
            localStorage.getItem(
              `count_unread__${STORED_PAGE_ID}__${STORED_CLIENT_ID}`
            )
          )
          /** Lưu trạng thái hiển thị popup */

          localStorage.setItem(
            `status_quick_chat__${STORED_PAGE_ID}`,
            'show_quick_chat'
          )
          /**
           * Lưu tin nhắn mới nhất vào store
           */
          dispatch(setLatestMessageGlobal(STORED_MESSAGE_LATEST))
          /**
           * Lưu số tin nhắn chưa đọc vào store
           */
          dispatch(setGlobalUnreadCount(STORED_UNREAD_COUNT || 0))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    /** Goi Hàm xử lý */
    fetchData()
  }, [])

  /** Function tắt bật của popup dạng PC */
  const handleToggle = () => {
    /** Lưu vào store  trạng thái đóng mở của popup*/
    dispatch(setStatusPopup(!is_show))
    /** Gọi tới parent để hiện thị popup */
    postMessageToParent(
      !is_show,
      false,
      undefined,
      undefined,
      POSITION,
      POSITION_DETAIL?.bottom,
      POSITION_DETAIL?.right,
      POSITION_DETAIL?.left
    )
  }

  /** Function tắt báo popup dạng Mobile*/
  const handleOff = () => {
    /** Lưu vào store trạng thái đóng của popup*/
    dispatch(setStatusPopup(false))
    /** Gọi tới parent để đóng popup */
    postMessageToParent(
      false,
      false,
      undefined,
      undefined,
      POSITION,
      POSITION_DETAIL?.bottom,
      POSITION_DETAIL?.right,
      POSITION_DETAIL?.left
    )
  }

  /** Hàm đọc data khách hàng
   * @param {string} client_id - ID khách hàng
   * @param {string} page_id - ID trang
   */
  const fetchClientData = async (
    client_id: string | null,
    page_id: string | null
  ) => {
    /** Nếu không có client_id hoặc page_id thì setClientName(null) */
    if (!client_id || !page_id) {
      /** Reset tên client */
      dispatch(setClientNameStore(undefined))
      return
    }

    /** Body lấy thông tin Client */
    const BODY = {
      client_id: client_id,
      page_id: page_id,
    }
    /** Lấy URL */
    const URL_READ = new URL(READ_CLIENT_INFO)
    /** Thêm search vào URL */
    URL_READ.search = new URLSearchParams(BODY as any).toString()
    /** Lấy thông tin client */
    const RES = await fetchAPI(URL_READ.toString(), 'GET')
    /** Lưu tên client */
    // setClientName(RES?.data?.client_name)

    /** Lưu Tên client vào store */
    dispatch(setClientNameStore(RES?.data?.client_name))
  }
  return {
    is_show,
    setShow,
    handleToggle,
    handleOff,
    PAGE_ID,
    CLIENT_ID,
    setTypeConsultation,
    type_consultation,
  }
}
