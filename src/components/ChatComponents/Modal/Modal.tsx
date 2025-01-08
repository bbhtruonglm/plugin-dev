import React, { useEffect, useState } from 'react'

import { ReactComponent as Close } from '@/assets/close.svg'
import { ModalProps } from '../type'

const Modal: React.FC<ModalProps> = ({ is_open, onClose, children }) => {
  /** @param is_visible: boolean */
  const [is_visible, setIsVisible] = useState(is_open)
  /**
   * @param is_open: boolean
   */
  useEffect(() => {
    /**
     * Nếu modal mở
     */
    if (is_open) {
      setIsVisible(true)
    } else {
      /** Delay to allow animation to complete before unmounting */
      const TIMEOUT_ID = setTimeout(() => setIsVisible(false), 300)
      /**
       * Cleanup function, loại bỏ timeout khi component bị unmount
       */
      return () => clearTimeout(TIMEOUT_ID)
    }
  }, [is_open])
  /**
   * Nếu modal không hiển thị
   */
  if (!is_visible) return null

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50 transition-opacity duration-100 ${
        is_open ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`relative transform transition-transform duration-100 ${
          is_open ? 'scale-100' : 'scale-90'
        }`}
        /** Ngăn chặn sự kiện đóng modal khi click vào nội dung */
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          className="absolute top-2 right-2 text-white text-2xl font-bold bg-slate-700 hover:bg-slate-500 p-1 rounded-full h-6 w-6 flex items-center justify-center"
          onClick={onClose}
        >
          <Close className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export default Modal
