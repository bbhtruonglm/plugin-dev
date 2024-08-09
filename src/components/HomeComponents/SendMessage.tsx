import IconSend from "../../assets/send.svg";
import React from "react";
function SendMessage() {
  return (
    <div className="bg-white p-3 rounded-xl flex justify-between px-6 items-center shadow-md">
      <div>
        <h4 className="text-base font-semibold">Gửi tin nhắn đến chúng tôi</h4>
        <h5 className="flex gap-2 items-center text-sm text-[#16A34A]">
          <div className="w-4 h-4 rounded-full bg-[#16A34A]"></div> Chúng tôi
          đang online
        </h5>
      </div>
      <div>
        <img src={IconSend} alt="" />
      </div>
    </div>
  );
}

export default SendMessage;
