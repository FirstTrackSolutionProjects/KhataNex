import React from "react";
import { Menu, Home, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import Button from "./Button";
import { useSubscriptionAccess } from "../hooks/useSubscriptionAccess";

const PageHeader = ({
  title,
  subtitle,
  onMenuClick,
  showHome = true,
  showSearch = false,
  onSearchClick,
  showProfile = true,
  onNew,
  newLabel = "New",
  newButtonVariant,
  newDisabled = false,
  newTooltip,
  onDisabledNew,
  children,
}) => {
  const navigate = useNavigate();
  const { openSubscriptionPrompt } = useSubscriptionAccess();

  const handleSearch = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      const searchInput = document.querySelector(
        'input[type="text"], input[type="search"], input[placeholder*="Search"]'
      );
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        )}

        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden text-xs text-slate-400 sm:block truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {showHome && (
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
            aria-label="Home"
            title="Home"
          >
            <Home size={19} />
          </button>
        )}

        {showSearch && (
          <button
            type="button"
            onClick={handleSearch}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
            aria-label="Search"
            title="Search"
          >
            <Search size={19} />
          </button>
        )}

        {showProfile && <ProfileDropdown />}

        {children}

        {onNew && (
          <div className="hidden sm:block">
            <Button
              icon={Plus}
              size="sm"
              variant={newButtonVariant}
              onClick={onNew}
              disabled={newDisabled}
              onDisabledClick={() => (onDisabledNew ? onDisabledNew() : openSubscriptionPrompt(title || newLabel))}
              title={newTooltip}
              className="ml-1 px-3 py-1.5 text-xs sm:text-sm font-semibold"
            >
              {newLabel}
            </Button>
          </div>
        )}
      </div>
    </header>

    {onNew && (
      <div className="border-b border-slate-100 bg-white px-4 py-2 sm:hidden">
        <Button
          icon={Plus}
          size="sm"
          variant={newButtonVariant}
          onClick={onNew}
          disabled={newDisabled}
          onDisabledClick={() => (onDisabledNew ? onDisabledNew() : openSubscriptionPrompt(title || newLabel))}
          title={newTooltip}
          className="w-full justify-center py-2 text-xs font-semibold shadow-sm"
        >
          {newLabel}
        </Button>
      </div>
    )}
  </>
  );
};

export default PageHeader;
