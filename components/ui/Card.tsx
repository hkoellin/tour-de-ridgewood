import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={["bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: CardProps) {
  return (
    <div className={["px-6 py-4 border-b border-gray-100", className].join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "", ...props }: CardProps) {
  return (
    <div className={["px-6 py-4", className].join(" ")} {...props}>
      {children}
    </div>
  );
}
