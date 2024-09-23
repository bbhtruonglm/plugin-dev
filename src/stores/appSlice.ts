import { AppState } from './type'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/stores'
import { createSlice } from '@reduxjs/toolkit'

const initialState: AppState = {
  page_id: '',
  client_id: '',
  locale: 'vi',
  current_width: 0,
  list_message: [],
  list_unread_message: [],
  latest_message: {},
  show_popup: false,
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    /** lưu page_id */
    setPageId: (state, action: PayloadAction<string>) => {
      state.page_id = action.payload
    },
    /** lưu client_id */
    setClientId: (state, action: PayloadAction<string>) => {
      state.page_id = action.payload
    },

    /** lưu dữ liệu Trang */
    setLocale: (state, action: PayloadAction<AppState['locale']>) => {
      state.locale = action.payload
    },
    /** lưu dữ Kích thước chiều rộng trang */
    setCurrentWidth: (state, action: PayloadAction<number>) => {
      state.current_width = action.payload
    },
    /** lưu dữ Kích thước chiều rộng trang */
    setStatusPopup: (state, action: PayloadAction<boolean>) => {
      state.show_popup = action.payload
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
  },
})

// Action creators are generated for each case reducer function
export const {
  setPageId,
  setClientId,
  setLocale,
  setCurrentWidth,
  setListMessage,
  setListUnreadMessage,
  setLatestMessageGlobal,
  setStatusPopup,
} = appSlice.actions

/** chọn đến page id */
export const selectPageId = (state: RootState) => state.app.page_id

/** chọn đến client id */
export const selectOrgId = (state: RootState) => state.app.client_id

/** chọn đầu dữ liệu Locale */
export const selectLocale = (state: RootState) => state.app.locale

/** chọn đầu dữ liệu Locale */
export const selectCurrentWidth = (state: RootState) => state.app.current_width

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

export default appSlice.reducer
