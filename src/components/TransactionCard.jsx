import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
} from "lucide-react";

const TransactionCard = ({
  name,
  type = "credit",
  amount,
  date,
  description,
  avatar,
}) => {

  const isCredit = type === "credit";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 transition hover:border-slate-200 hover:shadow-sm">

      {/* Avatar */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
        {avatar || name?.charAt(0)?.toUpperCase() || "U"}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">

        <h4 className="truncate text-sm font-semibold text-slate-800">
          {name}
        </h4>

        <div className="mt-1 flex items-center gap-2">

          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock size={12} />
            {date}
          </span>

          {description && (
            <>
              <span className="text-slate-300">•</span>

              <span className="truncate text-xs text-slate-400">
                {description}
              </span>
            </>
          )}

        </div>

      </div>

      {/* Amount */}
      <div className="text-right">

        <p
          className={`text-sm font-bold ${
            isCredit
              ? "text-emerald-600"
              : "text-red-500"
          }`}
        >
          {isCredit ? "+" : "-"} ₹{amount}
        </p>

        <span
          className={`mt-1 inline-flex items-center gap-1 text-[11px] font-medium ${
            isCredit
              ? "text-emerald-600"
              : "text-red-500"
          }`}
        >
          {isCredit ? (
            <>
              <ArrowDownLeft size={12} />
              Credit
            </>
          ) : (
            <>
              <ArrowUpRight size={12} />
              Debit
            </>
          )}
        </span>

      </div>

    </div>
  );
};

export default TransactionCard;