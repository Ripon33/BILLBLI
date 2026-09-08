import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-billbli="card"
      className={`billbli-card ${className}`.trim()}
      {...props}
    />
  );
}
