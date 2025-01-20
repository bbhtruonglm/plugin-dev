import { AppState } from './type'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/stores'
import { createSlice } from '@reduxjs/toolkit'

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
    user_id: '',
  },
  is_ai: false,
  no_viewport: false,
}

export const appSlice = createSlice({
  name: 'app',
  initialState: INITIAL_STATE,
  reducers: {
    /** lưu page_id */
    setPageId: (state, action: PayloadAction<string>) => {
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
  },
})

// Action creators are generated for each case reducer function
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

export default appSlice.reducer
