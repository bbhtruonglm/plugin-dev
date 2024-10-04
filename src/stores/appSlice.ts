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
  unread_count: 0,
  latest_message: {},
  // latest_message: {
  //   _id: '66f387d9271db2db8a88f4f4',
  //   fb_page_id: '100179064765476',
  //   fb_client_id: '6131478076934694',
  //   platform_type: 'FB_MESS',
  //   message_type: 'page',
  //   sender_id: '100179064765476',
  //   recipient_id: '6131478076934694',
  //   time: '2024-09-25T03:47:37.059Z',
  //   message_mid:
  //     'm_hukRF2b55fWYOr0BCDLSEsw7jQrJjGjlxnapic_pyarVSe1_gWj4yEjcXoUL_kz7vMHzD9nzKjguLyqXmz9uug',
  //   message_attachments: [
  //     {
  //       type: 'template',
  //       title: 'tiêu đề của silder',
  //       payload: {
  //         template_type: 'generic',
  //         sharable: false,
  //         elements: [
  //           {
  //             title: 'tiêu đề của silder',
  //             image_url:
  //               'https://static.botbanhang.vn/chatbot/100179064765476/slider/236168d4-e036-4038-aed7-9034fdfe94b5-1727235884975.jpg',
  //             default_action: {
  //               type: 'web_url',
  //               url: 'https://google.com/',
  //             },
  //             buttons: [
  //               {
  //                 type: 'postback',
  //                 title: 'nút kịch bản',
  //                 payload: '<FLOW>_db7867d2e25d46b8aac018d8adffa099',
  //               },
  //               {
  //                 type: 'web_url',
  //                 title: 'nút web',
  //                 url: 'https://google.com/',
  //               },
  //               {
  //                 type: 'phone_number',
  //                 title: 'nút dtk',
  //                 url: 'tel:+84839383938',
  //                 payload: '+84839383938',
  //               },
  //             ],
  //             subtitle: 'phụ đề ở đây',
  //           },
  //           {
  //             title: 'tiêu đề của silder',
  //             image_url:
  //               'https://static.botbanhang.vn/chatbot/100179064765476/slider/236168d4-e036-4038-aed7-9034fdfe94b5-1727235884975.jpg',
  //             default_action: {
  //               type: 'web_url',
  //               url: 'https://google.com/',
  //             },
  //             buttons: [
  //               {
  //                 type: 'postback',
  //                 title: 'nút kịch bản',
  //                 payload: '<FLOW>_db7867d2e25d46b8aac018d8adffa099',
  //               },
  //               {
  //                 type: 'web_url',
  //                 title: 'nút web',
  //                 url: 'https://google.com/',
  //               },
  //               {
  //                 type: 'phone_number',
  //                 title: 'nút dtk',
  //                 url: 'tel:+84839383938',
  //                 payload: '+84839383938',
  //               },
  //             ],
  //             subtitle: 'phụ đề ở đây',
  //           },
  //           {
  //             title: 'tiêu đề của silder',
  //             image_url:
  //               'https://static.botbanhang.vn/chatbot/100179064765476/slider/236168d4-e036-4038-aed7-9034fdfe94b5-1727235884975.jpg',
  //             default_action: {
  //               type: 'web_url',
  //               url: 'https://google.com/',
  //             },
  //             buttons: [
  //               {
  //                 type: 'postback',
  //                 title: 'nút kịch bản',
  //                 payload: '<FLOW>_db7867d2e25d46b8aac018d8adffa099',
  //               },
  //               {
  //                 type: 'web_url',
  //                 title: 'nút web',
  //                 url: 'https://google.com/',
  //               },
  //               {
  //                 type: 'phone_number',
  //                 title: 'nút dtk',
  //                 url: 'tel:+84839383938',
  //                 payload: '+84839383938',
  //               },
  //             ],
  //             subtitle: 'phụ đề ở đây',
  //           },
  //           {
  //             title: 'tiêu đề của silder',
  //             image_url:
  //               'https://static.botbanhang.vn/chatbot/100179064765476/slider/236168d4-e036-4038-aed7-9034fdfe94b5-1727235884975.jpg',
  //             default_action: {
  //               type: 'web_url',
  //               url: 'https://google.com/',
  //             },
  //             buttons: [
  //               {
  //                 type: 'postback',
  //                 title: 'nút kịch bản',
  //                 payload: '<FLOW>_db7867d2e25d46b8aac018d8adffa099',
  //               },
  //               {
  //                 type: 'web_url',
  //                 title: 'nút web',
  //                 url: 'https://google.com/',
  //               },
  //               {
  //                 type: 'phone_number',
  //                 title: 'nút dtk',
  //                 url: 'tel:+84839383938',
  //                 payload: '+84839383938',
  //               },
  //             ],
  //             subtitle: 'phụ đề ở đây',
  //           },
  //           {
  //             title: 'tiêu đề của silder',
  //             image_url:
  //               'https://static.botbanhang.vn/chatbot/100179064765476/slider/236168d4-e036-4038-aed7-9034fdfe94b5-1727235884975.jpg',
  //             default_action: {
  //               type: 'web_url',
  //               url: 'https://google.com/',
  //             },
  //             buttons: [
  //               {
  //                 type: 'postback',
  //                 title: 'nút kịch bản',
  //                 payload: '<FLOW>_db7867d2e25d46b8aac018d8adffa099',
  //               },
  //               {
  //                 type: 'web_url',
  //                 title: 'nút web',
  //                 url: 'https://google.com/',
  //               },
  //               {
  //                 type: 'phone_number',
  //                 title: 'nút dtk',
  //                 url: 'tel:+84839383938',
  //                 payload: '+84839383938',
  //               },
  //             ],
  //             subtitle: 'phụ đề ở đây',
  //           },
  //         ],
  //       },
  //       _id: '66f387d9271db2db8a88f4f5',
  //     },
  //   ],
  //   ai: [],
  //   createdAt: '2024-09-25T03:47:37.677Z',
  //   updatedAt: '2024-09-25T03:47:37.677Z',
  //   __v: 0,
  //   attachment_size: [],
  // },
  show_popup: false,
  is_init: false,
  preview_url: '',
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
    /** lưu dữ Số lượng tin nhắn chưa đọc */
    setGlobalUnreadCount: (state, action: PayloadAction<number>) => {
      state.unread_count = action.payload
    },
    /** lưu dữ trạng thái đóng mở */
    setStatusPopup: (state, action: PayloadAction<boolean>) => {
      state.show_popup = action.payload
    },
    /** lưu dữ trạng thái khởi tạo */
    setStatusIsInit: (state, action: PayloadAction<boolean>) => {
      state.is_init = action.payload
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
  setGlobalClientId,
  setLocale,
  setCurrentWidth,
  setListMessage,
  setListUnreadMessage,
  setLatestMessageGlobal,
  setStatusPopup,
  setStatusIsInit,
  setGlobalUnreadCount,
  setGlobalPreviewUrl,
} = appSlice.actions

/** chọn đến page id */
export const selectPageId = (state: RootState) => state.app.page_id

/** chọn đến client id */
export const selectGlobalClientId = (state: RootState) => state.app.client_id

/** chọn đầu dữ liệu Locale */
export const selectLocale = (state: RootState) => state.app.locale

/** chọn đầu dữ liệu kích thước chiều rộng */
export const selectCurrentWidth = (state: RootState) => state.app.current_width
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
/** chọn đầu trạng thái Khởi tạo client */
export const selectStatusIsInit = (state: RootState) => state.app.is_init
/** Chọn đầu ra Preview Url */
export const selectGlobalPreviewUrl = (state: RootState) =>
  state.app.preview_url

export default appSlice.reducer
