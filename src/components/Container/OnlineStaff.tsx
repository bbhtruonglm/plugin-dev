import { apiImage } from '@/api/api'
import { renderAvatar } from '@/utils'

interface StaffProps {
  /** Danh sách nhân viên */
  data?: { fb_staff_id: string; is_online: boolean }[]
  /** Kích thước hiển thị*/
  size?: 'small' | 'medium'
}

function OnlineStaff({ data, size = 'small' }: StaffProps) {
  return (
    <div className="flex items-center">
      {/* Check list nhân viên có ai online không, có 1 nhân viên thì hiện avatar như bt */}
      {data && data.length === 1 && (
        <img
          key={data[0]?.fb_staff_id}
          src={renderAvatar(data[0]?.fb_staff_id)}
          alt="employee_avatar"
          className={` shadow border  ${
            data[0]?.is_online ? '' : ' opacity-75 '
          } ${
            size === 'small'
              ? ' h-8 w-8 rounded-full'
              : ' h-12 w-12 rounded-full'
          }`}
        />
      )}
      {data &&
        data.length > 1 &&
        data.slice(0, 3).map((employee, index) => (
          <img
            key={employee.fb_staff_id + index}
            src={renderAvatar(employee.fb_staff_id)}
            alt="employee_avatar"
            className={` shadow border  ${
              employee.is_online ? '' : ' opacity-75 '
            } ${
              size === 'small'
                ? '-mr-2 h-8 w-8 rounded-full'
                : '-mr-1 h-12 w-12 rounded-full'
            }`}
          />
        ))}
      {data && data.length > 3 && (
        <span
          className={`ml-3 ${
            size == 'small' ? 'text-sm' : ' '
          }   font-medium text-gray-100`}
        >
          +{data.length - 3}
        </span>
      )}
    </div>
  )
}

export default OnlineStaff
