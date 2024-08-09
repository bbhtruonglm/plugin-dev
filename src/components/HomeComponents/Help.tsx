import React from "react";
import blackArrow from "../../assets/black-arrow.svg";
import searchIcon from "../../assets/search.svg";
function Help() {
  const questionList = [
    {
      name: "Bot bán hàng là gì?",
    },
    {
      name: "Các tính năng AI của Bot Bán Hàng?",
    },
    {
      name: "Làm sao để mua và sử dụng Bot Bán Hàng với các tính năng AI?",
    },
    {
      name: "Thông tin về Bot Bán Hàng",
    },
  ];
  return (
    <div className="bg-white p-3 gap-2 rounded-xl flex justify-between flex-col items-center shadow-md">
      <div className="flex items-center bg-slate-100 justify-between py-2 px-3 rounded w-full">
        <input
          type="text"
          placeholder="Search for help"
          className="bg-transparent outline-none flex-grow placeholder:text-black text-sm font-medium"
        />
        <img src={searchIcon} className="w-4 h-4" alt="" />
      </div>
      <div>
        {questionList.map((item, index) => (
          <div className="flex justify-between py-2 px-3 text-sm font-medium">
            <h4>{item.name}</h4>
            <img src={blackArrow} className="w-4 h-4" alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Help;
