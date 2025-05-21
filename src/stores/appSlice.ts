import { AppState } from './type'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/stores'
import { createSlice } from '@reduxjs/toolkit'
import { set } from 'lodash'

const INITIAL_STATE: AppState = {
  page_id: '',
  client_id: '',
  locale: 'vi',
  current_width: 0,
  current_height: 0,
  list_message: [],
  list_unread_message: [],
  unread_count: 0,
  latest_message: {},
  show_popup: false,
  is_init: false,
  preview_url: '',
  loading_global: false,
  user_info: {
    user_name: '',
    user_phone: '',
    user_email: '',
    client_id: '',
  },
  is_ai: false,
  no_viewport: false,
  staff_list: {},
  page_info_ai: {},
  refresh_data: false,
  typing_status: undefined,
  suggest_message: '',
  embed_position: 'right',
  embed_position_detail: {
    left: undefined,
    right: undefined,
    bottom: undefined,
  },
  ai_id: undefined,
  is_avatar: false,
  reset_conversation: false,
  client_name_store: undefined,
  is_visible_staff: {
    is_active: false,
    allow_staffs: {},
  },
  form_before_chat: {
    is_active: false,
  },
  is_visible_home_page: undefined,
  is_active_ai_agent: undefined,
  org_allow_logo: undefined,
  logo_page_custom: undefined,
  ai_message_auto_send: '',
  is_view_screen: false,
  current_user_id: undefined,
}

export const appSlice = createSlice({
  name: 'app',
  initialState: INITIAL_STATE,
  reducers: {
    /** lưu page_id */
    setPageId: (state, action: PayloadAction<string | null>) => {
      state.page_id = action.payload
    },
    /** lưu client_id */
    setGlobalClientId: (state, action: PayloadAction<string>) => {
      state.client_id = action.payload
    },
    /** lưu preview url */
    setGlobalPreviewUrl: (
      state,
      action: PayloadAction<string | undefined | null>
    ) => {
      state.preview_url = action.payload
    },

    /** lưu dữ liệu Trang */
    setLocale: (state, action: PayloadAction<AppState['locale']>) => {
      state.locale = action.payload
    },
    /** lưu dữ Kích thước chiều rộng trang */
    setCurrentWidth: (state, action: PayloadAction<number>) => {
      state.current_width = action.payload
    },
    /** lưu dữ Kích thước chiều cao trang */
    setCurrentHeight: (state, action: PayloadAction<number>) => {
      state.current_height = action.payload
    },
    /** lưu dữ Số lượng tin nhắn chưa đọc */
    setGlobalUnreadCount: (state, action: PayloadAction<number>) => {
      state.unread_count = action.payload
    },
    /** lưu dữ trạng thái đóng mở */
    setStatusPopup: (state, action: PayloadAction<boolean>) => {
      state.show_popup = action.payload
    },
    /** lưu dữ trạng thái đóng mở */
    setLoadingGlobal: (state, action: PayloadAction<boolean>) => {
      state.loading_global = action.payload
    },
    /** lưu dữ trạng thái khởi tạo */
    setStatusIsInit: (state, action: PayloadAction<boolean>) => {
      state.is_init = action.payload
    },
    /** lưu dữ trạng thái Init */
    setStatusIsAI: (state, action: PayloadAction<boolean>) => {
      state.is_ai = action.payload
    },

    /** lưu dữ liệu tin nhắn */
    setListMessage: (
      state,
      action: PayloadAction<AppState['list_message']>
    ) => {
      state.list_message = action.payload
    },
    /** lưu dữ liệu tin nhắn */
    setListUnreadMessage: (
      state,
      action: PayloadAction<AppState['list_unread_message']>
    ) => {
      state.list_unread_message = action.payload
    },
    /** lưu dữ liệu tin nhắn */
    setLatestMessageGlobal: (
      state,
      action: PayloadAction<AppState['latest_message']>
    ) => {
      state.latest_message = action.payload
    },
    /** Lưu dữ liệu của user nếu chưa đăng ký */
    setUserInfo: (state, action: PayloadAction<AppState['user_info']>) => {
      state.user_info = action.payload
    },
    /**
     * Lưu dữ trạng thái viewport của page cha
     */
    setNoViewport: (state, action: PayloadAction<boolean>) => {
      state.no_viewport = action.payload
    },
    /**
     * Lưu dữ liệu nhân viên
     */
    setStaffListStore: (
      state,
      action: PayloadAction<AppState['staff_list']>
    ) => {
      state.staff_list = action.payload
    },
    /**
     * Lưu dữ liệu infor page AI
     */
    setPageInfoAI: (state, action: PayloadAction<AppState['page_info_ai']>) => {
      state.page_info_ai = action.payload
    },
    /**
     * set dữ liệu refresh
     */
    setRefreshData: (state, action: PayloadAction<boolean>) => {
      state.refresh_data = action.payload
    },
    /**
     * Trạng thái typing
     */
    setTypingStatus: (state, action: PayloadAction<boolean | undefined>) => {
      state.typing_status = action.payload
    },
    /**
     * Trạng thái suggest message
     */
    setSuggestMessage: (state, action: PayloadAction<string>) => {
      state.suggest_message = action.payload
    },
    /**
     * Trạng thái vị trí của embed
     */
    setEmbedPosition: (state, action: PayloadAction<string>) => {
      state.embed_position = action.payload || 'right'
    },
    /**
     * Trạng thái vị trí của embed
     */
    setEmbedPositionDetail: (
      state,
      action: PayloadAction<AppState['embed_position_detail']>
    ) => {
      state.embed_position_detail = action.payload
    },
    /**
     * Trạng thái không có Id AI
     */
    setNoAiId: (state, action: PayloadAction<boolean | undefined>) => {
      state.ai_id = action.payload
    },
    /**
     * Trạng thái ẩn avatar staff/page
     */
    setIsAvatar: (state, action: PayloadAction<boolean>) => {
      state.is_avatar = action.payload
    },
    /**
     * Avatar của page
     */
    setPageAvatar: (state, action: PayloadAction<string>) => {
      state.page_avatar = action.payload
    },
    /** Reset conversation */
    resetConversation: (state) => {
      state.list_message = []
      state.list_unread_message = []
      state.latest_message = null
    },
    /** CLient name */
    setClientNameStore: (state, action: PayloadAction<string | undefined>) => {
      state.client_name_store = action.payload
    },
    /** Hiển thị show_supoort staff */
    setShowSupportStaff: (state, action: PayloadAction<any>) => {
      state.is_visible_staff = action.payload
    },
    /** trạng thái hiển thị form */
    setShowForm: (state, action: PayloadAction<any>) => {
      state.form_before_chat = action.payload
    },
    /** Trạng thái hiển thị trang chủ */
    setShowHome: (state, action: PayloadAction<boolean>) => {
      state.is_visible_home_page = action.payload
    },
    /** Trạng thái hiển thị trang chủ */
    setActiveAiAgent: (state, action: PayloadAction<boolean>) => {
      state.is_active_ai_agent = action.payload
    },

    /** set Org allow logo */
    setOrgAllowLogo: (state, action: PayloadAction<boolean>) => {
      state.org_allow_logo = action.payload
    },
    /**
     * Logo page
     */
    setPageLogo: (state, action: PayloadAction<string>) => {
      state.logo_page_custom = action.payload
    },
    /** ai message auto send */
    setAiMessageAutoSend: (state, action: PayloadAction<string>) => {
      state.ai_message_auto_send = action.payload
    },
    /** is_view_screen */
    setIsViewScreen: (state, action: PayloadAction<boolean>) => {
      state.is_view_screen = action.payload
    },

    /** User id hiện tại */
    setCurrentUserId: (state, action: PayloadAction<string>) => {
      state.current_user_id = action.payload
    },
  },
})

/** Action creators are generated for each case reducer function */
export const {
  setPageId,
  setGlobalClientId,
  setLocale,
  setCurrentWidth,
  setCurrentHeight,
  setListMessage,
  setListUnreadMessage,
  setLatestMessageGlobal,
  setStatusPopup,
  setStatusIsInit,
  setGlobalUnreadCount,
  setGlobalPreviewUrl,
  setLoadingGlobal,
  setUserInfo,
  setStatusIsAI,
  setNoViewport,
  setStaffListStore,
  setPageInfoAI,
  setRefreshData,
  setTypingStatus,
  setSuggestMessage,
  setEmbedPosition,
  setEmbedPositionDetail,
  setNoAiId,
  setIsAvatar,
  setPageAvatar,
  resetConversation,
  setClientNameStore,
  setShowSupportStaff,
  setShowForm,
  setShowHome,
  setActiveAiAgent,
  setOrgAllowLogo,
  setPageLogo,
  setAiMessageAutoSend,
  setIsViewScreen,
  setCurrentUserId,
} = appSlice.actions

/** chọn đến page id */
export const selectPageId = (state: RootState) => state.app.page_id

/** chọn đến client id */
export const selectGlobalClientId = (state: RootState) => state.app.client_id

/** chọn đầu dữ liệu Locale */
export const selectLocale = (state: RootState) => state.app.locale

/** chọn đầu dữ liệu kích thước chiều rộng */
export const selectCurrentWidth = (state: RootState) => state.app.current_width
/** chọn đầu dữ liệu kích thước chiều heidht */
export const selectCurrentHeight = (state: RootState) =>
  state.app.current_height

/** chọn đầu dữ liệu tin nhắn chưa đọc */
export const selectGlobalUnreadCount = (state: RootState) =>
  state.app.unread_count

/** chọn đầu danh sách tin nhắn */
export const selectListMessage = (state: RootState) => state.app.list_message
/** chọn đầu danh sách tin nhắn chưa đọc */
export const selectListUnreadMessage = (state: RootState) =>
  state.app.list_unread_message
/** chọn đầu tin nhắn mới nhất */
export const selectLatestMessage = (state: RootState) =>
  state.app.latest_message
/** chọn đầu trạng thái đóng mở popup */
export const selectStatusPopup = (state: RootState) => state.app.show_popup
/** chọn đầu trạng thái loading popup */
export const selectLoadingGlobal = (state: RootState) =>
  state.app.loading_global

/** chọn đầu trạng thái Khởi tạo client */
export const selectStatusIsInit = (state: RootState) => state.app.is_init
/** Chọn đầu ra Preview Url */
export const selectGlobalPreviewUrl = (state: RootState) =>
  state.app.preview_url
/** Đầu ra user info */
export const selectUserInfo = (state: RootState) => state.app.user_info
/** Status AI */
export const selectStatusAI = (state: RootState) => state.app.is_ai
/** Status Viewport */
export const selectStatusViewport = (state: RootState) => state.app.no_viewport
/**
 * Staff List
 */
export const selectStaffList = (state: RootState) => state.app.staff_list
/**
 * Page AI
 */
export const selectPageInfoAI = (state: RootState) => state.app.page_info_ai
/**
 * Refresh Data
 */
export const selectRefreshData = (state: RootState) => state.app.refresh_data
/**
 * Typing status
 */
export const selectTypingStatus = (state: RootState) => state.app.typing_status
/**
 * Suggest message
 */
export const selectSuggestMessage = (state: RootState) =>
  state.app.suggest_message
/**
 * Embed position
 */
export const selectEmbedPosition = (state: RootState) =>
  state.app.embed_position
/**
 * Embed position detail
 */
export const selectEmbedPositionDetail = (state: RootState) =>
  state.app.embed_position_detail

/**
 * AI ID
 */
export const selectAiId = (state: RootState) => state.app.ai_id
/**
 * Is Avatar
 */
export const selectIsAvatar = (state: RootState) => state.app.is_avatar
/**
 * Page Avatar
 */
export const selectPageAvatar = (state: RootState) => state.app.page_avatar
/** Lấy tên client */
export const selectClientName = (state: RootState) =>
  state.app.client_name_store
/** SHow support staff */
export const selectShowSupportStaff = (state: RootState) =>
  state.app.is_visible_staff

/** show form */
export const selectShowForm = (state: RootState) => state.app.form_before_chat

/** show home */
export const selectShowHome = (state: RootState) =>
  state.app.is_visible_home_page
/** show home */
export const selectActiveAiAgent = (state: RootState) =>
  state.app.is_active_ai_agent

/** Org allow logo */
export const selectOrgAllowLogo = (state: RootState) => state.app.org_allow_logo
/** Logo page custom */
export const selectPageLogo = (state: RootState) => state.app.logo_page_custom

/** ai message auto send */
export const selectAiMessageAutoSend = (state: RootState) =>
  state.app.ai_message_auto_send

/** Is view screen */
export const selectIsViewScreen = (state: RootState) => state.app.is_view_screen

/** User id hiện tại */
export const selectCurrentUserId = (state: RootState) =>
  state.app.current_user_id

export default appSlice.reducer
