import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { RoutePaths } from '@/app/router/route-paths';
import { PageShell } from '@/presentation/components/common/page-shell';
import { StudentForm } from '@/presentation/components/students/student-form';
import { useCreateStudent, useUpdateStudent } from '@/presentation/hooks/students/use-student-mutations';
import { useStudent } from '@/presentation/hooks/students/use-students';
import { Loading } from '@/shared/ui/feedback/loading';
import type { CreateStudentFormValues } from '@/application/students/forms/student.form';

/**
 * Trang tạo hoặc chỉnh sửa học viên
 * Tự động chuyển mode dựa trên param `:id`
 */
export default function StudentFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Gọi hooks phù hợp
  const { data: student, isLoading: isFetchingStudent } = useStudent(id);
  const { mutate: createStudent, isPending: isCreating } = useCreateStudent();
  const { mutate: updateStudent, isPending: isUpdating } = useUpdateStudent(id);

  // Submit action
  const handleSubmit = (data: CreateStudentFormValues) => {
    if (isEditMode && id) {
      updateStudent(data, {
        onSuccess: () => navigate(RoutePaths.STUDENT_DETAIL.replace(':id', id)),
      });
    } else {
      createStudent(data, {
        onSuccess: () => {
          // Thành công thì chuyển về trang danh sách (hoặc detail của học viên mới nếu API trả về ID)
          navigate(RoutePaths.STUDENTS); 
        },
      });
    }
  };

  // Nếu đang fetch để edit thì show loading
  if (isEditMode && isFetchingStudent) {
    return (
      <PageShell title="Cập nhật học viên">
        <Loading text="Đang tải dữ liệu học viên..." />
      </PageShell>
    );
  }

  const initialValues = isEditMode && student ? {
    fullName: student.fullName,
    dob: student.dob ? student.dob.substring(0, 10) : '',
    gender: student.gender || '',
    phone: student.phone || '',
    email: student.email || '',
    guardianName: student.guardianName || '',
    guardianPhone: student.guardianPhone || '',
    address: student.address || '',
  } : undefined;

  return (
    <PageShell
      title={isEditMode ? 'Cập nhật học viên' : 'Thêm học viên mới'}
      description={isEditMode ? 'Chỉnh sửa thông tin hồ sơ của học viên.' : 'Tạo hồ sơ cho học viên mới gia nhập.'}
      actions={
        <button
          onClick={() => navigate(isEditMode ? RoutePaths.STUDENT_DETAIL.replace(':id', id as string) : RoutePaths.STUDENTS)}
          className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2 shadow-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Hủy / Trở về</span>
        </button>
      }
    >
      <div className="max-w-4xl mx-auto py-2">
        <StudentForm
          mode={isEditMode ? 'edit' : 'create'}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          loading={isCreating || isUpdating}
        />
      </div>
    </PageShell>
  );
}
