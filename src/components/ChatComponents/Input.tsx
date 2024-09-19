import React, { useState } from 'react'

import { useTranslation } from 'react-i18next'

interface InputProps {
  title?: string
  placeholder?: string
  onChange?: (e: any) => void
  onKeyDown?: (e: any) => void
  type?: 'text' | 'number' | 'email' | 'password'
  required?: boolean
}
const Input = ({
  title,
  placeholder,
  onChange,
  required,
  type = 'text',
}: InputProps) => {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  return (
    <div className="flex flex-col w-full gap-1">
      <h4 className="text-sm font-medium flex gap-x-0.5">
        {title}
        <span className={`${!required && 'hidden'} text-red-500`}>*</span>
      </h4>
      <input
        onChange={(e) => {
          onChange && onChange(e)
          setValue(e.target.value)
        }}
        value={value}
        onKeyDown={(e) => {}}
        type={type}
        placeholder={placeholder || t('placeholder')}
        className="bg-inputBg outline-none w-full flex-grow p-3 rounded-md placeholder:text-colorOpacity text-sm font-medium"
      />
    </div>
  )
}

export default Input
