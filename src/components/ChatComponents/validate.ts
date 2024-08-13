import { ConversationInfo, MessageInfo } from '../../utils/type'

const keys = require('lodash')
const size = require('lodash')
const intersection = require('lodash')
const difference = require('lodash')
export default function validateConversation(
  conversation?: ConversationInfo,
  message?: MessageInfo
) {
  const conversationStore = [] as any
  // nêu không có dữ liệu hội thoại thì chặn
  if (!conversation || !size(conversation)) return

  // đang lọc inbox thì không cho post qua
  if (
    conversationStore.option_filter_page_data.display_style === 'INBOX' &&
    message?.platform_type === 'FB_POST'
  )
    return

  // đang lọc post thì không cho inbox qua
  if (
    conversationStore.option_filter_page_data.display_style === 'COMMENT' &&
    message?.platform_type === 'FB_MESS'
  )
    return

  // lọc theo search: tên, sdt, email
  if (
    conversationStore.option_filter_page_data.search &&
    (!conversation.client_name ||
      !new RegExp(conversationStore.option_filter_page_data.search, 'i').test(
        conversation.client_name
      )) &&
    (!conversation.client_phone ||
      !new RegExp(conversationStore.option_filter_page_data.search, 'i').test(
        conversation.client_phone
      )) &&
    (!conversation.client_email ||
      !new RegExp(conversationStore.option_filter_page_data.search, 'i').test(
        conversation.client_email
      ))
  )
    return

  // lọc có sdt
  if (
    conversationStore.option_filter_page_data.have_phone === 'YES' &&
    !conversation.client_phone
  )
    return

  // lọc không có sdt
  if (
    conversationStore.option_filter_page_data.have_phone === 'NO' &&
    conversation.client_phone
  )
    return

  // lọc theo thời gian
  if (
    !conversation.last_message_time ||
    (conversationStore.option_filter_page_data.time_range?.lte &&
      conversationStore.option_filter_page_data.time_range?.lte <
        new Date(conversation.last_message_time).getTime()) ||
    (conversationStore.option_filter_page_data.time_range?.gte &&
      conversationStore.option_filter_page_data.time_range?.gte >
        new Date(conversation.last_message_time).getTime())
  )
    return

  // lọc theo nhân viên
  if (
    conversationStore.option_filter_page_data.staff_id &&
    (!conversation.fb_staff_id ||
      !conversationStore.option_filter_page_data.staff_id.includes(
        conversation.fb_staff_id
      ))
  )
    return

  // lọc nhãn hoặc
  if (
    conversationStore.option_filter_page_data.label_id &&
    !conversationStore.option_filter_page_data.label_and &&
    !intersection(
      conversationStore.option_filter_page_data.label_id,
      conversation.label_id
    ).length
  )
    return

  // lọc nhãn và
  if (
    conversationStore.option_filter_page_data.label_id &&
    conversationStore.option_filter_page_data.label_and &&
    (!conversation.label_id ||
      !conversation.label_id.length ||
      difference(
        conversationStore.option_filter_page_data.label_id,
        conversation.label_id
      ).length)
  )
    return

  // lọc loại trừ nhãn
  if (
    conversationStore.option_filter_page_data.not_label_id &&
    intersection(
      conversationStore.option_filter_page_data.not_label_id,
      conversation.label_id
    ).length
  )
    return

  // lọc khách spam
  if (
    conversationStore.option_filter_page_data.is_spam_fb === 'YES' &&
    !conversation.is_spam_fb
  )
    return

  // lọc hội thoại chưa gắn nhãn
  if (
    conversationStore.option_filter_page_data.not_exist_label &&
    size(conversation.label_id)
  )
    return

  return true
}
