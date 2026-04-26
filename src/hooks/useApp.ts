import { fetchAPI, useAPI } from '../api/api'
import {
  getClientStorageKey,
  getCookie,
  getDataEmbedChatKey,
  getQuickChatStatusKey,
  parsedString,
  postMessageToParent,
  safeParseJSON,
} from '../utils'
import {
  resetConversation,
  selectEmbedPosition,
  selectEmbedPositionDetail,
  selectPageId,
  setActiveAiAgent,
  setAiMessageAutoSend,
  setButtonEffect,
  setClientNameStore,
  setConsultationGlobal,
  setCurrentHeight,
  setCurrentUserId,
  setCurrentWidth,
  setCustomBackground,
  setCustomColor,
  setDataQuickChat,
  setFixedDataClient,
  setGlobalClientId,
  setGlobalUnreadCount,
  setIsActiveCTAMessage,
  setIsAvatar,
  setIsLoadingFirstTime,
  setIsViewScreen,
  setLatestMessageGlobal,
  setListAiRenderText,
  setListCTAMessage,
  setListMessage,
  setLoadingGlobal,
  setNoAiId,
  setNoViewport,
  setOrgAllowLogo,
  setPageAllowAvatar,
  setPageAvatar,
  setPageId,
  setPageInfoAI,
  setPageLogo,
  setPageLogoBlack,
  setPageSettingGlobal,
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
  /** Đường dẫn hiện tại */
  const PATHNAME = window.location.pathname
  /** Kiểm tra route test AI UI mới */
  const IS_TEST_AI_UI_PAGE = PATHNAME.includes('/test-ai-ui')
  /** Kiểm tra route test AI */
  const IS_TEST_AI_PAGE =
    PATHNAME.includes('/test-ai') && !IS_TEST_AI_UI_PAGE
  /** Kiểm tra route active sdk riêng cho test AI */
  const IS_TEST_AI_ACTIVE_SDK_PAGE = PATHNAME.includes('/active-sdk-test-ai')
  /** Kiểm tra context test AI */
  const IS_TEST_AI_CONTEXT = IS_TEST_AI_PAGE || IS_TEST_AI_ACTIVE_SDK_PAGE

  /**
   * @type {Object} API - API lấy thông tin khách hàng
   * @type {string} READ_CLIENT_INFO - URL API lấy thông tin khách hàng
   */
  const {
    READ_CLIENT_INFO,
    READ_PAGE_INFO,
    ID_WIDGET,
    ID_WIDGET_TEST_AI,
    DATA_WIDGET,
  } = useAPI()

  /** Secret key widget theo route hiện tại */
  const CURRENT_WIDGET_ID =
    IS_TEST_AI_CONTEXT && ID_WIDGET_TEST_AI?.trim()
      ? ID_WIDGET_TEST_AI
      : ID_WIDGET

  /**
   * Dựng client_id cho riêng luồng test AI theo format page_id__fb_client_id.
   */
  const buildAiClientId = (public_profile?: any) => {
    const PAGE_ID = public_profile?.page_id || ''
    /** Lấy current_user_id từ public_profile */
    const CURRENT_USER_ID = public_profile?.current_user_id || ''
    // Kiểm tra xem có page_id và current_user_id không
    if (!PAGE_ID || !CURRENT_USER_ID) return ''
    // Trả về client_id
    return `${PAGE_ID}__${CURRENT_USER_ID}`
  }

  /**
   * Áp dụng chung toàn bộ bootstrap cho luồng AI/test-ai.
   */
  const APPLY_AI_FLOW = ({
    public_profile,
    use_ai_client_id = false,
    extra_page_info,
    use_init_identify = false,
    init_identify_client_id,
  }: {
    public_profile?: any
    use_ai_client_id?: boolean
    extra_page_info?: Record<string, any>
    use_init_identify?: boolean
    init_identify_client_id?: string
  }) => {
    const IS_ACTIVE_AGENT_AI = public_profile?.is_active_ai_agent

    dispatch(setCurrentUserId(public_profile?.current_user_id || ''))

    if (!IS_ACTIVE_AGENT_AI) {
      dispatch(setActiveAiAgent(false))
      return null
    }

    dispatch(setActiveAiAgent(true))

    const NEW_CLIENT_ID = use_ai_client_id
      ? buildAiClientId(public_profile)
      : `${public_profile?.page_id || ''}__${public_profile?.fb_client_id || ''}`
    /** Seed client_id để gọi init_identify khi cần */
    const INIT_IDENTIFY_CLIENT_ID =
      init_identify_client_id ||
      public_profile?.current_user_id ||
      public_profile?.fb_client_id ||
      ''
    /** client_id đưa vào store tùy theo luồng bootstrap */
    const EFFECTIVE_CLIENT_ID = use_init_identify
      ? INIT_IDENTIFY_CLIENT_ID
      : NEW_CLIENT_ID

    dispatch(
      setPageInfoAI({
        ai_agent_id: public_profile?.ai_agent_id || null,
        page_id: public_profile?.page_id || '',
        fb_client_id: public_profile?.fb_client_id || '',
        page_name: public_profile?.page_name || '',
        current_staff_name: public_profile?.current_staff_name || '',
        is_active_ai_agent: public_profile?.is_active_ai_agent || false,
        ...(extra_page_info || {}),
      })
    )

    dispatch(setRefreshData(true))

    if (EFFECTIVE_CLIENT_ID) {
      dispatch(
        setUserInfo({
          user_name: '',
          user_email: '',
          user_phone: '',
          client_id: EFFECTIVE_CLIENT_ID,
        })
      )
    }

    if (use_init_identify) {
      dispatch(setGlobalClientId(''))
      localStorage.removeItem(getClientStorageKey(public_profile?.ai_agent_id))
    } else if (NEW_CLIENT_ID) {
      dispatch(setGlobalClientId(NEW_CLIENT_ID))
      localStorage.setItem(
        getClientStorageKey(public_profile?.ai_agent_id),
        NEW_CLIENT_ID
      )
    }

    const STORED_AI_PAGE_ID = public_profile?.ai_agent_id || null

    if (!STORED_AI_PAGE_ID) {
      dispatch(setNoAiId(true))
    } else {
      dispatch(setNoAiId(false))
      dispatch(setPageId(STORED_AI_PAGE_ID || ''))
    }

    return {
      client_id: NEW_CLIENT_ID,
      page_id: STORED_AI_PAGE_ID,
    }
  }

  /**
   * Load WIDGET khi component mount
   * Chỉ load nếu đang ở trang AI Assistant hoặc Active SDK
   */
  useEffect(() => {
    /** Kiểm tra xem có phải trang AI Assistant hoặc Active SDK không */
    const CURRENT_PATHNAME = window.location.pathname
    const IS_AI_ASSISTANT_PAGE =
      CURRENT_PATHNAME.includes('/ai-assistant') ||
      (CURRENT_PATHNAME.includes('/test-ai') &&
        !CURRENT_PATHNAME.includes('/test-ai-ui')) ||
      CURRENT_PATHNAME.includes('/active-sdk') ||
      CURRENT_PATHNAME.includes('/active-sdk-test-ai')

    // Nếu là trang AI Assistant hoặc Active SDK
    if (IS_AI_ASSISTANT_PAGE) {
      console.log('ai - assistant')

      try {
        // Bật chế độ debug cho WIDGET
        WIDGET.debugOn()

        // Load WIDGET với hoặc không có DATA_WIDGET
        if (DATA_WIDGET && DATA_WIDGET.APP?.trim())
          // Load WIDGET với DATA_WIDGET
          WIDGET.load(CURRENT_WIDGET_ID, DATA_WIDGET)
        // Load WIDGET không có DATA_WIDGET
        else WIDGET.load(CURRENT_WIDGET_ID)
      } catch (error) {
        console.error('Lỗi khi giải mã token:', error)
      }
    } else {
      console.warn('Không phải trang AI Assistant, bỏ qua việc load WIDGET')
    }
  }, [])
  /**
   * Hàm giải mã dữ liệu khách hàng và xử lý sự kiện từ WIDGET
   * @returns {Promise<void>}
   */
  const decodeClientData = async () => {
    // Xử lý sự kiện từ WIDGET
    WIDGET.onEvent(async (e: any, value: any) => {
      console.log('widget on event decode client data')

      // Nếu là tin nhắn từ khách hàng thì return sớm (tạm thời không xử lý)
      if (value?.type === 'CLIENT_MESSAGE') return

      // Reset toàn bộ data khi có sự kiện mới
      dispatch(setRefreshData(true))
      // Xóa toàn bộ message
      dispatch(setListMessage([]))
      // Xóa thông tin tin nhắn cuối cùng
      dispatch(setLatestMessageGlobal(null))
      // Xóa client_id
      dispatch(setGlobalClientId(''))
      // Xóa gợi ý tin nhắn
      dispatch(setSuggestMessage(''))
      // Bật loading
      dispatch(setLoadingGlobal(true))

      /** Lấy thông tin khách hàng mới từ WIDGET */
      let client_info = await WIDGET.getClientInfo()

      // console.log('CHẠY VÀO ĐÂY USER_INFO hàm decode', client_info)

      /** PAGE_ID mới từ ai_agent_id */
      const N_PAGE_ID = client_info?.public_profile?.ai_agent_id

      // Cập nhật current user id
      dispatch(
        setCurrentUserId(client_info?.public_profile?.current_user_id || '')
      )

      // Nếu không có ai_agent_id thì set flag và return
      if (!N_PAGE_ID) {
        dispatch(setNoAiId(true))
        return
      }

      /** ID khách hàng mới */
      const N_CLIENT_ID = IS_TEST_AI_CONTEXT
        ? buildAiClientId(client_info?.public_profile)
        : client_info?.public_profile?.page_id +
          '__' +
          client_info?.public_profile?.fb_client_id

      // Reset client_id trong localStorage
      localStorage.setItem(getClientStorageKey(N_PAGE_ID), '')

      // Gửi thông tin client_id sang SDK qua postMessage
      window.parent.postMessage(
        {
          from: 'BBH-EMBED-IFRAME',
          type: 'CLIENT_ID',
          key: getDataEmbedChatKey(N_PAGE_ID),
          data_embed_chat: {
            page_id: N_PAGE_ID,
            client_id: N_CLIENT_ID,
          },
        },
        '*'
      )

      // console.log('CHẠY VÀO ĐÂY USER_INFO hàm refresh', client_info)

      // Cập nhật thông tin user với client_id mới
      dispatch(
        setUserInfo({
          user_name: '',
          user_email: '',
          user_phone: '',
          client_id: N_CLIENT_ID,
        })
      )
    })
  }

  /**
   * Hàm khởi tạo và lấy dữ liệu khách hàng lần đầu
   * @returns {Promise<Object>} Thông tin khách hàng từ WIDGET
   */
  const decodeInitClientData = async () => {
    console.log('decode init client data')

    /** Lấy thông tin khách hàng từ WIDGET */
    let client_info = await WIDGET.getClientInfo()

    // console.log(client_info, 'clientttt')

    // Trả về thông tin khách hàng
    return client_info
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
  let stored_client_id = localStorage.getItem(getClientStorageKey(PAGE_ID))
  /** Nếu không có client_id trong localStorage thì lấy từ cookies */
  if (!stored_client_id) {
    stored_client_id = getCookie(getClientStorageKey(PAGE_ID))
  }
  /** data_quick_chat */
  let data_quick_chat = localStorage.getItem(
    `data_quick_chat__${PAGE_ID}__${stored_client_id}`
  )
  /** Sử dụng useEffect */
  useEffect(() => {
    /** Nếu data_quick_chat */
    if (data_quick_chat) {
      /** Lưu data_quick_chat */
      dispatch(setDataQuickChat(JSON.parse(data_quick_chat)))
    }
  }, [data_quick_chat])

  useEffect(() => {
    /** Nếu co client_id */
    if (stored_client_id) {
      /** Lưu client_id */
      // dispatch(setGlobalClientId(stored_client_id))
      /** Lấy thông tin client */
      // fetchClientData(stored_client_id, PAGE_ID)
    }
  }, [stored_client_id])
  /** Dispatch */
  const dispatch = useDispatch()

  /**
   * Hàm xử lý thông điệp postMessage từ parent (mobile/web)
   * @param {MessageEvent} event - Sự kiện tin nhắn từ parent window
   */
  const handleMessage = async (event: MessageEvent) => {
    /** Dữ liệu payload từ event */
    let payload: any

    console.log('EVENT::', event)

    try {
      // Parse event.data nếu là string, nếu không thì dùng trực tiếp
      payload =
        typeof event.data === 'string' ? JSON.parse(event.data) : event.data
    } catch (error) {
      console.error('Lỗi khi parse event.data:', error)
      return
    }

    /** Destructure các field cần thiết từ payload */
    const {
      user_name,
      user_email,
      user_phone,
      client_id,
      from,
      action,
      type,
      key,
      locale,
      reset_conversation,
      reset_page_id,
      data_embed_chat,
    } = payload

    // Xử lý data_embed_chat nếu có
    if (data_embed_chat) {
      /** Dữ liệu sau khi parse */
      let parsed_data

      try {
        // Parse JSON an toàn
        parsed_data = safeParseJSON(data_embed_chat)
      } catch (err) {
        console.error('Invalid JSON:', err)
        parsed_data = {}
      }

      /** Page ID từ parsed data */
      const PAGE_ID_FROM_MESSAGE = parsed_data.page_id || null
      const EXPECTED_DATA_EMBED_CHAT_KEY =
        getDataEmbedChatKey(PAGE_ID_FROM_MESSAGE)
      if (key && EXPECTED_DATA_EMBED_CHAT_KEY !== key) return
      /** Client ID từ parsed data */
      const CLIENT_ID =
        parsed_data.client_id || parsed_data['client-id'] || null

      // Lưu client_id vào store và localStorage
      dispatch(setGlobalClientId(CLIENT_ID))
      // Lưu client_id vào localStorage
      localStorage.setItem(getClientStorageKey(PAGE_ID_FROM_MESSAGE), CLIENT_ID)
    }

    // Xử lý tin nhắn từ CHATBOX
    if (from === 'CHATBOX' && type === 'CLIENT_MESSAGE')
      dispatch(setSuggestMessage(payload?.payload?.message))

    // Xử lý tin nhắn tự động từ Web hoặc Mobile
    if (
      type === 'AI.SEND_TEXT_FROM_MOBILE' ||
      type === 'AI.SEND_TEXT_FROM_WEBSITE'
    )
      dispatch(setAiMessageAutoSend(payload?.payload?.text))

    // Xử lý từ parent-app-preview (trang Preview)
    if (from === 'parent-app-preview') {
      // Xử lý locale auto
      if (locale === 'auto') {
        /** Cài đặt trang */
        const PAGE_SETTING = await fetchPageSetting(reset_page_id)
        /** Chế độ ngôn ngữ trang */
        const WEB_LANGUAGE = PAGE_SETTING?.web_language
        /** Ngôn ngữ trang */
        const PAGE_LANGUAGE = PAGE_SETTING?.page_language
        /** Ngôn ngữ mặc định của trang */
        const DEFAULT_LANGUAGE = PAGE_SETTING?.default_language
        /** Ngôn ngữ mặc định config */
        const DEFAULT_LANGUAGE_CONFIG = 'vi'

        /** Biến lưu trữ ngôn ngữ embed */
        let embed_locale

        // Xác định ngôn ngữ sử dụng
        switch (true) {
          // Nếu có default_language thì dùng, không thì dùng config
          case DEFAULT_LANGUAGE:
            embed_locale = DEFAULT_LANGUAGE || DEFAULT_LANGUAGE_CONFIG
            break
          // Mặc định dùng tiếng Việt
          default:
            embed_locale = DEFAULT_LANGUAGE_CONFIG
            break
        }

        console.log(embed_locale, 'EMBED_LOCALE')

        // Cập nhật ngôn ngữ vào i18next
        await i18next.changeLanguage(embed_locale)
      }

      // Xử lý locale khác auto
      if (locale && locale !== 'auto') await i18next.changeLanguage(locale)

      // Xử lý reset conversation
      if (reset_conversation) {
        // Xóa client_id trong localStorage
        localStorage?.removeItem(getClientStorageKey(reset_page_id))
        // Reset conversation trong store
        dispatch(resetConversation())
        // Reset tên client
        dispatch(setClientNameStore(undefined))
      }
    }

    // Xử lý từ parent-app (Retion hoặc BotBanHang)
    if (from === 'parent-app') {
      console.log(
        'Nhận tin nhắn từ app cha. Thông tin nhận được là:',
        event.data
      )

      // Nếu có action thì hiển thị popup tư vấn
      if (action) {
        // Set trạng thái consultation
        setTypeConsultation(true)
        dispatch(setConsultationGlobal(true))

        // Nếu popup chưa mở thì mở và reset tin nhắn
        if (!is_show) {
          dispatch(setListMessage([]))
          setShow(true)
        }
        return
      }

      // Lưu thông tin user vào store (chỉ lưu nếu có giá trị)
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

  /**
   * Setup message listener và khởi tạo WIDGET khi component mount
   */
  useEffect(() => {
    // Setup message listener để nhận message từ parent
    window.addEventListener('message', handleMessage)

    // Khởi tạo decode client data
    decodeClientData()

    // Gửi signal READY về parent để báo iframe đã sẵn sàng
    window.parent.postMessage(
      {
        from: 'IFRAME_CHATBOT',
        type: 'IFRAME_READY',
      },
      '*'
    )

    console.log('[IFRAME] Sent IFRAME_READY signal to parent')

    // Cleanup function khi component unmount
    return () => {
      // Xóa event listener
      window.removeEventListener('message', handleMessage)
      // Cleanup decode client data
      decodeClientData()
    }
  }, [])
  /**
   * Lấy cài đặt trang từ API
   * @param page_id - ID của trang cần lấy setting
   * @returns {Promise<any>} Dữ liệu cài đặt trang
   */
  const fetchPageSetting = async (page_id: string) => {
    /** Tạo URL object từ READ_PAGE_INFO */
    const URL_READ = new URL(READ_PAGE_INFO)

    // Thêm page_id vào query params
    URL_READ.search = new URLSearchParams({ page_id }).toString()

    /** Response từ API */
    const RES = await fetchAPI(URL_READ.toString(), 'GET')

    // Trả về data từ response
    return RES?.data
  }

  /**
   * Khởi tạo và load cài đặt trang khi component mount
   */
  useEffect(() => {
    /**
     * Hàm lấy và xử lý dữ liệu khởi tạo
     */
    const fetchData = async () => {
      try {
        /** URL đầy đủ của trang hiện tại */
        const FULL_SRC = window.location.href
        /** URL object của parent */
        const URL_PARENT = new URL(FULL_SRC)
        /** URL params */
        const URL_PARAMS = new URLSearchParams(window.location.search)

        /** Page ID từ URL params */
        const STORED_PAGE_ID = URL_PARENT.searchParams.get('page_id') || null
        /** Client ID riêng cho route test-ai-ui */
        const STORED_TEST_AI_UI_CLIENT_ID =
          URL_PARENT.searchParams.get('_client_id') ||
          URL_PARENT.searchParams.get('client_id') ||
          null
        /** Version model riêng cho route test-ai-ui */
        const STORED_TEST_AI_UI_VER =
          URL_PARENT.searchParams.get('ver') || null

        /** Kiểm tra có phải trang AI Assistant không */
        const IS_AI =
          URL_PARENT?.pathname.includes('ai-assistant') ||
          (URL_PARENT?.pathname.includes('test-ai') &&
            !URL_PARENT?.pathname.includes('test-ai-ui'))
        /** Kiểm tra route test AI UI mới */
        const IS_TEST_AI_UI = URL_PARENT?.pathname.includes('test-ai-ui')
        /** Kiểm tra có phải view screen không */
        const IS_VIEW_SCREEN = URL_PARENT?.pathname.includes('view-screen')

        // Nếu là view screen thì gửi signal ready về parent
        if (IS_VIEW_SCREEN) {
          window.parent.postMessage(
            {
              from: 'BBH-EMBED-IFRAME',
              is_view_screen: true,
              status: 'READY',
              key: getDataEmbedChatKey(STORED_PAGE_ID),
            },
            '*'
          )
        }

        // Lưu trạng thái AI và view screen vào store
        dispatch(setStatusIsAI(IS_AI || IS_TEST_AI_UI))
        dispatch(setIsViewScreen(IS_VIEW_SCREEN))

        // Nếu là AI hoặc view screen thì tự động mở popup
        setShow(IS_AI || IS_TEST_AI_UI || IS_VIEW_SCREEN)

        /** Cài đặt trang */
        let page_setting = {} as any

        // Nếu có page_id và không phải luồng test-ai-ui thì gọi API lấy cài đặt trang
        if (STORED_PAGE_ID && !IS_TEST_AI_UI)
          page_setting = await fetchPageSetting(STORED_PAGE_ID)

        // Lưu cài đặt trang vào store
        dispatch(setPageSettingGlobal(page_setting))

        // Xử lý button icon/logo
        if (
          page_setting?.button_icon_url?.current_url &&
          page_setting?.button_icon_url?.current_url !== 'default_image'
        ) {
          /** URL logo của app */
          const APP_LOGO = page_setting?.button_icon_url?.current_url || null

          // Lưu logo vào store
          dispatch(setOrgAllowLogo(true))
          dispatch(setPageLogo(APP_LOGO))
          dispatch(setIsLoadingFirstTime(false))
        }

        // Set loading first time = false
        dispatch(setIsLoadingFirstTime(false))

        /** Avatar của trang */
        const APP_AVATAR_PAGE = page_setting?.avatar || null

        // Xử lý avatar
        if (APP_AVATAR_PAGE) {
          dispatch(setPageAllowAvatar(true))
          dispatch(setPageLogoBlack(APP_AVATAR_PAGE))
        } else {
          dispatch(setPageAllowAvatar(false))
        }

        // Xử lý button effect
        dispatch(setButtonEffect(page_setting?.button_effect || false))

        // Xử lý custom color
        if (page_setting?.custom_color)
          dispatch(setCustomColor(page_setting?.custom_color))

        // Xử lý auto open popup (chỉ khi không phải AI và view screen)
        if (!IS_AI && !IS_TEST_AI_UI && !IS_VIEW_SCREEN) {
          /** Cài đặt mở popup tự động */
          const OPEN_POPUP_SETTING = page_setting?.open_popup_when_access
          /** Kiểm tra có phải mobile không */
          const IS_MOBILE = /Mobi|Android|iPhone|iPad|iPod/i.test(
            window.navigator.userAgent
          )

          /** Trạng thái mở popup tự động */
          let auto_open_init = false

          // Xác định có mở popup tự động không dựa vào setting
          switch (OPEN_POPUP_SETTING?.option) {
            case 'mobile':
              auto_open_init = IS_MOBILE
              break
            case 'website':
              auto_open_init = !IS_MOBILE
              break
            case 'both':
              auto_open_init = true
              break
            case 'off':
            default:
              auto_open_init = false
              break
          }

          // console.log(auto_open_init, 'auto_open_init')

          // Mở popup sau delay nếu setting cho phép
          setTimeout(() => {
            if (auto_open_init) setShow(auto_open_init)
          }, OPEN_POPUP_SETTING?.delay * 1000 || 1000)
        }

        /** Trạng thái không phải AI */
        if (!IS_AI && !IS_TEST_AI_UI) {
          /** Lưu cài đặt background từ setting */
          const CUSTOM_BACKGROUND = page_setting?.custom_background || false
          /** Lưu cài đặt background vào store */
          dispatch(setCustomBackground(CUSTOM_BACKGROUND))
          /** Lưu cái đặt CTA message từ setting */
          // const CUSTOM_CTA_MESSAGE = page_setting?.custom_cta_message

          /** is activce cta */
          dispatch(
            setIsActiveCTAMessage(
              page_setting?.faq_question_cta?.is_active || false
            )
          )

          /** Lưu cài đặt CTA message vào store */
          dispatch(
            setListCTAMessage(
              page_setting?.faq_question_cta || {
                is_active: false,
                is_show_outside: false,
                data: [
                  {
                    source: {
                      vi: 'Chat với AI',
                      en: 'Chat with AI',
                    },
                    is_active: true,
                  },
                  {
                    source: {
                      vi: 'Hỗ trợ cài đặt',
                      en: 'Solve your problem',
                    },
                    is_active: true,
                  },
                  {
                    source: {
                      vi: 'Tư vấn giải pháp',
                      en: 'Support setting',
                    },
                    is_active: true,
                  },
                  {
                    source: {
                      vi: 'Liên hệ cho tôi',
                      en: 'Contact me',
                    },
                    is_active: true,
                  },
                ],
              }
            )
          )
        }
        /** Lưu dũe liệu ai_render_text */
        dispatch(
          setListAiRenderText(
            page_setting?.ai_responding || {
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

        console.log(BROWSER_LANGUAGE, 'BROWSER_LANGUAGE')

        /** Nếu chỉ cần mã ngôn ngữ chính (không có region) */
        const PRIMARY_LANGUAGE = BROWSER_LANGUAGE.split('-')[0]

        console.log(PRIMARY_LANGUAGE, 'PRIMARY_LANGUAGE')

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
          /** Tạo bản sao mới, tránh mutate object gốc */
          const NEW_SHOW_FORM = {
            ...SHOW_FORM,
            data: SHOW_FORM.data.map((item: any) => ({
              ...item,
              field: item.field.toLowerCase(),
            })),
          }

          /** Lưu vào store */
          dispatch(setShowForm(NEW_SHOW_FORM))
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
        /**Check trường hợp AI hoặc View Screen */
        if (IS_AI || IS_TEST_AI_UI || IS_VIEW_SCREEN) {
          /** Lấy ngôn ngữ của LOCALE_PARAMS */
          const LOCALE = IS_VALID_LOCALE
            ? LOCALE_PARAMS
            : DEFAULT_LANGUAGE_CONFIG
          /**  Cập nhật ngôn ngữ vào i18next */
          await i18next.changeLanguage(LOCALE)
          console.log('Language changed to::', LOCALE)
        } else {
          console.log(embed_locale, 'embeddd')
          // Lấy ngôn ngữ từ WIDGET
          await i18next.changeLanguage(embed_locale)
          console.log('Language changed to::', embed_locale)
        }
        /** Thay đổi ngôn ngữ*/
        if (IS_AI) {
          /** Sử dụng await để lấy dữ liệu CLIENT_INFO */
          const CLIENT_INFO = await decodeInitClientData()

          console.log(CLIENT_INFO, 'CLIENT_INFO CHẠY VÀO ĐÂY')
          APPLY_AI_FLOW({
            public_profile: CLIENT_INFO?.public_profile,
            use_ai_client_id: IS_TEST_AI_CONTEXT,
          })
        } else if (IS_TEST_AI_UI) {
          /** test-ai-ui lấy seed từ params, sau đó phải đi qua init_identify để tạo client_id thật */
          APPLY_AI_FLOW({
            public_profile: {
              ai_agent_id: STORED_PAGE_ID || null,
              page_id: STORED_PAGE_ID || '',
              fb_client_id: STORED_TEST_AI_UI_CLIENT_ID || '',
              page_name: page_setting?.page_name || '',
              current_staff_name: '',
              current_user_id: STORED_TEST_AI_UI_CLIENT_ID || '',
              is_active_ai_agent: true,
            },
            use_ai_client_id: true,
            use_init_identify: true,
            init_identify_client_id: STORED_TEST_AI_UI_CLIENT_ID || '',
            extra_page_info: {
              ver: STORED_TEST_AI_UI_VER || '',
            },
          })
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
          let stored_client_id = localStorage.getItem(
            getClientStorageKey(STORED_PAGE_ID)
          )

          /** Nếu không cố client_id thì lưu client_id trong cookie */
          if (!stored_client_id) {
            stored_client_id =
              getCookie(getClientStorageKey(STORED_PAGE_ID)) || ''
          }

          /** Trường hợp KHông phải chat AI thì lưu client_id vào store*/
          dispatch(setGlobalClientId(stored_client_id || ''))
          /** Lấy dữ liệu khách hàng */
          fetchClientData(stored_client_id, STORED_PAGE_ID)
          /** Lấy tin nhắn mới nhất */
          const STORED_MESSAGE_LATEST = parsedString(
            localStorage.getItem(
              `latest_message__${STORED_PAGE_ID}__${stored_client_id}`
            ) || ''
          )
          /** Lấy số tin nhắn chưa đọc*/
          const STORED_UNREAD_COUNT = Number(
            localStorage.getItem(
              `count_unread__${STORED_PAGE_ID}__${stored_client_id}`
            )
          )
          /** Lưu trạng thái hiển thị popup */

          localStorage.setItem(
            getQuickChatStatusKey(STORED_PAGE_ID),
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

  /**
   * Hàm toggle trạng thái popup (dành cho PC)
   */
  const handleToggle = () => {
    // Lưu trạng thái đóng/mở popup vào store
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

  /**
   * Hàm tắt popup (dành cho Mobile)
   */
  const handleOff = () => {
    // Lưu trạng thái đóng popup vào store
    dispatch(setStatusPopup(false))
    // Gọi tới parent để đóng popup
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
    // Nếu không có client_id hoặc page_id thì setClientName(null)
    if (!client_id || !page_id) {
      // Reset tên client
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
    // Thêm search vào URL
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
    stored_client_id,
    setTypeConsultation,
    type_consultation,
  }
}
