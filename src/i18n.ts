import LanguageDetector from 'i18next-browser-languagedetector'
import { en } from '@/lang/en'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { vn } from '@/lang/vn'

// Cấu hình i18next
i18n
  .use(LanguageDetector) // Tự động phát hiện ngôn ngữ
  .use(initReactI18next) // Tích hợp với React
  .init({
    resources: {
      en: en,
      us: en,
      vn: vn,
      vi: vn,
    }, // Cung cấp tài nguyên dịch
    // lng: 'en', // Ngôn ngữ mặc định
    fallbackLng: 'en', // Ngôn ngữ fallback
    interpolation: {
      escapeValue: false, // React đã xử lý vấn đề bảo mật này
    },
    detection: {
      order: ['querystring', 'localStorage', 'cookie', 'navigator'], // Thứ tự phát hiện ngôn ngữ
      lookupQuerystring: 'locale', // Query string để lấy ngôn ngữ, ví dụ: ?lng=vi
      // caches: ['localStorage'], // Lưu ngôn ngữ đã chọn
      // Custom logic: Hợp nhất các giá trị 'vn' và 'vi' thành 'vi'
      lookupFromPathIndex: 0,
    },
  })

export default i18n
