import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { formatTimestamp } from '@/utils'
import { isEmpty } from 'lodash'
import { t } from 'i18next'

interface OrderConfirmationModalProps {
  /** Trạng thái đóng mở modal */
  is_open: boolean
  /** Hàm đóng modal */
  onClose: () => void
  /** Dữ liệu order */
  data?: any
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  is_open,
  onClose,
  data,
}) => {
  if (!is_open) return null
  console.log(data, 'data')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in duration-200">
        <div className="flex justify-between p-3 border-b">
          <div className="size-8"></div>

          {/* Title */}
          <h2 className="text-center font-semibold text-lg">
            Order confirmation
          </h2>
          <button
            onClick={onClose}
            className=" text-slate-500 hover:text-slate-700 transition p-1 rounded-full hover:bg-slate-200 size-8"
          >
            <XMarkIcon className="size-6" />
          </button>
        </div>
        <div className="p-3 font-medium">
          <div className="flex flex-col p-3 pt-0 gap-3">
            {/* Product Info */}
            <div className="flex flex-col">
              <p className="uppercase text-xs text-slate-400 font-semibold py-2">
                Items
              </p>
              <div className="flex flex-col gap-2">
                {data?.elements &&
                  data?.elements.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex gap-3"
                    >
                      <div className="w-16 h-16 bg-slate-200 rounded-md overflow-hidden">
                        <img
                          src={item?.image_url || '/placeholder.png'}
                          alt={item?.title || 'Product image'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-medium text-slate-800">
                        {item?.title || t('product_title')}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Ordered On */}
            <div className="">
              <p className="uppercase text-xs text-slate-400 font-semibold py-2">
                Ordered on
              </p>
              <p className="text-slate-700">
                {formatTimestamp(data?.timestamp)}
              </p>
            </div>

            {/* Paid With */}
            <div className="">
              <p className="uppercase text-xs text-slate-400 font-semibold py-2">
                Paid with
              </p>
              <p className="text-slate-700">{data?.payment_method}</p>
            </div>

            {/* Deliver To */}
            <div className="">
              <p className="uppercase text-xs text-slate-400 font-semibold">
                Deliver to
              </p>
              <p className="text-slate-700 whitespace-pre-line">
                {data?.address?.street_1 + data?.address?.street_2}
              </p>
              <p className="text-slate-700 whitespace-pre-line">
                {data?.address?.city +
                  ', ' +
                  data?.address?.state +
                  ' ' +
                  data?.address?.postal_code}
              </p>
            </div>

            {/* Summary */}
            <div>
              <p className="uppercase text-xs text-slate-400 font-semibold py-2">
                Summary
              </p>
              <div className="text-slate-700 text-sm flex flex-col gap-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${data?.summary?.subtotal || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>${data?.summary?.shipping_cost || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated tax</span>
                  <span>${data?.summary?.total_tax || '0'}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {!isEmpty(data?.adjustments) &&
                    data?.adjustments.map((adj: any, index: number) => (
                      <div
                        className="flex justify-between"
                        key={index}
                      >
                        <span>{adj.name}</span>
                        <span>- ${adj.amount}</span>
                      </div>
                    ))}
                </div>

                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>${data?.summary?.total_cost || '0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmationModal
