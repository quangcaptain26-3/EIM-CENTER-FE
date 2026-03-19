// form-input.tsx
// Wrapper kết nối Input UI gốc với React Hook Form và FormField chuẩn.

import { forwardRef } from "react";
import { Input, type InputProps } from "@/shared/ui/input";
import { FormField } from "./form-field";

export interface FormInputProps extends InputProps {
  label?: string;
  error?: string;
  // Bỏ required của HTML gốc đi để Zod kiểm tra thay
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, required, id, className, ...props }, ref) => {
    return (
      <FormField
        label={label}
        error={error}
        required={required}
        htmlFor={id}
        className={className}
      >
        <Input
          ref={ref}
          id={id}
          error={error} // Truyền error xuống để Input đổi màu viền
          required={required}
          {...props}
        />
      </FormField>
    );
  },
);

FormInput.displayName = "FormInput";
