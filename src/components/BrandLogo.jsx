import React, { useState } from "react";

/**
 * BrandLogo — the KhataNex logo image with a safe fallback.
 * If /images/Logo.jpeg can't be loaded it shows a branded "K" tile instead of a broken image.
 */
const BrandLogo = ({ size = 48, className = "", rounded = "rounded-2xl" }) => {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };

  if (failed) {
    return (
      <div
        style={style}
        className={`flex shrink-0 items-center justify-center bg-brand-gradient font-extrabold text-white ${rounded} ${className}`}
        aria-label="KhataNex"
      >
        K
      </div>
    );
  }

  return (
    <img
      src="/images/Logo.jpeg"
      alt="KhataNex logo"
      style={style}
      onError={() => setFailed(true)}
      className={`shrink-0 object-cover ${rounded} ${className}`}
    />
  );
};

export default BrandLogo;
