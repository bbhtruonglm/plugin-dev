import appReducer from '@/stores/appSlice'
import { configureStore } from '@reduxjs/toolkit'
/**
 * Store của ứng dụng
 * Không được đổi tên
 */
export const store = configureStore({
  reducer: { app: appReducer },
  /** Optional: Thêm middleware nếu bạn có cấu hình cụ thể */
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: true }),
})

/** Infer the `RootState` and `AppDispatch` types from the store itself */
export type RootState = ReturnType<typeof store.getState>
/** Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState} */
export type AppDispatch = typeof store.dispatch
