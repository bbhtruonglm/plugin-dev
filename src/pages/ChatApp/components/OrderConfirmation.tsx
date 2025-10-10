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
  /** Nếu không open thì return null */
  if (!is_open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700 ">
      <div className="bg-white rounded-2xl shadow-xl w-full h-fit max-h-[96dvh] max-w-md overflow-hidden relative animate-in fade-in duration-200">
        <div className="flex justify-between p-3 border-b">
          <div className="size-8"></div>

          {/* Title */}
          <h2 className="text-center font-semibold text-2xl">
            {t('order_title')}
          </h2>
          <button
            onClick={onClose}
            className=" text-slate-500 hover:text-slate-700 transition p-1 rounded-full hover:bg-slate-200 size-8"
          >
            <XMarkIcon className="size-6" />
          </button>
        </div>
        <div className="p-3 font-medium h-full overflow-y-auto pb-14">
          <div className="flex flex-col p-3 pt-0 gap-3">
            {/* Product Info */}
            <div className="flex flex-col">
              <p className="uppercase text-xs text-slate-400 font-semibold py-2">
                {t('_items')}
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
                {t('ordered_on')}
              </p>
              <p className="text-slate-700">
                {formatTimestamp(data?.timestamp)}
              </p>
            </div>

            {/* Paid With */}
            <div className="">
              <p className="uppercase text-xs text-slate-400 font-semibold py-2">
                {t('paid_with')}
              </p>
              <p className="text-slate-700">{data?.payment_method}</p>
            </div>

            {/* Deliver To */}
            <div className="">
              <p className="uppercase text-xs text-slate-400 font-semibold">
                {t('deliver_to')}
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
            <div className="">
              <p className="uppercase text-xs text-slate-400 font-semibold py-2">
                {t('summary')}
              </p>
              <div className="text-slate-700 flex flex-col gap-2 text-base">
                <div className="flex justify-between">
                  <span className="font-medium">{t('sub_total')}</span>
                  <span>
                    ${Number(data?.summary?.subtotal).toFixed(2) || '0'}
                  </span>
                </div>
                <div className="flex justify-between ">
                  <span>{t('delivery')}</span>
                  <span>
                    ${Number(data?.summary?.shipping_cost).toFixed(2) || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('estimated_tax')}</span>
                  <span>
                    ${Number(data?.summary?.total_tax).toFixed(2) || '0'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {!isEmpty(data?.adjustments) &&
                    data?.adjustments.map((adj: any, index: number) => (
                      <div
                        className="flex justify-between"
                        key={index}
                      >
                        <span>{adj.name}</span>
                        <span>- ${Number(adj.amount).toFixed(2)}</span>
                      </div>
                    ))}
                </div>

                <div className="flex justify-between font-semibold text-base">
                  <span> {t('total')}</span>
                  <span>
                    ${Number(data?.summary?.total_cost).toFixed(2) || '0'}
                  </span>
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
