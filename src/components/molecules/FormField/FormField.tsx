import { type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "../../atoms/Input";
import { Label } from "../../atoms/Label";
import { Select, type SelectOption } from "../../atoms/Select";

type FormFieldType = "input" | "select";

interface BaseFormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  type?: FormFieldType;
}

interface InputFormFieldProps
  extends BaseFormFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type"> {
  type?: "input";
  inputType?:
    | "text"
    | "email"
    | "number"
    | "password"
    | "search"
    | "tel"
    | "url";
}

interface SelectFormFieldProps
  extends BaseFormFieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "name"> {
  type: "select";
  options: SelectOption[];
  placeholder?: string;
}

export type FormFieldProps = InputFormFieldProps | SelectFormFieldProps;

export function FormField(props: FormFieldProps) {
  const {
    formState: { errors },
    register,
  } = useFormContext();
  const { name, label, required = false } = props;
  const error = errors[name]?.message as string | undefined;

  if (props.type === "select") {
    const { options, placeholder, ...selectProps } = props;
    return (
      <div className="space-y-1">
        <Label htmlFor={name} required={required}>
          {label}
        </Label>
        <Select
          id={name}
          options={options}
          placeholder={placeholder}
          hasError={!!error}
          {...register(name)}
          {...selectProps}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    );
  }

  const { inputType = "text", ...inputProps } = props;
  return (
    <div className="space-y-1">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <Input
        id={name}
        type={inputType}
        hasError={!!error}
        {...register(name)}
        {...inputProps}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
