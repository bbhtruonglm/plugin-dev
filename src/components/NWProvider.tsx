import { ReactNode, createContext, useEffect, useState } from 'react'

export const NetworkContext = createContext(false)

interface NetworkProviderProps {
  /**
   * Children components
   */
  children: ReactNode
}

export const NetworkProvider = ({ children }: NetworkProviderProps) => {
  /**
   * Trạng thái kết nối mạng
   */
  const [is_online, setIsOnline] = useState(navigator.onLine)
  /**
   * Lắng nghe sự kiện online và offline
   */
  useEffect(() => {
    /**
     *
     * hàm xử lý khi online
     * @returns
     */
    const handleOnline = () => setIsOnline(true)
    /**
     *  hàm xử lý khi offline
     * @returns
     */
    const handleOffline = () => setIsOnline(false)
    /**
     * Lắng nghe sự kiện online và offline
     */
    window.addEventListener('online', handleOnline)
    /**
     * Lắng nghe sự kiện online và offline
     */
    window.addEventListener('offline', handleOffline)

    /**
     * Hủy lắng nghe sự kiện online và offline
     */
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <NetworkContext.Provider value={is_online}>
      {children}
    </NetworkContext.Provider>
  )
}
