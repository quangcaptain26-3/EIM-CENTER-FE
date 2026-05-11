import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { AuthLayout } from '@/presentation/layouts/auth-layout';
import { FormField } from '@/shared/ui/form/form-field';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import { useLogin } from '@/presentation/hooks/auth/use-login';
import type { ApiError } from '@/shared/types/api.type';
import { RoutePaths } from '@/app/router/route-paths';

const loginSchema = z.object({
  email: z.string().min(1, 'Nhập email').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function mapLoginError(err: ApiError): string {
  switch (err.code) {
    case 'AUTH_INVALID_CREDENTIALS':
      return 'Email hoặc mật khẩu không đúng';
    case 'AUTH_USER_INACTIVE':
      return 'Tài khoản đã bị vô hiệu hóa';
    case 'NETWORK_ERROR':
      return 'Không thể kết nối đến server';
    default:
      return err.message || 'Đăng nhập thất bại';
  }
}

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!loginMutation.isError || !loginMutation.error) return;
    const err = loginMutation.error as unknown as ApiError;
    setError('root', { message: mapLoginError(err) });
  }, [loginMutation.isError, loginMutation.error, setError]);

  if (isAuthenticated) {
    return <Navigate to={RoutePaths.DASHBOARD} replace />;
  }

  const onSubmit = (values: LoginFormValues) => {
    clearErrors('root');
    loginMutation.mutate(values);
  };

  const pending = loginMutation.isPending;

  return (
    <AuthLayout>
      <div className="animate-login-form-in space-y-6">
        <div className="text-center">
          <h1 className="font-display text-xl font-semibold text-[var(--text-primary)]">Đăng nhập</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">EIM Center</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root?.message ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {errors.root.message}
            </div>
          ) : null}

          <FormField label="Email" htmlFor="login-email" error={errors.email?.message}>
            <Input
              id="login-email"
              {...register('email')}
              type="email"
              autoComplete="email"
              leftIcon={<Mail className="text-[var(--text-muted)]" strokeWidth={1.5} />}
              disabled={pending}
            />
          </FormField>

          <FormField label="Mật khẩu" htmlFor="login-password" error={errors.password?.message}>
            <Input
              id="login-password"
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              leftIcon={<Lock className="text-[var(--text-muted)]" strokeWidth={1.5} />}
              rightIcon={
                <button
                  type="button"
                  tabIndex={-1}
                  className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="size-4" strokeWidth={1.5} />
                  )}
                </button>
              }
              disabled={pending}
            />
          </FormField>

          <Button type="submit" className="w-full" loading={pending} disabled={pending}>
            Đăng nhập
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
