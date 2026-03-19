import { forwardRef } from "react";
import { Select, type SelectProps } from "@/shared/ui/select";
import { FormField } from "./form-field";

export interface FormSelectProps extends SelectProps {
  label?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, required, id, className, ...props }, ref) => {
    return (
      <FormField
        label={label}
        error={error}
        required={required}
        htmlFor={id}
        className={className}
      >
        <Select
          ref={ref}
          id={id}
          error={error}
          required={required}
          {...props}
        />
      </FormField>
    );
  },
);

FormSelect.displayName = "FormSelect";
