import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({
  className = "",
  label,
  id,
  ...props
}: InputProps) {
  return (
    <input
      id={id}
      aria-label={label}
      className={`billbli-input ${className}`.trim()}
      {...props}
    />
  );
}
