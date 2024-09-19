import { apiImage } from '@/api/api'
import { renderAvatar } from '@/utils'

interface StaffProps {
  data?: { fb_staff_id: string; is_online: boolean }[]
  size?: 'small' | 'medium'
}

function OnlineStaff({ data, size = 'small' }: StaffProps) {
  return (
    <div className="flex items-center">
      {data &&
        data.slice(0, 3).map((employee) => (
          <img
            key={employee.fb_staff_id}
            src={renderAvatar(employee.fb_staff_id)}
            alt="employee_avatar"
            className={` shadow border  ${
              employee.is_online ? '' : ' opacity-75 '
            } ${
              size === 'small'
                ? '-mr-2 h-8 w-8 rounded-lg'
                : '-mr-1 h-12 w-12 rounded-2xl'
            }`}
          />
        ))}
      {data && data.length > 3 && (
        <span className="ml-3 text-sm font-medium text-gray-100">
          +{data.length - 3}
        </span>
      )}
    </div>
  )
}

export default OnlineStaff
