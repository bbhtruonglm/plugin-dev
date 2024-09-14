import facebook from '../../assets/facebook.svg'
import instagram from '../../assets/instagram.svg'
import whatsapp from '../../assets/whatsapp.svg'
import zalo from '../../assets/zalo.svg'
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
        <h4 className="text-xs font-medium">
          hoặc chat với chúng tôi qua kênh mà bạn thích:
        </h4>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {chatList.map((item, index) => (
            <a
              className="flex gap-1 items-center p-1 cursor-pointer"
              key={index}
              href={item.url}
              target="_blank"
              rel="noreferrer"
            >
              <div className="bg-gray-100 p-2 rounded-full">
                <img
                  src={item.icon}
                  alt=""
                  className="w-4 h-4"
                />
              </div>
              <p className="text-xs font-medium">{item.name}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChatOption
