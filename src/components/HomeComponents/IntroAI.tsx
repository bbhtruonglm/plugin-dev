import React from 'react'
import imgAI from '../../assets/image.png'
function IntroAI() {
  return (
    <div className="bg-white p-3 rounded-xl flex justify-between gap-10 items-center shadow-md">
      <div className="flex flex-col gap-2.5">
        <img
          src={imgAI}
          alt=""
          className="w-full h-4"
        />
        <h2 className="flex gap-2 items-center text-sm font-medium">
          Increase agent efficiency by 31%
        </h2>
        <p className="text-sm font-normal text-colorOpacity line-clamp-3">
          We have made two new improvements to Custom Answers. We have
          introduced a new answer ending type to Custom Answers — “End answer”,
          which allows you to simply end the Custom Answer, rather than passing
          the conversation to a teammate, creating a ticket or ending the
          conversation. With this, you can: Seamlessly transition from a Custom
          Answer to an AI Answer (or another Custom Answer) if your customer has
          another question Add a reusable bot to the end Custom Answer, without
          having to use one of the existing Custom Answer ending options Custom
          Answers are a great way of guiding your customers through
          troubleshooting. With this new improvement, you can enable Fin to do
          more complex troubleshooting for specific topics or issues. We have
          also improved the matching system behind Custom Answers, meaning that
          Custom Answers only get triggered when needed. This has improved the
          precision of Custom Answers whilst increasing Fin’s AI Answer rate,
          resulting in a proved increase in the overall Resolution Rate for all
          customers using Custom Answers as a standalone or alongside AI
          Answers.
        </p>
      </div>
    </div>
  )
}

export default IntroAI
