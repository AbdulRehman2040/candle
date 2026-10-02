export const STATUS_LABEL = {
  new: "New",
  contacted: "Contacted",
  archived: "Archived",
};

export function formatDate(value) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function websiteHref(url) {
  return url.startsWith("http") ? url : `https://${url}`;
}
