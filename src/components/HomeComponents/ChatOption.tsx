import { ReactComponent as Facebook } from '@/assets/facebook.svg'
import { ReactComponent as Instagram } from '@/assets/instagram.svg'
import { ReactComponent as Whatsapp } from '@/assets/whatsapp.svg'
import { ReactComponent as Zalo } from '@/assets/zalo.svg'
import { t } from 'i18next'
function ChatOption({ social_link }: any) {
  // if (!social_link) return null

  /** Tạo list chat với các phương thức liên hệ đến bbh */
  const chatList = [
    {
      name: '@botbanhang.fb',
      url: 'https://m.me/100179064765476',
      icon: Facebook,
    },
    {
      name: '@botbanhang.ig',
      url: '',
      icon: Instagram,
    },
    {
      name: '@botbanhang.oa',
      url: 'https://zalo.me/1591257820328477563',
      icon: Zalo,
    },
    {
      name: '1900.9999.70',
      url: '',
      icon: Whatsapp,
    },
  ]
  return (
    <div className="bg-white p-3 rounded-xl flex justify-between px-6 items-center shadow-md">
      <div>
        <h4 className="text-sm font-medium">{t('chatWithUs')}</h4>

        <div className="flex w-full gap-6 mt-2">
          {!!social_link?.length &&
            social_link.map((item: any, index: number) => (
              <a
                className="flex gap-1 items-center p-1 cursor-pointer"
                key={index}
                href={item.url}
                target="_blank"
                rel="noreferrer"
              >
                <div className="bg-gray-100 p-2 rounded-full flex items-center justify-center">
                  {item.type === 'FACEBOOK' && (
                    <Facebook className=" text-blue-700" />
                  )}
                  {item.type === 'ZALO' && <Zalo className=" text-blue-600" />}
                  {item.type === 'WHATSAPP' && (
                    <Whatsapp className=" text-green-600" />
                  )}
                  {item.type === 'INSTAGRAM' && (
                    <Instagram className=" text-pink-600" />
                  )}
                </div>
                <p className="text-sm font-medium truncate">{item.title}</p>
              </a>
            ))}
        </div>
      </div>
    </div>
  )
}

export default ChatOption
