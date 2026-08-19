import React from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  type = "default",
  change,
  description,
}) => {

  const styles = {
    default: {
      icon: "bg-slate-100 text-slate-600",
      change: "text-slate-600",
    },

    success: {
      icon: "bg-emerald-100 text-emerald-600",
      change: "text-emerald-600",
    },

    danger: {
      icon: "bg-red-100 text-red-600",
      change: "text-red-600",
    },

    warning: {
      icon: "bg-amber-100 text-amber-600",
      change: "text-amber-600",
    },

    blue: {
      icon: "bg-blue-100 text-blue-600",
      change: "text-blue-600",
    },
  };

  const currentStyle = styles[type] || styles.default;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      {/* Top */}
      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${currentStyle.icon}`}
          >
            <Icon size={21} />
          </div>
        )}

      </div>

      {/* Bottom */}
      {(change || description) && (
        <div className="mt-4 flex items-center gap-2">

          {change && (
            <span
              className={`flex items-center gap-1 text-xs font-semibold ${currentStyle.change}`}
            >
              {type === "danger" ? (
                <ArrowDownRight size={14} />
              ) : (
                <ArrowUpRight size={14} />
              )}

              {change}
            </span>
          )}

          {description && (
            <span className="text-xs text-slate-400">
              {description}
            </span>
          )}

        </div>
      )}

    </div>
  );
};

export default StatCard;