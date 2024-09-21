import { AppState } from './type'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/stores'
import { createSlice } from '@reduxjs/toolkit'

const initialState: AppState = {
  page_id: '',
  client_id: '',
  locale: 'vi',
  current_width: 0,
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
  },
})

// Action creators are generated for each case reducer function
export const { setPageId, setClientId, setLocale, setCurrentWidth } =
  appSlice.actions

/** chọn đến page id */
export const selectPageId = (state: RootState) => state.app.page_id

/** chọn đến client id */
export const selectOrgId = (state: RootState) => state.app.client_id

/** chọn đầu dữ liệu Locale */
export const selectLocale = (state: RootState) => state.app.locale

/** chọn đầu dữ liệu Locale */
export const selectCurrentWidth = (state: RootState) => state.app.current_width

export default appSlice.reducer
