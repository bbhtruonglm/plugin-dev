import React from 'react'
import facebook from '../../assets/facebook.svg'
import instagram from '../../assets/instagram.svg'
import whatsapp from '../../assets/whatsapp.svg'
import zalo from '../../assets/zalo.svg'
function ChatOption() {
  const chatList = [
    {
      name: '@botbanhang.fb',
      icon: facebook,
    },
    {
      name: '@botbanhang.ig',
      icon: instagram,
    },
    {
      name: '@botbanhang.oa',
      icon: zalo,
    },
    {
      name: '1900.9999.70',
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
            <div
              className="flex gap-1 items-center p-1"
              key={index}
            >
              <div className="bg-gray-100 p-2 rounded-full">
                <img
                  src={item.icon}
                  alt=""
                  className="w-4 h-4"
                />
              </div>
              <p className="text-xs font-medium">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChatOption
