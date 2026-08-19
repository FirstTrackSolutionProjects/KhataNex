import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  fullWidth = false,
  onClick,
  className = "",
}) => {

  const variants = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",

    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400",

    outline:
      "border border-emerald-600 bg-white text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500",

    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",

    warning:
      "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500",

    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-lg
        font-semibold
        transition
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >

      {loading ? (
        <>
          <Loader2
            size={17}
            className="animate-spin"
          />
          Processing...
        </>
      ) : (
        <>
          {Icon && <Icon size={17} />}
          {children}
        </>
      )}

    </button>
  );
};

export default Button;