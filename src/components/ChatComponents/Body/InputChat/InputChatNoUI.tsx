import { useEffect } from 'react'

function InputChatNoUI() {
  /**
   * Lắng nghe sự kiện touchmove để tắt bàn phím khi user vuốt
   */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    /**
     * Cleanup
     */
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return <></>
}

export default InputChatNoUI
