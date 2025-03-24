import { useEffect, useState } from 'react'

import LoadingSize from '@/components/Loading/LoadingSize'
import ModalContent2 from '@/components/ModalContent2'
import { set } from 'lodash'
import { t } from 'i18next'

const ActiveSDK = () => {
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
      console.log('Access Token:', TOKEN) // In ra console để kiểm tra
    }
  }, [])

  const handleActive = async () => {
    /**
     * Set loading
     */
    setLoading(true)
    /**
     * Body gửi lên server
     */
    const BODY = {
      access_token: access_token,
      token_partner: 'active',
      _type: 'oauth-access-token',
    }
    /**
     * Nếu có access_token thì gửi request lên server
     */
    if (access_token) {
      try {
        const RES = await fetch(
          'https://chatbox-app.botbanhang.vn/v1/app/app-installed/update',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(BODY),
          }
        )
        /**
         * Chuyển response sang json
         */
        const RESPONSE = await RES.json()
        /**
         * Nếu response thành công thì mở cảnh báo
         */
        if (RESPONSE?.succes) {
          /** Mô cảnh báo */
          setOpenWarning(true)
          /** Loại cảnh báo */
          setType('success')
          /** Message */
          setMessage(t('active_success'))
        } else {
          /** Mở cảnh báo */
          setOpenWarning(true)
          /** Loại cảnh báo */
          setType('error')
          if (RESPONSE?.message?.message === 'invalid token') {
            /** Message */
            setMessage(t('active_invalid_token'))
            return
          }
          if (RESPONSE?.message?.message === 'token expired') {
            /** Message */
            setMessage(t('active_token_expired'))
            return
          }
          if (RESPONSE?.message?.message === 'token not found') {
            /** Message */
            setMessage(t('active_token_not_found'))
            return
          }
          setMessage(t('active_fail'))
        }
      } catch (error) {
        console.log(error)
        /** Mô cảnh báo */
        setOpenWarning(true)
        /** Loại cảnh báo */
        setType('error')
        /** Message */
        setMessage(t('active_fail'))
      } finally {
        /** Set loading false */
        setLoading(false)
      }
    } else {
      /** Mở cảnh báo */
      setOpenWarning(true)
      /** Loại cảnh báo */
      setType('error')
      /** Message  token*/
      setMessage(t('active_access_token_invalid'))
      /** Set loading false */
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen gap-y-2">
      <h1 className="text-2xl">{t('active_sdk')}</h1>
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
              ? t('sucsess')
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

export default ActiveSDK
