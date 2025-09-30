import { renderAvatarCDN } from '@/utils'
import { selectShowSupportStaff } from '@/stores/appSlice'
import { useSelector } from 'react-redux'

interface StaffProps {
  /** Danh sách nhân viên */
  data?: { fb_staff_id: string; is_online: boolean; user_id: string }[]
  /** Kích thước hiển thị*/
  size?: 'small' | 'medium'
}
/** Thông tin staff */
interface Staff {
  /** Fb-id của staff */
  fb_staff_id: string
  /** Trạng thái online, offline */
  is_online: boolean
  /** User id */
  user_id: string
}
/** Active User */
interface ActiveUsers {
  [user_id: string]: boolean
}

function OnlineStaff({ data, size = 'small' }: StaffProps) {
  /** List Show Support Staff */
  const SHOW_SUPPORT_STAFF = useSelector(selectShowSupportStaff)

  /** Nếu không có data thì return null */
  if (!data) return null
  /** Hàm xử lý remove những nhân viên khóa
   * @param {Array} staffList - Danh sách nhân viên
   * @param {Object} activeUsers - Danh sách nhân viên tồn tại
   */
  function filterInactiveStaff(
    staffList: Staff[],
    activeUsers?: ActiveUsers
  ): Staff[] {
    if (!activeUsers) return []
    // Lọc những staff có user_id không tồn tại trong activeUsers hoặc có giá trị false
    // return staffList.filter((staff) => {
    //   return activeUsers[staff.user_id] !== false
    // })

    // Nếu muốn chặt chẽ hơn (chỉ giữ những user_id tồn tại và có giá trị true)
    return staffList.filter((staff) => activeUsers[staff.user_id] === true)
  }
  /** Danh sách staff
   *  @params {Array} data - Danh sách nhân viên
   * @params {Object} activeUsers - Danh sách nhân viên tồn tại
   */
  const FILTERED_STAFF = filterInactiveStaff(
    data,
    SHOW_SUPPORT_STAFF?.allow_staffs
  )

  return (
    <div className="flex items-center">
      {/* Check list nhân viên có ai online không, có 1 nhân viên thì hiện avatar như bt */}
      {FILTERED_STAFF && FILTERED_STAFF.length === 1 && (
        <img
          key={FILTERED_STAFF[0]?.user_id}
          src={renderAvatarCDN(FILTERED_STAFF[0]?.user_id)}
          alt="employee_avatar"
          className={` shadow border  ${
            FILTERED_STAFF[0]?.is_online ? '' : ' opacity-75 '
          } ${
            size === 'small'
              ? ' h-8 w-8 rounded-full'
              : ' h-12 w-12 rounded-full'
          }`}
        />
      )}
      {/* {FILTERED_STAFF &&
        FILTERED_STAFF.length > 1 &&
        FILTERED_STAFF.slice(0, 1).map((employee, index) => (
          <img
            key={employee.user_id + index}
            src={renderAvatarCDN(employee?.user_id)}
            alt="employee_avatar"
            className={` shadow border  ${
              employee.is_online ? '' : ' opacity-75 '
            } ${
              size === 'small'
                ? '-mr-2 h-8 w-8 rounded-full'
                : '-mr-1 h-12 w-12 rounded-full'
            }`}
          />
        ))} */}
      {/* {FILTERED_STAFF && FILTERED_STAFF.length > 3 && (
        <span
          className={`ml-3 ${
            size == 'small' ? 'text-sm' : ' '
          }   font-medium text-gray-100`}
        >
          +{FILTERED_STAFF.length - 3}
        </span>
      )} */}
    </div>
  )
}

export default OnlineStaff
