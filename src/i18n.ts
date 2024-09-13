import { en } from 'lang/en'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { vn } from 'lang/vn'

// Cấu hình i18next
i18n
  .use(initReactI18next) // Tích hợp với React
  .init({
    resources: {
      en: en,
      us: en,
      vn: vn,
      vi: vn,
    }, // Cung cấp tài nguyên dịch
    lng: 'en', // Ngôn ngữ mặc định
    fallbackLng: 'en', // Ngôn ngữ fallback
    interpolation: {
      escapeValue: false, // React đã xử lý vấn đề bảo mật này
    },
  })

export default i18n
