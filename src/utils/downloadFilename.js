export const getDownloadFilename = (contentDisposition, fallback = "Invoice.pdf") => {
  if (!contentDisposition) return fallback;

  const encodedFilename = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encodedFilename) {
    try {
      return decodeURIComponent(encodedFilename.replace(/^"|"$/g, ""));
    } catch {
      // Fall through to the regular filename parameter.
    }
  }

  const filename = contentDisposition.match(/filename="?([^";]+)"?/i)?.[1];
  return filename || fallback;
};
