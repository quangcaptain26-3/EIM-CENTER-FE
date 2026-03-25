import { User, Phone, Mail, MapPin, Calendar, Users } from 'lucide-react';
import type { StudentModel } from '@/domain/students/models/student.model';
import { formatDate } from '@/shared/lib/date';

export interface StudentProfileCardProps {
  student: StudentModel;
}

/**
 * Component hiển thị thông tin chung của Học viên
 */
export const StudentProfileCard = ({ student }: StudentProfileCardProps) => {
  return (
    <div className="student-profile-card">
      {/* Header Profile */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
          {student.fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{student.fullName}</h2>
          {student.phone && (
            <div className="text-sm text-gray-500 mt-1">{student.phone}</div>
          )}
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
        {/* Info Column 1 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 text-gray-600">
            <Phone className="w-4 h-4 mt-0.5 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Số điện thoại</span>
              <span className="text-gray-900 font-medium">{student.phone || '—'}</span>
            </div>
          </div>
          
          <div className="flex items-start gap-3 text-gray-600">
            <Mail className="w-4 h-4 mt-0.5 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email</span>
              <span className="text-gray-900 font-medium">{student.email || '—'}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-gray-600">
            <Calendar className="w-4 h-4 mt-0.5 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Ngày sinh</span>
              <span className="text-gray-900 font-medium">{formatDate(student.dob)}</span>
            </div>
          </div>
        </div>

        {/* Info Column 2 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 text-gray-600">
            <User className="w-4 h-4 mt-0.5 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Giới tính</span>
              <span className="text-gray-900 font-medium">
                {student.gender === 'MALE' ? 'Nam' : student.gender === 'FEMALE' ? 'Nữ' : student.gender || '—'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-gray-600">
            <Users className="w-4 h-4 mt-0.5 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Người giám hộ</span>
              <span className="text-gray-900 font-medium">
                {student.guardianName || '—'}
                {student.guardianPhone && ` - ${student.guardianPhone}`}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Địa chỉ cư trú</span>
              <span className="text-gray-900 font-medium">{student.address || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
