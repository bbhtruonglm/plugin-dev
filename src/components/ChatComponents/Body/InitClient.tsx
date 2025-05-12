import { UK_PHONE_REGEX, VN_PHONE_REGEX } from '@/utils'
// export default InitClient
import {
  selectLoadingGlobal,
  selectShowForm,
  selectUserInfo,
} from '@/stores/appSlice'
import { useEffect, useState } from 'react'

import { InitClientProps } from '../type'
import Input from './Input'
import Loading from '@/components/Loading/Loading'
import { isEmpty } from 'lodash'
import { t } from 'i18next'
import { useSelector } from 'react-redux'

function InitClient({ resetData, onInitClient }: InitClientProps) {
  /** Loading Global */
  const LOADING_GLOBAL = useSelector(selectLoadingGlobal)
  /** Lấy thông tin user từ store */
  const USER_INFO = useSelector(selectUserInfo)
  /** show init client từ store */
  const FORM_BEFORE_CHAT = useSelector(selectShowForm)
  /** Form values */
  const [form_values, setFormValues] = useState<Record<string, string>>({})
  /** Form errors */
  const [form_errors, setFormErrors] = useState<Record<string, string>>({})

  /** Pre-fill nếu có dữ liệu từ store */
  useEffect(() => {
    /** Check nếu có dữ liệu từ store */
    if (!isEmpty(USER_INFO)) {
      /** Lưu form lỗi */
      setFormValues((prev) => {
        return {
          ...prev,
          name: USER_INFO?.user_name || '',
          phone: USER_INFO?.user_phone || '',
          email: USER_INFO?.user_email || '',
        }
      })
    }
  }, [USER_INFO])
  /** Reset data */
  useEffect(() => {
    if (resetData) {
      setFormValues({})
      setFormErrors({})
    }
  }, [resetData])
  /** Handle change
   * @param field: string
   * @param value: string
   */
  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: '' }))
  }

  /**
   *  Validate form
   * @returns  true/false
   */
  const validate = () => {
    /** Khởi tạo mảng errors */
    const ERRORS: Record<string, string> = {}
    /**
     * Kiểm tra form
     */
    FORM_BEFORE_CHAT?.data?.forEach((field) => {
      /** Giá trị field */
      const VALUE = form_values[field.field] || ''
      /** Kiểm tra giá trị */
      if (field.is_active && field.is_require && !VALUE) {
        ERRORS[field.field] = t('input_data')
      }

      /** Nếu field là phone thì kiểm tra thêm định dạng */
      if (field.field === 'phone' && VALUE) {
        /**
         *  Kiểm tra dữ liệu SDT với regex
         */
        if (!VN_PHONE_REGEX.test(VALUE) && !UK_PHONE_REGEX.test(VALUE)) {
          ERRORS[field.field] = t('invalid_format_phone')
        }
      }
    })
    /** Cập nhật form vào state */
    setFormErrors(ERRORS)
    /** Return true/false */
    return Object.keys(ERRORS).length === 0
  }

  /**
   *  Render input type
   * @param field
   * @returns
   */
  const renderInputType = (field: string) => {
    if (field === 'EMAIL' || field === 'email') return 'email'
    if (field === 'PHONE' || field === 'phone') return 'tel'
    return 'text'
  }
  /**
   * Kiểm tra button disabled
   */
  const IS_DISABLED =
    FORM_BEFORE_CHAT?.data?.some((field) => {
      return (
        field.is_active && field.is_require && !form_values[field.field]?.trim()
      )
    }) ?? true
  return (
    <div className="flex flex-col gap-4 w-full h-full justify-center items-center">
      {LOADING_GLOBAL ? (
        <div className={`flex w-full justify-center items-center h-60`}>
          <Loading />
        </div>
      ) : (
        <div className="flex flex-col w-full gap-4 h-full justify-center items-center">
          <div className="flex flex-col gap-4 bg-white w-full py-4 justify-center items-center px-4 rounded-md">
            {FORM_BEFORE_CHAT?.data?.map((field, idx) => {
              if (!field.is_active) return null

              return (
                <div
                  className="w-full"
                  key={idx}
                >
                  <Input
                    title={field.title}
                    placeholder={field.placeholder}
                    required={field.is_require}
                    value_input={form_values[field.field] || ''}
                    type={renderInputType(field.field)}
                    onChange={(e: any) =>
                      handleChange(field.field, e.target.value)
                    }
                  />
                  {form_errors[field.field] && (
                    <span className="text-xs text-red-600">
                      {form_errors[field.field]}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <button
            className={`text-white sticky bottom-0 ${
              IS_DISABLED ? 'bg-slate-400 cursor-not-allowed' : 'bg-black'
            } rounded-md px-4 py-2 text-sm font-medium`}
            onClick={() => {
              if (validate()) {
                if (isEmpty(USER_INFO)) {
                  onInitClient({
                    user_name: t('anonymous'),
                  })
                  return
                }
                onInitClient(form_values)
              }
            }}
            disabled={IS_DISABLED} // hoặc tự check thiếu form ở đây
          >
            {t('start_to_chat')}
          </button>
        </div>
      )}
    </div>
  )
}

export default InitClient
