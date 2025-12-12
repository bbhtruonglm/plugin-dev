import { useDispatch, useSelector } from 'react-redux'

import ChatHeader from '../Header/ChatHeader'
import { ChatScreenProps } from '../type'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { ReactComponent as Close } from '@/assets/close.svg'
import InitClient from '../Body/InitClient'
import InputChat from '../Body/InputChat/InputChat'
import InputChatNoUI from '../Body/InputChat/InputChatNoUI'
import Loading from '../../Loading/Loading'
import LoadingDots from '../../Loading/LoadingDot'
import LoadingJumping from '../../Loading/LoadingJumping'
import MessageBody from '../Body/MessageBody'
import MessageComponent from '../MessageComponent/MessageComponent'
import VConsole from 'vconsole'
import { isEmpty } from 'lodash'
import { selectCustomColor } from '@/stores/appSlice'
import { t } from 'i18next'
import useDetailChat from './useDetailChat'
import { useRef } from 'react'

declare global {
  interface Window {
    VConsole?: any
  }
}

/** Chi tiết component chat */
function DetailChat({
  onCancel,
  user_id,
  onInitClient,
  loading_init,
  setLoadingInit,
  invalid_page_id,
  error_message,
  setHideForMobile,
  page_name,
  staff_name,
  loading_staff,
  client_name,
  employee_list,
  is_init,
  setIsInit,
}: ChatScreenProps) {
  const {
    AI_STATUS,
    client_id: CLIENT_ID,
    loading_more,
    MESSAGE_CONTAINER_REF,
    PAGE_ID,
    IS_ACTIVE_AGENT_AI,
    is_loaded,
    NO_AI_ID,
    LIST_MESSAGE,
    LATEST_MESSAGE,
    checkStaffExist,
    checkStaffExistAgent,
    LOADING_GLOBAL,
    check_no_message_ai,
    CLIENT_INFO,
    TYPING_STATUS,
    STATUSES,
    MESSAGE_END_REF,
    loading,
    show_jump_button,
    scrollToBottom,
    error_upload,
    setErrorUpload,
    status_index,
    sendMessage,
    setLoading,
    loading_first_time,
    LIST_CTA,
    status_list,
    list_cta_message,
    LIST_CTA_MESSAGE,
    socket_quick_chat,
    setSocketQuickChat,
    handleSendMessage,
    sendImageMessage,
  } = useDetailChat({
    user_id,
    onInitClient,
    is_init,
    setIsInit,
  })

  /** Hàm dispatch */
  const dispatch = useDispatch()

  /** CUSTOM color */
  const CUSTOM_COLOR = useSelector(selectCustomColor)

  /** Lấy màu nền từ custom color hoặc fallback về màu mặc định */
  const BACKGROUND_COLOR = CUSTOM_COLOR?.primary_color || '#1e293b'

  const MESSAGE_DATA = {
    _id: '68b81964027a199574cc430f',
    fb_client_id: '75f2e3db9ae34b86abeb0aa30dcb7192',
    fb_page_id: '410276362999926',
    message_mid: 'b1d6ea9d772046f5a6df183c718b5c0b',
    __v: 0,
    ai: [{}],
    createdAt: '2025-09-03T10:33:08.138Z',
    llm_sources: [],
    message_attachments: {
      type: 'template',
      payload: {
        template_type: 'coupon',
        title: '10% off everything',
        subtitle: '10% off. Limit 1 per customer. Expires on October 1st, 2022',
        coupon_code: '10PERCENT',
        coupon_url: 'https://www.myshop.com/',
        coupon_url_button_title: 'Shop now',
        coupon_pre_message: "Here's a deal just for you!",
        image_url: 'https://www.myshop.com/sale-image.png',
        payload: 'The coupon for 10% off everything that expires 2022-10-1',
      },
      // type: 'template',
      // payload: {
      //   template_type: 'generic',
      //   elements: [
      //     {
      //       title: 'Welcome!',
      //       image_url:
      //         'https://raw.githubusercontent.com/fbsamples/original-coast-clothing/main/public/styles/male-work.jpg',
      //       subtitle: 'We have the right hat for everyone.',
      //       default_action: {
      //         type: 'web_url',
      //         url: 'https://www.originalcoastclothing.com/',
      //         webview_height_ratio: 'tall',
      //       },
      //       buttons: [
      //         {
      //           type: 'web_url',
      //           url: 'https://www.originalcoastclothing.com/',
      //           title: 'View Website',
      //         },
      //         {
      //           type: 'postback',
      //           title: 'Start Chatting',
      //           payload: 'DEVELOPER_DEFINED_PAYLOAD',
      //         },
      //       ],
      //     },
      //   ],
      // },

      // type: 'template',
      // payload: {
      //   template_type: 'media',
      //   elements: [
      //     // {
      //     //   media_type: 'video',
      //     //   url: '<FACEBOOK_URL>',
      //     // },
      //     // {
      //     //   media_type: 'image',
      //     //   url: 'https://static.botbanhang.vn/chatbox/388339911461476/avatar.png',
      //     //   buttons: [
      //     //     {
      //     //       type: 'web_url',
      //     //       url: '<WEB_URL>',
      //     //       title: 'View Website',
      //     //     },
      //     //   ],
      //     // },
      //     {
      //       media_type: 'video',
      //       url: 'https://chatbox-assets.botbanhang.vn/app/e29ddaf986c14f2fad0fe0ca9d6b6740__file_example_MP4_480_1_5MG.mp4.mp4',
      //       buttons: [
      //         {
      //           type: 'web_url',
      //           url: '<WEB_URL>',
      //           title: 'View Website',
      //         },
      //       ],
      //     },
      //   ],
      // },
    },

    message_metadata: '__user_normal__75f2e3db9ae34b86abeb0aa30dcb7192',
    // message_text: '10% off everything',
    message_type: 'page',
    platform_type: 'WEBSITE',
    recipient_id: '410276362999926',
    sender_id: '75f2e3db9ae34b86abeb0aa30dcb7192',
    time: '2025-09-03T10:33:07.920Z',
    updatedAt: '2025-09-03T10:33:08.610Z',
  }
  const MESSAGE_DATA2 = {
    _id: '68b81964027a199574cc430f',
    fb_client_id: '75f2e3db9ae34b86abeb0aa30dcb7192',
    fb_page_id: '410276362999926',
    message_mid: 'b1d6ea9d772046f5a6df183c718b5c0b',
    __v: 0,
    ai: [{}],
    createdAt: '2025-09-03T10:33:08.138Z',
    llm_sources: [],
    message_attachments: {
      // type: 'template',
      // payload: {
      //   template_type: 'coupon',
      //   title: '10% off everything',
      //   subtitle: '10% off. Limit 1 per customer. Expires on October 1st, 2022',
      //   coupon_code: '10PERCENT',
      //   coupon_url: 'https://www.myshop.com/',
      //   coupon_url_button_title: 'Shop now',
      //   coupon_pre_message: "Here's a deal just for you!",
      //   image_url: 'https://www.myshop.com/sale-image.png',
      //   payload: 'The coupon for 10% off everything that expires 2022-10-1',
      // },
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [
          {
            title: 'Welcome!',
            image_url:
              'https://raw.githubusercontent.com/fbsamples/original-coast-clothing/main/public/styles/male-work.jpg',
            subtitle: 'We have the right hat for everyone.',
            default_action: {
              type: 'web_url',
              url: 'https://www.originalcoastclothing.com/',
              webview_height_ratio: 'tall',
            },
            buttons: [
              {
                type: 'web_url',
                url: 'https://www.originalcoastclothing.com/',
                title: 'View Website',
              },
              {
                type: 'postback',
                title: 'Start Chatting',
                payload: 'DEVELOPER_DEFINED_PAYLOAD',
              },
            ],
          },
        ],
      },

      // type: 'template',
      // payload: {
      //   template_type: 'media',
      //   elements: [
      //     // {
      //     //   media_type: 'video',
      //     //   url: '<FACEBOOK_URL>',
      //     // },
      //     // {
      //     //   media_type: 'image',
      //     //   url: 'https://static.botbanhang.vn/chatbox/388339911461476/avatar.png',
      //     //   buttons: [
      //     //     {
      //     //       type: 'web_url',
      //     //       url: '<WEB_URL>',
      //     //       title: 'View Website',
      //     //     },
      //     //   ],
      //     // },
      //     {
      //       media_type: 'video',
      //       url: 'https://chatbox-assets.botbanhang.vn/app/e29ddaf986c14f2fad0fe0ca9d6b6740__file_example_MP4_480_1_5MG.mp4.mp4',
      //       buttons: [
      //         {
      //           type: 'web_url',
      //           url: '<WEB_URL>',
      //           title: 'View Website',
      //         },
      //       ],
      //     },
      //   ],
      // },
    },

    message_metadata: '__user_normal__75f2e3db9ae34b86abeb0aa30dcb7192',
    // message_text: '10% off everything',
    message_type: 'page',
    platform_type: 'WEBSITE',
    recipient_id: '410276362999926',
    sender_id: '75f2e3db9ae34b86abeb0aa30dcb7192',
    time: '2025-09-03T10:33:07.920Z',
    updatedAt: '2025-09-03T10:33:08.610Z',
  }
  const MESSAGE_DATA3 = {
    _id: '68b81964027a199574cc430f',
    fb_client_id: '75f2e3db9ae34b86abeb0aa30dcb7192',
    fb_page_id: '410276362999926',
    message_mid: 'b1d6ea9d772046f5a6df183c718b5c0b',
    __v: 0,
    ai: [{}],
    createdAt: '2025-09-03T10:33:08.138Z',
    llm_sources: [],
    message_attachments: {
      // type: 'template',
      // payload: {
      //   template_type: 'coupon',
      //   title: '10% off everything',
      //   subtitle: '10% off. Limit 1 per customer. Expires on October 1st, 2022',
      //   coupon_code: '10PERCENT',
      //   coupon_url: 'https://www.myshop.com/',
      //   coupon_url_button_title: 'Shop now',
      //   coupon_pre_message: "Here's a deal just for you!",
      //   image_url: 'https://www.myshop.com/sale-image.png',
      //   payload: 'The coupon for 10% off everything that expires 2022-10-1',
      // },
      // type: 'template',
      // payload: {
      //   template_type: 'generic',
      //   elements: [
      //     {
      //       title: 'Welcome!',
      //       image_url:
      //         'https://raw.githubusercontent.com/fbsamples/original-coast-clothing/main/public/styles/male-work.jpg',
      //       subtitle: 'We have the right hat for everyone.',
      //       default_action: {
      //         type: 'web_url',
      //         url: 'https://www.originalcoastclothing.com/',
      //         webview_height_ratio: 'tall',
      //       },
      //       buttons: [
      //         {
      //           type: 'web_url',
      //           url: 'https://www.originalcoastclothing.com/',
      //           title: 'View Website',
      //         },
      //         {
      //           type: 'postback',
      //           title: 'Start Chatting',
      //           payload: 'DEVELOPER_DEFINED_PAYLOAD',
      //         },
      //       ],
      //     },
      //   ],
      // },

      type: 'template',
      payload: {
        template_type: 'media',
        elements: [
          // {
          //   media_type: 'video',
          //   url: '<FACEBOOK_URL>',
          // },
          // {
          //   media_type: 'image',
          //   url: 'https://static.botbanhang.vn/chatbox/388339911461476/avatar.png',
          //   buttons: [
          //     {
          //       type: 'web_url',
          //       url: '<WEB_URL>',
          //       title: 'View Website',
          //     },
          //   ],
          // },
          {
            media_type: 'video',
            url: 'https://chatbox-assets.botbanhang.vn/app/e29ddaf986c14f2fad0fe0ca9d6b6740__file_example_MP4_480_1_5MG.mp4.mp4',
            buttons: [
              {
                type: 'web_url',
                url: '<WEB_URL>',
                title: 'View Website',
              },
            ],
          },
        ],
      },
    },

    message_metadata: '__user_normal__75f2e3db9ae34b86abeb0aa30dcb7192',
    // message_text: '10% off everything',
    message_type: 'page',
    platform_type: 'WEBSITE',
    recipient_id: '410276362999926',
    sender_id: '75f2e3db9ae34b86abeb0aa30dcb7192',
    time: '2025-09-03T10:33:07.920Z',
    updatedAt: '2025-09-03T10:33:08.610Z',
  }
  /** Template type feedback */
  const MESSAGE_DATA4 = {
    _id: '68b81964027a199574cc430f',
    fb_client_id: '75f2e3db9ae34b86abeb0aa30dcb7192',
    fb_page_id: '410276362999926',
    message_mid: 'b1d6ea9d772046f5a6df183c718b5c0b',
    __v: 0,
    ai: [{}],
    createdAt: '2025-09-03T10:33:08.138Z',
    llm_sources: [],
    message_attachments: {
      type: 'template',
      payload: {
        template_type: 'customer_feedback',
        title: 'Rate your experience with Original Coast Clothing.',
        subtitle:
          'Let Original Coast Clothing know how they are doing by answering two questions',
        button_title: 'Rate Experience',
        feedback_screens: [
          {
            questions: [
              {
                id: 'hauydmns8',
                type: 'csat',
                title:
                  'How would you rate your experience with Original Coast Clothing?',
                score_label: 'neg_pos',
                score_option: 'five_stars',
                follow_up: {
                  type: 'free_form',
                  placeholder: 'Give additional feedback',
                },
              },
            ],
          },
        ],
        business_privacy: {
          url: 'https://www.example.com',
        },
        expires_in_days: 3,
      },
    },

    message_metadata: '__user_normal__75f2e3db9ae34b86abeb0aa30dcb7192',
    // message_text: '10% off everything',
    message_type: 'page',
    platform_type: 'WEBSITE',
    recipient_id: '410276362999926',
    sender_id: '75f2e3db9ae34b86abeb0aa30dcb7192',
    time: '2025-09-03T10:33:07.920Z',
    updatedAt: '2025-09-03T10:33:08.610Z',
  }
  /** Template type feedback */
  const MESSAGE_DATA5 = {
    _id: '68b81964027a199574cc430f',
    fb_client_id: '75f2e3db9ae34b86abeb0aa30dcb7192',
    fb_page_id: '410276362999926',
    message_mid: 'b1d6ea9d772046f5a6df183c718b5c0b',
    __v: 0,
    ai: [{}],
    createdAt: '2025-09-03T10:33:08.138Z',
    llm_sources: [],
    message_attachments: {
      type: 'template',
      payload: {
        template_type: 'receipt',
        recipient_name: 'Stephane Crozatier',
        order_number: '12345678902',
        currency: 'USD',
        payment_method: 'Visa 2345',
        order_url: 'http://petersapparel.parseapp.com/order?order_id=123456',
        timestamp: '1428444852',
        address: {
          street_1: '1 Hacker Way',
          street_2: '',
          city: 'Menlo Park',
          postal_code: '94025',
          state: 'CA',
          country: 'US',
        },
        summary: {
          subtotal: 75.0,
          shipping_cost: 4.95,
          total_tax: 6.19,
          total_cost: 56.14,
        },
        adjustments: [
          {
            name: 'New Customer Discount',
            amount: 20,
          },
          {
            name: '$10 Off Coupon',
            amount: 10,
          },
        ],
        elements: [
          {
            title: 'Classic White T-Shirt',
            subtitle: '100% Soft and Luxurious Cotton',
            quantity: 2,
            price: 50,
            currency: 'USD',
            image_url:
              'https://classicfella.com/cdn/shop/files/TShirt_White_Trans_0.5x_8537c1fa-10c5-4246-b7fb-55ff5b3a9eb1.png?v=1690384635&width=1600',
          },
          {
            title: 'Classic Gray T-Shirt',
            subtitle: '100% Soft and Luxurious Cotton',
            quantity: 1,
            price: 25,
            currency: 'USD',
            image_url:
              'https://www.trueclassictees.com/cdn/shop/products/4000_HEATHERGREY_1_GRAY.jpg?v=1751940310&width=1420',
          },
        ],
      },
    },

    message_metadata: '__user_normal__75f2e3db9ae34b86abeb0aa30dcb7192',
    // message_text: '10% off everything',
    message_type: 'page',
    platform_type: 'WEBSITE',
    recipient_id: '410276362999926',
    sender_id: '75f2e3db9ae34b86abeb0aa30dcb7192',
    time: '2025-09-03T10:33:07.920Z',
    updatedAt: '2025-09-03T10:33:08.610Z',
  }

  const holdTimer = useRef<NodeJS.Timeout | null>(null)
  const holdStart = useRef<number | null>(null)

  /** Kích hoạt vConsole */
  const activateVConsole = () => {
    if (window.VConsole) {
      console.log('🧩 vConsole already loaded')
      return
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/vconsole/dist/vconsole.min.js'
    script.onload = () => {
      new window.VConsole()
      console.log('✅ vConsole enabled (via long press)')
    }
    document.body.appendChild(script)
  }

  /** Xử lý giữ chuột/touch 3s */
  const handleMouseDown = () => {
    holdStart.current = Date.now()
    holdTimer.current = setTimeout(() => {
      activateVConsole()
    }, 3000)
  }

  const handleMouseUp = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
  }

  const handleMouseLeave = handleMouseUp
  const handleTouchStart = handleMouseDown
  const handleTouchEnd = handleMouseUp

  return (
    <div
      // className={`flex flex-col w-full h-full ${
      //   AI_STATUS && 'bg-ai-bg'
      // }  relative `}
      // onMouseDown={handleMouseDown}
      // onMouseUp={handleMouseUp}
      // onMouseLeave={handleMouseLeave}
      // onTouchStart={handleTouchStart}
      // onTouchEnd={handleTouchEnd}
      className={`flex flex-col w-full h-full ${
        AI_STATUS && 'bg-ai-bg'
      } relative`}
    >
      {/* <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className="flex flex-col w-full h-full bg-slate-100 relative"
      >
        <div className="m-auto text-center p-8">
          <h3>🧩 Hold chuột 3s để bật vConsole</h3>
          <p className="text-gray-500 text-sm">
            (Giữ nguyên trong vùng này, đừng di chuột ra ngoài)
          </p>
        </div>
      </div> */}
      {/* header */}
      <div className={`${AI_STATUS ? 'hidden' : ''}`}>
        <ChatHeader
          onCancel={() => onCancel()}
          user_id={CLIENT_ID}
          setHideForMobile={setHideForMobile}
          page_name={page_name}
          staff_name={staff_name}
          loading_staff={loading_staff}
          employee_list={employee_list}
          loading_chat_data={loading_more}
        />
      </div>
      {/* body */}
      <div
        ref={MESSAGE_CONTAINER_REF}
        className={`px-5 py-3 gap-4 overflow-y-auto scrollbar-thin scrollbar-webkit flex flex-col relative ${
          AI_STATUS ? 'mt-0 mb-16' : user_id ? 'my-16' : 'mt-44'
        } `}
      >
        {user_id && loading_more && (
          <div className="fixed bg-white-300 top-[12%] left-[48%] p-2 rounded-full text-xs z-50">
            <Loading />
          </div>
        )}
        {/* Không có page Id sẽ báo lỗi k kết nối với hệ thống */}
        {!user_id && error_message && !loading_more && (
          <h4 className="flex justify-center font-semibold text-red-600 whitespace-pre-line">
            {error_message}
          </h4>
        )}
        {/* Không có page Id sẽ báo lỗi */}
        {/* {!user_id && !error_message && Khi bấm vào chat lần đầu */}
        {!AI_STATUS && !user_id && !error_message && (
          <div className="flex flex-col gap-2 ">
            <InitClient
              resetData={invalid_page_id}
              onInitClient={(e: any) => {
                setLoadingInit(true)
                onInitClient({ ...e, page_id: PAGE_ID })
              }}
            />
            {invalid_page_id && (
              <h4 className="flex justify-center font-semibold text-red-600">
                {t('invalid_page_id')}
              </h4>
            )}
          </div>
        )}

        {AI_STATUS &&
          invalid_page_id === true &&
          is_loaded &&
          IS_ACTIVE_AGENT_AI === true && (
            <h4 className="flex justify-center font-semibold text-red-600">
              {t('invalid_virtual_assistant')}
            </h4>
          )}
        {AI_STATUS && NO_AI_ID && (
          <h4 className="flex justify-center font-semibold text-red-600">
            {t('no_virtual_assistant')}
          </h4>
        )}
        {AI_STATUS && is_loaded && IS_ACTIVE_AGENT_AI === false && (
          <h4 className="flex justify-center font-semibold text-red-600">
            {t('inactive_virtual_assistant')}
          </h4>
        )}
        {/* Hiển thị Phần chào mừng với AI */}
        {AI_STATUS &&
          LIST_MESSAGE.length == 0 &&
          user_id &&
          !LOADING_GLOBAL &&
          check_no_message_ai && (
            <div className="flex flex-col items-center gap-2.5">
              <img
                src="./images/assistant_bot.svg"
                alt=""
              />
              <div className="flex flex-col items-center gap-1">
                <h4 className="text-sm font-medium flex">
                  {CLIENT_INFO?.current_staff_name
                    ? t('_hi') + CLIENT_INFO?.current_staff_name
                    : t('_hi_')}
                  , {t('_im_your_virtual_assistant')}
                </h4>
                <div>
                  <h4 className="text-xs text-slate-500 text-center">
                    {t('_how_can_i_help_you')}
                  </h4>
                  <h4 className="text-xs text-slate-500 text-center">
                    {t('asking_anything')}
                  </h4>
                </div>
              </div>
            </div>
          )}
        {/* render nội dung tin nhắn từ list có sẵn */}
        {user_id &&
          !LOADING_GLOBAL &&
          LIST_MESSAGE &&
          LIST_MESSAGE.map((item: any, index: number) => (
            <div
              className="flex flex-col"
              key={index}
            >
              <MessageBody
                item={item}
                checkStaffExist={checkStaffExist}
                client_name={client_name}
                checkAgentExist={checkStaffExistAgent}
              />
            </div>
          ))}

        <div>
          {/* Phần nội dung tin nhắn được hiển thị */}
          {/* <MessageComponent data={MESSAGE_DATA} />
          <MessageComponent data={MESSAGE_DATA2} /> */}
          {/* <MessageComponent data={MESSAGE_DATA4} />
          <MessageComponent data={MESSAGE_DATA5} /> */}
        </div>
        {!AI_STATUS && (
          <div className="flex flex-wrap gap-2 w-full">
            {socket_quick_chat.map((item: any, index: number) => (
              <div
                key={index}
                onClick={() => {
                  /** Flow id */
                  const FLOW_ID = item?.payload?.split('_')[1]

                  /** Hàm gửi tin nhắn */
                  handleSendMessage(item?.title, {
                    message_mid:
                      LIST_MESSAGE[LIST_MESSAGE.length - 1]?.message_mid,
                    button_index: index,
                    flow_id: FLOW_ID,
                  })
                }}
                className="font-medium border-slate-700 bg-white border hover:border-blue-500 hover:bg-blue-500 hover:text-white shadow-lg outline outline-1 outline-slate-200 rounded-lg w-fit max-w-[60%] px-2 p-1 text-sm cursor-pointer truncate "
              >
                {item.title}
              </div>
            ))}
          </div>
        )}
        <div>
          {TYPING_STATUS && (
            <div
              className={`text-lg font-semibold flex items-center ${
                isEmpty(status_list) ? '' : 'gap-x-2'
              }
                  py-2 px-4 rounded-full bg-slate-300 w-fit`}
            >
              {/* <span className="text-xs text-slate-700">
                {status_list[status_index]}
              </span> */}

              <div className="flex  ">
                {/* <LoadingDots /> */}
                <LoadingJumping />
              </div>
            </div>
          )}
        </div>

        {/* Thẻ div này đóng vai trò là nơi đánh dấu để cuộn tới
         * khi có tin nhắn mới thì sẽ cuộn xuống dưới cùng
         */}

        <div ref={MESSAGE_END_REF} />

        {/* Khi khởi tạo sẽ hiển thị loading này */}
        {loading_init && (
          <div className="fixed bg-red-300 bottom-[22%] left-[48%] p-2 rounded-full text-xs z-50">
            <LoadingDots />
          </div>
        )}
      </div>
      {/* Hiển thị nút nhảy về cuối trang */}
      {show_jump_button && user_id && (
        <button
          onClick={scrollToBottom}
          className={`absolute flex justify-center items-center h-7 w-7 shadow-md bg-white rounded-full z-[40] ${
            AI_STATUS ? 'bottom-[16%]' : 'bottom-[13%]'
          } right-[45%]`}
        >
          <ChevronDownIcon className="size-4" />
        </button>
      )}
      {/** Khi upload lỗi, thông báo cho user */}
      {error_upload && (
        <div className="absolute bottom-[20%] left-[35%] bg-white shadow-lg rounded-lg p-2 w-full max-w-40 h-fit max-h-40 group">
          <div
            className="flex justify-between cursor-pointer relative "
            onClick={() => {
              setErrorUpload('')
            }}
          >
            <Close className="absolute top-0 right-0 bg-slate-500 p-1 rounded-full opacity-0 group-hover:opacity-100" />
          </div>
          <h4 className="text-red-500 text-sm break-words whitespace-pre-line">
            {error_upload}
          </h4>
        </div>
      )}

      {user_id &&
        !AI_STATUS &&
        !LOADING_GLOBAL &&
        !loading_first_time &&
        LIST_MESSAGE &&
        LIST_MESSAGE.length < 2 &&
        LIST_CTA_MESSAGE?.is_active && (
          <div className="absolute bottom-[15%] left-[6%] flex flex-col gap-2 w-full">
            {list_cta_message.slice(0, 4).map((item: any, index: number) => (
              <div
                key={index}
                onClick={() => {
                  sendMessage(item)
                }}
                className="font-medium border-slate-700 bg-white border hover:border-blue-500 hover:bg-blue-500 hover:text-white shadow-lg outline outline-1 outline-slate-200 rounded-lg w-fit max-w-[60%] px-2 p-1 text-sm cursor-pointer truncate "
              >
                {item}
              </div>
            ))}
          </div>
        )}

      {/* ô input  Khi có text trong input thì hiển thị thêm icon send */}
      {user_id ? (
        <InputChat
          error_message={error_message}
          handleSend={(e: string) => {
            sendMessage(e)
          }}
          handleUpload={(file: File) => {
            sendImageMessage(file)
          }}
          loading={loading}
          page_name={page_name}
          client_id={user_id}
          setLoading={(e: boolean) => setLoading(e)}
          handleError={(e: any) => {
            setErrorUpload(e)
          }}
        />
      ) : (
        <InputChatNoUI />
      )}
    </div>
  )
}

export default DetailChat
