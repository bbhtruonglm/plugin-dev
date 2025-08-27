import {
  selectClientName,
  selectIsActiveCTAMessage,
  selectLatestMessage,
  selectListCTAMessage,
  setOnClickCTA,
} from '@/stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'

import ChatOption from '@/components/HomeComponents/ChatOption'
import FAQ from '@/components/HomeComponents/FAQ'
import { HomeProps } from './type'
import SendMessage from '@/components/HomeComponents/SendMessage'
import UnreadMessage from '@/components/HomeComponents/UnreadMessage'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

function Home({
  onNavigate,
  onError,
  social_link,
  web_form,
  social_description,
}: HomeProps) {
  /** Dịch ngôn ngữ */
  const { t, i18n: I18N } = useTranslation()

  /** Lấy ngôn ngữ */
  const LANGUAGE = I18N.language

  /** Client name */
  const CLIENT_NAME = useSelector(selectClientName)

  /**
   * Lấy thông tin từ web_form
   */
  const { is_active, source } = web_form || {}

  /**
   * Lấy title và description từ source
   */
  const { title, description } = source[I18N.language] || {}
  /** Hàm dispatch */
  const dispatch = useDispatch()

  /** Tin nhắn mới nhất*/
  const LATEST_MESSAGE = useSelector(selectLatestMessage)
  /** IS ACTIVE CTA */
  const IS_ACTIVE_CTA = useSelector(selectIsActiveCTAMessage)
  /** LIST CTA */
  const LIST_CTA = useSelector(selectListCTAMessage)
  /** Dữ liệu CTA */
  const DATA_CTA = useMemo(() => {
    if (!LIST_CTA?.data) return []

    return (
      LIST_CTA.data
        /** Lọc những item đang active */
        .filter((item) => item?.is_active)
        /** Lấy dữ liệu theo ngôn ngữ, fallback về item gốc nếu không có */
        .map((item) => item?.source?.[LANGUAGE] || item)
    )
  }, [LIST_CTA, LANGUAGE])

  return (
    <div className="flex flex-col px-5 py-3 gap-y-5">
      {/* Greeting */}
      <div className="">
        <h1 className="text-2xl font-semibold">
          {CLIENT_NAME
            ? `${title || t('_hi')} ${CLIENT_NAME},` ||
              `${t('_hi')} ${CLIENT_NAME},`
            : t('welcome')}
        </h1>
        <h2 className="text-xl font-medium">
          {description || t('welcomeMessage')}
        </h2>
      </div>

      {/* Send message */}
      {LATEST_MESSAGE && (
        <UnreadMessage
          onNavigate={onNavigate}
          onError={onError}
        />
      )}

      {/* Send message */}

      <SendMessage
        onNavigate={onNavigate}
        onError={onError}
      />

      {/* Lựa chọn kênh liên lạc. Nếu không có list social thì ẩn đi */}
      {!!social_link?.length && (
        <ChatOption
          social_link={social_link}
          social_description={social_description[I18N.language]}
        />
      )}
      {/* FAQ */}
      {IS_ACTIVE_CTA && DATA_CTA && (
        <FAQ
          title={t('faq_question')}
          data={DATA_CTA}
          onClickCTA={(item) => {
            /** Lưu giá trị CTA đã click */
            dispatch(setOnClickCTA(item))
            /** Set timeout */
            setTimeout(() => {
              /** Navigate sang màn message */
              onNavigate()
            }, 200)
          }}
        />
      )}
    </div>
  )
}

export default Home
