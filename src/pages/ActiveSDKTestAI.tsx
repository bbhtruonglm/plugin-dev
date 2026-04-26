import { useEffect, useState } from 'react'

import LoadingSize from '@/components/Loading/LoadingSize'
import ModalContent2 from '@/components/ModalContent2'
import WIDGET from 'bbh-chatbox-widget-js-sdk'
import { t } from 'i18next'

const ActiveSDKTestAI = () => {
  /**
   * State lưu access_token
   */
  const [access_token, setAccessToken] = useState('')
  /** State loading */
  const [loading, setLoading] = useState(false)
  /** State mở cảnh báo */
  const [open_warning, setOpenWarning] = useState(false)
  /** Loại modal */
  const [type, setType] = useState<'warning' | 'success' | 'error'>('warning')
  /** Message    */
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    /** Lấy access_token từ URL */
    const PARAMS = new URLSearchParams(window.location.search)
    /**
     * Lấy access_token từ URL
     */
    const TOKEN = PARAMS.get('access_token')
    /**
     * Nếu có access_token thì lưu vào state và in ra console
     */
    if (TOKEN) {
      setAccessToken(TOKEN)
      console.log('Access Token:', TOKEN)
    }
  }, [])

  const handleActive = async () => {
    /**
     * Set loading
     */
    setLoading(true)
    /**
     * Nếu có access_token thì gửi request lên server
     */
    if (access_token) {
      try {
        /** Goị hàm OAuth */
        await WIDGET.oAuth()
        /** Gửi request lên server */
        setOpenWarning(true)
        /** Set loại modal */
        setType('success')
        /** Set message */
        setMessage(t('active_success'))
      } catch (error) {
        /** Hiện thị cảnh báo */
        setOpenWarning(true)
        /** Set loại modal */
        setType('error')
        /** Set message */
        setMessage(t('active_fail'))
      } finally {
        /** Set loading */
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen gap-y-2">
      <h1 className="text-2xl">{t('active_sdk_message')}</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer flex gap-x-2 items-center truncate"
        onClick={handleActive}
        disabled={loading}
      >
        {t('active')}
        {loading && (
          <LoadingSize
            color_white
            size="sm"
          />
        )}
      </button>

      {open_warning && (
        <ModalContent2
          type={type}
          title={
            type === 'success'
              ? t('success')
              : type === 'error'
              ? t('failed')
              : t('warning')
          }
          message={message}
          onCancel={() => {
            setOpenWarning(false)
          }}
          onConfirm={() => {
            setOpenWarning(false)
            window.close()
          }}
        />
      )}
    </div>
  )
}

export default ActiveSDKTestAI
