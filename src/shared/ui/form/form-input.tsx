import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { FormField } from './form-field';
import { Input } from '@/shared/ui/input';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  containerClassName?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      htmlFor,
      required,
      error,
      helpText,
      containerClassName,
      id,
      leftIcon,
      rightIcon,
      className,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? htmlFor;

    return (
      <FormField
        label={label}
        htmlFor={inputId}
        required={required}
        error={error}
        helpText={helpText}
        className={containerClassName}
      >
        <Input
          ref={ref}
          id={inputId}
          error={Boolean(error)}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          className={className}
          {...props}
        />
      </FormField>
    );
  },
);

FormInput.displayName = 'FormInput';
