import LanguageDetector from 'i18next-browser-languagedetector'
import { en } from '@/lang/en'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { ja } from '@/lang/jp'
import { ko } from '@/lang/kr'
import { th } from '@/lang/th'
import { vn } from '@/lang/vn'
import { zh } from '@/lang/cn'

/**
 * Cấu hình i18n
 */
i18n
  /** Tự động phát hiện ngôn ngữ */
  .use(LanguageDetector)
  /** Tích hợp với React */
  .use(initReactI18next)
  .init({
    /** Cung cấp tài nguyên dịch */
    resources: {
      en: en,
      us: en,
      vn: vn,
      vi: vn,
      cn: zh,
      zh: zh,
      th: th,
      ja: ja,
      jp: ja,
      ko: ko,
      kr: ko,
    },
    /** Ngôn ngữ mặc định */
    // lng: 'en',
    /** Ngôn ngữ fallback */
    fallbackLng: 'en',
    /**
     * Cấu hình cách dịch
     */
    interpolation: {
      /** React đã xử lý vấn đề bảo mật này */
      escapeValue: false,
    },
    /**
     * Cấu hình phát hiện ngôn ngữ
     */
    detection: {
      /** Thứ tự phát hiện ngôn ngữ */
      order: ['querystring', 'localStorage', 'cookie', 'navigator'],
      /** Query string để lấy ngôn ngữ, ví dụ: ?locale=vi */
      lookupQuerystring: 'locale',
      /** Lưu ngôn ngữ đã chọn */
      // caches: ['localStorage'],
      /**
       * Lấy ngôn ngữ từ path, ví dụ: /vi/home
       */
      lookupFromPathIndex: 0,
    },
  })

export default i18n
