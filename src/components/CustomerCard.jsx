import React from "react";
import {
  Phone,
  ArrowRight,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const CustomerCard = ({
  id,
  name,
  phone,
  balance = 0,
  transactions = 0,
}) => {

  const hasBalance = balance > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      {/* Header */}
      <div className="flex items-center gap-3">

        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <UserRound size={21} />
        </div>

        <div className="min-w-0 flex-1">

          <h3 className="truncate font-semibold text-slate-900">
            {name}
          </h3>

          {phone && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Phone size={12} />
              {phone}
            </p>
          )}

        </div>

      </div>

      {/* Balance */}
      <div className="mt-5 rounded-xl bg-slate-50 p-4">

        <div className="flex items-center justify-between">

          <span className="text-xs font-medium text-slate-500">
            Outstanding Balance
          </span>

          <span
            className={`text-xs font-semibold ${
              hasBalance
                ? "text-red-500"
                : "text-emerald-600"
            }`}
          >
            {hasBalance ? "To Receive" : "Settled"}
          </span>

        </div>

        <p
          className={`mt-2 text-xl font-bold ${
            hasBalance
              ? "text-red-600"
              : "text-emerald-600"
          }`}
        >
          ₹{Math.abs(balance).toLocaleString("en-IN")}
        </p>

      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">

        <span className="text-xs text-slate-500">
          {transactions} Transactions
        </span>

        <Link
          to={`/customers/${id}`}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 transition hover:text-emerald-700"
        >
          View Details
          <ArrowRight size={14} />
        </Link>

      </div>

    </div>
  );
};

export default CustomerCard;