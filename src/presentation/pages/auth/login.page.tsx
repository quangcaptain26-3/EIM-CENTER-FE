// login.page.tsx
// Trang Đăng nhập hệ thống – Sử dụng React Hook Form + Zod Validation + React Query Mutation.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/presentation/hooks/auth/use-auth";
import { useLogin } from "@/presentation/hooks/auth/use-login";
import { RoutePaths } from "@/app/router/route-paths";
import {
  loginFormSchema,
  type LoginFormValues,
  defaultLoginFormValues,
} from "@/application/auth/forms/login.form";

import AuthLayout from "@/presentation/layouts/auth-layout";
import { Button } from "@/shared/ui/button";
import { FormInput } from "@/shared/ui/form/form-input";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const loginMutation = useLogin();

  // Redirect về Dashboard nếu đã đăng nhập thành công (session còn valid)
  useEffect(() => {
    if (isAuthenticated) {
      navigate(RoutePaths.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Cấu hình React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: defaultLoginFormValues,
  });

  // Xử lý Submit gọi API
  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        // useLogin hook đã xử lý toast và update store.
        // Sau khi store isAuthenticated = true, useEffect bên trên sẽ tự redirect.
      },
    });
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Đăng nhập</h2>
        <p className="text-sm text-gray-500">
          Vui lòng điền thông tin để truy cập hệ thống
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Field: Email */}
        <FormInput
          label="Email"
          type="email"
          placeholder="admin@eim.edu.vn"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Field: Password */}
        <FormInput
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        {/* Nút Đăng nhập */}
        <Button
          type="submit"
          variant="primary"
          className="w-full mt-6 h-11 text-base shadow-sm hover:shadow-md transition-shadow"
          loading={loginMutation.isPending}
        >
          Đăng nhập
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
