import { forwardRef } from "react";

const variants = {
  primary: "button button--primary",
  secondary: "button button--secondary",
  outline: "button button--outline",
  ghost: "button button--ghost",
};

const Button = forwardRef(function Button(
  { children, className = "", variant = "primary", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${variants[variant]} ${className}`.trim()}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
