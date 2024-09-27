import { ModalProps } from './type'
import React from 'react'

const Modal: React.FC<ModalProps> = ({ is_open, onClose, children }) => {
  if (!is_open) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div className="relative">
        {children}
        <button
          className="absolute top-2 right-2 text-white text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  )
}

export default Modal
