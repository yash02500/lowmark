const normalizeProductUrl = (url: string): string => {
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname.toLowerCase();

  // Amazon
  if (hostname === "amazon.in" || hostname === "www.amazon.in") {
    const dpMatch = parsedUrl.pathname.match(
      /\/dp\/([A-Z0-9]{10})/i
    );

    if (dpMatch) {
      return `https://www.amazon.in/dp/${dpMatch[1].toUpperCase()}`;
    }

    const productMatch = parsedUrl.pathname.match(
      /\/gp\/product\/([A-Z0-9]{10})/i
    );

    if (productMatch) {
      return `https://www.amazon.in/dp/${productMatch[1].toUpperCase()}`;
    }
  }

  // Flipkart
  if (
    hostname === "flipkart.com" ||
    hostname === "www.flipkart.com"
  ) {
    const pid = parsedUrl.searchParams.get("pid");
    const lid = parsedUrl.searchParams.get("lid");

    // Keep only product identifiers
    const params = new URLSearchParams();

    if (pid) {
      params.set("pid", pid);
    }

    if (lid) {
      params.set("lid", lid);
    }

    const queryString = params.toString();

    return `https://www.flipkart.com${parsedUrl.pathname}${queryString ? `?${queryString}` : ""
      }`;
  }

  // Generic fallback
  parsedUrl.search = "";
  parsedUrl.hash = "";

  return parsedUrl.toString();
};

export default normalizeProductUrl;