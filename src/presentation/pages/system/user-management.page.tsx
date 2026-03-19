/**
 * user-management.page.tsx
 * Trang quản lý tài khoản nhân viên và phân quyền (chỉ dành cho ROOT).
 */

import { useState } from 'react';
import { PageShell } from '@/presentation/components/common/page-shell';
import { useUsers } from '@/presentation/hooks/system/use-users';
import { useCreateUser, useUpdateUser, useAssignRole, useRevokeRole } from '@/presentation/hooks/system/use-user-mutations';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import { AppRoles, roleLabels } from '@/shared/constants/roles';
import { StatusBadge } from '@/presentation/components/common/status-badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Modal } from '@/shared/ui/modal';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';
import { AlertCircle, Plus, Search, UserCog, ShieldCheck, Power, PowerOff } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const LIMIT = 15;

export const UserManagementPage = () => {
  const { hasRole, initialized } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states
  const [newUser, setNewUser] = useState({ email: '', fullName: '', password: '', roleCode: AppRoles.TEACHER as string });

  // Guard: Chỉ Root mới có quyền truy cập trang này
  const isRoot = hasRole(AppRoles.ROOT);

  // Data
  const { data, isLoading } = useUsers({
    search,
    roleCode: roleFilter,
    limit: LIMIT,
    offset: (page - 1) * LIMIT
  });

  // Mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const assignRoleMutation = useAssignRole();
  const revokeRoleMutation = useRevokeRole();

  if (!initialized) return null;

  if (!isRoot) {
    return (
      <PageShell title="Truy cập bị hạn chế">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-rose-50 p-6 mb-6 text-rose-500">
            <AlertCircle className="h-16 w-16" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Quyền ROOT yêu cầu</h2>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            Bạn không có đủ thẩm quyền để quản trị tài khoản nhân viên. Vui lòng liên hệ quản trị viên hệ thống.
          </p>
        </div>
      </PageShell>
    );
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.fullName || !newUser.password) {
      toastAdapter.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    createUserMutation.mutate(newUser, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setNewUser({ email: '', fullName: '', password: '', roleCode: AppRoles.TEACHER });
      }
    });
  };

  const handleToggleStatus = (user: any) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateUserMutation.mutate({ 
      id: user.id, 
      dto: { status: newStatus as any } 
    });
  };

  const handleToggleRole = (user: any, roleCode: string) => {
    const hasRole = user.roles?.includes(roleCode);
    if (hasRole) {
      if (user.roles.length <= 1) {
        toastAdapter.warning('Người dùng phải có ít nhất một vai trò');
        return;
      }
      revokeRoleMutation.mutate({ userId: user.id, roleCode });
    } else {
      assignRoleMutation.mutate({ userId: user.id, roleCode });
    }
  };

  return (
    <PageShell 
      title="Quản lý nhân sự"
      description="Tạo mới tài khoản, phân quyền và quản lý trạng thái hoạt động của nhân viên."
      actions={
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tạo user mới
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Tên hoặc email..." 
                className="pl-10"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Chức vụ</label>
            <Select 
              options={[
                { label: 'Tất cả chức vụ', value: '' },
                ...Object.entries(roleLabels).map(([code, label]) => ({ label, value: code }))
              ]}
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Nhân viên</th>
                  <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Vai trò</th>
                  <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                  <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-400">Đang tải danh sách...</p>
                    </td>
                  </tr>
                ) : (data as any)?.items?.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{user.fullName}</span>
                          <span className="text-xs text-slate-400">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles?.map((role: string) => (
                          <span key={role} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-tighter">
                            {roleLabels[role as keyof typeof roleLabels] || role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge 
                        status={user.status === 'ACTIVE' ? 'active' : 'inactive'} 
                        label={user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã vô hiệu'} 
                      />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedUser(user); setIsRoleModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Phân quyền"
                        >
                          <UserCog className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            user.status === 'ACTIVE' 
                              ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" 
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          )}
                          title={user.status === 'ACTIVE' ? 'Vô hiệu hoá' : 'Kích hoạt'}
                        >
                          {user.status === 'ACTIVE' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo tài khoản mới"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input 
            label="Email đăng nhập" 
            type="email" 
            placeholder="example@eim.edu.vn"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            required
          />
          <Input 
            label="Họ và tên" 
            placeholder="Nguyễn Văn A"
            value={newUser.fullName}
            onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
            required
          />
          <Input 
            label="Mật khẩu tạm thời" 
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Chức vụ ban đầu</label>
            <Select 
              options={Object.entries(roleLabels).map(([code, label]) => ({ label, value: code }))}
              value={newUser.roleCode}
              onChange={(e) => setNewUser({...newUser, roleCode: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)} type="button">Hủy</Button>
            <Button type="submit" loading={createUserMutation.isPending}>Tạo tài khoản</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Phân quyền */}
      <Modal
        open={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Quản lý vai trò"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white shadow-sm text-indigo-600 font-black text-xl">
                {selectedUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{selectedUser.fullName}</h4>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Chọn các vai trò:</h5>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(roleLabels).map(([code, label]) => {
                  const isAssigned = selectedUser.roles?.includes(code);
                  const isProcessing = (assignRoleMutation.isPending || revokeRoleMutation.isPending) && selectedUser.id;

                  return (
                    <button
                      key={code}
                      onClick={() => handleToggleRole(selectedUser, code)}
                      disabled={isProcessing}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                        isAssigned 
                          ? "bg-indigo-50 border-indigo-200" 
                          : "bg-white border-slate-100 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-5 w-5 rounded-md border flex items-center justify-center transition-all",
                          isAssigned ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300"
                        )}>
                          {isAssigned && <ShieldCheck className="h-3 w-3" />}
                        </div>
                        <span className={cn("text-sm font-bold", isAssigned ? "text-indigo-900" : "text-slate-600")}>
                          {label}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter group-hover:text-indigo-400">
                        {code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              * Thay đổi sẽ có hiệu lực ngay lập tức. Người dùng có thể cần tải lại trang để thấy cập nhật.
            </p>

            <div className="pt-4 border-t flex justify-end">
              <Button variant="secondary" onClick={() => setIsRoleModalOpen(false)}>Đóng</Button>
            </div>
          </div>
        )}
      </Modal>
    </PageShell>
  );
};

export default UserManagementPage;
