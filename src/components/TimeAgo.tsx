import React, { useEffect, useState } from 'react'

import { t } from 'i18next'

/**
 * Component TimeAgo dùng để hiển thị thời gian tương đối
 */
interface TimeAgoProps {
  /** Dạng Unix timestamp hoặc ISO string */
  timestamp: string | number
}

const TimeAgo: React.FC<TimeAgoProps> = ({ timestamp }) => {
  /**
   * relative_time: Thời gian tương đối
   */
  const [relative_time, setRelativeTime] = useState(getRelativeTime(timestamp))

  /** Hàm tính thời gian tương đối
   * @param timestamp Dạng Unix timestamp hoặc ISO string
   */
  function getRelativeTime(timestamp: string | number): string {
    /**
     * NOW: Thời gian hiện tại
     */
    const NOW = new Date().getTime()
    /**
     * PAST: Thời gian cũ
     */
    const PAST = new Date(timestamp).getTime()
    /** Tính khoảng cách bằng giây */
    const DIFF = Math.floor((NOW - PAST) / 1000)

    /** Dưới 10 giây */
    if (DIFF < 10) return t('now')
    /**
     * Dưới 60 giây
     */
    if (DIFF < 60) return `${DIFF}s ${t('ago')}`
    /**
     * Dưới 3600 giây
     */
    if (DIFF < 3600) return `${Math.floor(DIFF / 60)}${t('m')} ${t('ago')}`
    /**
     * Dưới 86400 giây
     */
    if (DIFF < 86400) return `${Math.floor(DIFF / 3600)}h ${t('ago')}`
    /**
     * Trên 86400 giây
     */
    return `${Math.floor(DIFF / 86400)}d ${t('ago')}`
  }

  /** Cập nhật thời gian mỗi phút và khi timestamp thay đổi */
  useEffect(() => {
    /** Cập nhật ngay lập tức khi timestamp thay đổi */
    setRelativeTime(getRelativeTime(timestamp))

    /** Interval để cập nhật mỗi phút */
    const INTERVAL = setInterval(() => {
      setRelativeTime(getRelativeTime(timestamp))
    }, 20000)

    /** Dọn dẹp interval khi unmount */
    return () => clearInterval(INTERVAL)
    /** Lắng nghe thay đổi của timestamp */
  }, [timestamp])

  return <span>{relative_time}</span>
}

export default TimeAgo
