import { ReactComponent as Apple } from '@/assets/Logo/Apple.svg'
import { ReactComponent as Discord } from '@/assets/Logo/Discord.svg'
import { ReactComponent as Facebook } from '@/assets/facebook.svg'
import { ReactComponent as Github } from '@/assets/Logo/Github.svg'
import { ReactComponent as GooglePlayStore } from '@/assets/Logo/GooglePlayStore.svg'
import { ReactComponent as IG } from '@/assets/Logo/IG.svg'
import { ReactComponent as Line } from '@/assets/Logo/Line.svg'
import Link from '@/assets/Logo/Link'
import { ReactComponent as Linkedin } from '@/assets/Logo/Linkedin.svg'
import Mail from '@/assets/Logo/Mail'
import { ReactComponent as Messenger } from '@/assets/Logo/Messenger.svg'
import Phone from '@/assets/Logo/Phone'
import { ReactComponent as Pinterest } from '@/assets/Logo/Pinterest.svg'
import { ReactComponent as Reddit } from '@/assets/Logo/Reddit.svg'
import { ReactComponent as Telegram } from '@/assets/Logo/Telegram.svg'
import { ReactComponent as Threads } from '@/assets/Logo/threads.svg'
import { ReactComponent as Tiktok } from '@/assets/Logo/Tiktok.svg'
import { ReactComponent as Twitch } from '@/assets/Logo/Twitch.svg'
import { ReactComponent as Twitter } from '@/assets/Logo/Twitter.svg'
import { ReactComponent as VK } from '@/assets/Logo/VK.svg'
import { ReactComponent as Viber } from '@/assets/Logo/Viber.svg'
import WSapp from '@/assets/Logo/WSapp'
import { ReactComponent as Youtube } from '@/assets/Logo/youtube.svg'
import Zalo from '@/assets/Logo/Zalo'
import { renderURLPrefix } from '@/utils'
import { t } from 'i18next'

function ChatOption({ social_link, social_description }: any) {
  return (
    <div className="bg-white p-3 rounded-xl flex justify-between items-center shadow-md w-full">
      <div className="flex flex-col w-full gap-y-2.5">
        <h4 className="text-xs font-medium">
          {social_description || t('chatWithUs')}
        </h4>

        <div className="grid grid-cols-2 max-h-24 overflow-y-auto w-full gap-x-2.5 gap-y-1">
          {!!social_link?.length &&
            social_link.map((item: any, index: number) => (
              <a
                className="flex gap-1 items-center p-1 cursor-pointer"
                key={index}
                href={renderURLPrefix(item.type, item.value)}
                target="_blank"
                rel="noreferrer"
              >
                <div className="bg-gray-100 p-2 rounded-full flex items-center justify-center">
                  {item?.type === 'LINK_WEB' && <Link />}
                  {item?.type === 'PHONE' && <Phone />}
                  {item?.type === 'FACEBOOK' && <Facebook />}
                  {item?.type === 'MAIL' && <Mail />}
                  {item?.type === 'INSTAGRAM' && <IG />}
                  {item?.type === 'WHATSAPP' && <WSapp />}
                  {item?.type === 'ZALO' && <Zalo />}
                  {item?.type === 'TIKTOK' && <Tiktok className="w-4 h-4 " />}
                  {item?.type === 'THREADS' && <Threads className="w-4 h-4" />}
                  {item?.type === 'TWITTER' && <Twitter className="w-4 h-4 " />}
                  {item?.type === 'TELEGRAM' && (
                    <Telegram className="w-4 h-4 " />
                  )}
                  {item?.type === 'YOUTUBE' && <Youtube className="w-4 h-4" />}
                  {item?.type === 'LINKEDIN' && (
                    <Linkedin className="w-4 h-4 " />
                  )}
                  {item?.type === 'REDDIT' && <Reddit className="w-4 h-4 " />}
                  {item?.type === 'MESSENGER' && (
                    <Messenger className="w-4 h-4 " />
                  )}
                  {item?.type === 'GITHUB' && <Github className="w-4 h-4 " />}
                  {item?.type === 'PINTEREST' && (
                    <Pinterest className="w-4 h-4 " />
                  )}
                  {item?.type === 'LINE' && <Line className="w-4 h-4 " />}
                  {item?.type === 'VIBER' && <Viber className="w-4 h-4 " />}
                  {item?.type === 'DISCORD' && <Discord className="w-4 h-4 " />}
                  {item?.type === 'VK' && <VK className="w-4 h-4 " />}
                  {item?.type === 'TWITCH' && <Twitch className="w-4 h-4 " />}
                  {item?.type === 'APP_STORE' && <Apple className="w-4 h-4 " />}
                  {item?.type === 'GOOGLE_PLAY_STORE' && (
                    <GooglePlayStore className="w-4 h-4 " />
                  )}
                </div>
                <p className="text-xs font-medium truncate">
                  {item.title || item.value}
                </p>
              </a>
            ))}
        </div>
      </div>
    </div>
  )
}

export default ChatOption
