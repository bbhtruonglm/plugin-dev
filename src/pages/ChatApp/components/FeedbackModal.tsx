import React, { useState } from 'react'
import { selectPageAllowAvatar, selectPageLogoBlack } from '@/stores/appSlice'

import { StarIcon } from '@heroicons/react/16/solid'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { renderLogo } from '@/utils'
import { useSelector } from 'react-redux'

interface FeedbackModalProps {
  is_open: boolean
  onClose: () => void
  onSubmit?: (rating: number, feedback: string) => void
  companyName?: string
  avatarUrl?: string
  /** Dữ liệu feedback */
  data?: any
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  is_open,
  onClose,
  onSubmit,
  companyName = 'Original Coast Clothing',
  avatarUrl = '/placeholder.png',
  data,
}) => {
  const [rating, setRating] = useState<number>(0)
  const [hover, setHover] = useState<number>(0)
  const [feedback, setFeedback] = useState('')

  /** Page Allow Avatar */
  const ORG_ALLOW_AVATAR = useSelector(selectPageAllowAvatar)

  /**
   * link logo
   */
  const LOGO_PAGE_CUSTOM_BLACK = useSelector(selectPageLogoBlack)

  if (!is_open) return null

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit?.(rating, feedback)
      onClose()
    }
  }

  console.log(data, 'data')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg h-fit max-h-[96dvh] overflow-hidden relative animate-in fade-in duration-200">
        {/* Header */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 transition p-1 rounded-full hover:bg-slate-200 size-8 flex justify-center items-center"
        >
          <XMarkIcon className="size-5" />
        </button>

        <div className="flex flex-col items-center p-4 gap-3">
          {/* Avatar */}
          <div className="flex items-center py-3 justify-center h-20 w-full">
            <div className="flex justify-center">
              <div>
                {(() => {
                  /** Logo source */
                  const LOGO_SRC = renderLogo(
                    ORG_ALLOW_AVATAR,
                    LOGO_PAGE_CUSTOM_BLACK,
                    './images/Logo_retion_white.png'
                  )
                  /** Nếu logo source === logo mặc định */
                  const IS_DEFAULT_LOGO =
                    LOGO_SRC === './images/Logo_retion_white.png'
                  return (
                    <img
                      src={LOGO_SRC + `?v=${Date.now()}`}
                      alt="Company Logo"
                      className={`${
                        IS_DEFAULT_LOGO ? '' : 'rounded-full'
                      } size-20 object-cover`}
                    />
                  )
                })()}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {/* Title */}
            <h2 className="text-center text-xl font-medium">{data?.title}?</h2>
            <div className="flex flex-col gap-3">
              {/* Rating Stars */}
              <div className="flex flex-col items-center gap-2">
                {/* Negative / Positive labels */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-xs text-slate-500 w-full mx-auto">
                    <span>Negative</span>
                    <span>Positive</span>
                  </div>
                  {/* Stars */}
                  <div
                    className="flex justify-center gap-3"
                    id="star-row"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className={`transition p-1.5 rounded-full ${
                          star <= rating
                            ? 'bg-blue-600 hover:bg-blue-500'
                            : 'bg-slate-100 hover:bg-slate-300'
                        }`}
                      >
                        <StarIcon
                          className={`size-7 ${
                            star <= rating ? 'text-white' : 'text-black'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback textarea */}
            <div className="w-full flex flex-col">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, 400))}
                placeholder="Give additional feedback"
                className="w-full border bg-gray-100 hover:bg-gray-200 text-black border-slate-300 rounded-lg p-3 text-sm resize-none focus:bg-white focus:outline-none placeholder:text-slate-500 placeholder:font-medium focus:ring-1 focus:ring-slate-700"
                rows={4}
              />

              <div className="text-right text-xs text-slate-400">
                {feedback.length}/400
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full">
            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className={`w-full py-2.5 rounded-lg font-medium text-white transition ${
                rating === 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Submit
            </button>

            {/* Footer note */}
            <p className="text-sm text-center text-slate-500">
              Your response will be sent directly to {companyName} and Facebook.
              <br />
              <span className="font-semibold hover:underline cursor-pointer">
                View {companyName}'s Privacy Policy.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedbackModal
