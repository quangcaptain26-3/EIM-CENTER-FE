import { forwardRef, type SelectHTMLAttributes } from 'react';
import { FormField } from './form-field';
import { Select } from '@/shared/ui/select';

export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  options: { value: string | number; label: string }[];
  containerClassName?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      htmlFor,
      required,
      error,
      helpText,
      options,
      containerClassName,
      id,
      className,
      ...props
    },
    ref,
  ) => {
    const selectId = id ?? htmlFor;

    return (
      <FormField
        label={label}
        htmlFor={selectId}
        required={required}
        error={error}
        helpText={helpText}
        className={containerClassName}
      >
        <Select
          ref={ref}
          id={selectId}
          error={Boolean(error)}
          options={options}
          className={className}
          {...props}
        />
      </FormField>
    );
  },
);

FormSelect.displayName = 'FormSelect';
