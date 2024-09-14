import { ReactComponent as facebook } from '@/assets/facebook.svg'
import { ReactComponent as instagram } from '@/assets/instagram.svg'
import { t } from 'i18next'
import { ReactComponent as whatsapp } from '@/assets/whatsapp.svg'
import { ReactComponent as zalo } from '@/assets/zalo.svg'
function ChatOption() {
  /** Tạo list chat với các phương thức liên hệ đến bbh */
  const chatList = [
    {
      name: '@botbanhang.fb',
      url: 'https://m.me/100179064765476',
      icon: facebook,
    },
    {
      name: '@botbanhang.ig',
      url: '',
      icon: instagram,
    },
    {
      name: '@botbanhang.oa',
      url: 'https://zalo.me/1591257820328477563',
      icon: zalo,
    },
    {
      name: '1900.9999.70',
      url: '',
      icon: whatsapp,
    },
  ]
  return (
    <div className="bg-white p-3 rounded-xl flex justify-between px-6 items-center shadow-md">
      <div>
        <h4 className="text-xs font-medium">{t('chatWithUs')}</h4>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {chatList.map(({ name, url, icon: Icon }, index) => (
            <a
              className="flex gap-1 items-center p-1 cursor-pointer"
              key={index}
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              <div className="bg-gray-100 p-2 rounded-full">
                <Icon />
              </div>
              <p className="text-xs font-medium">{name}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChatOption
