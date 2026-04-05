import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function decodeHtmlEntities(value: string) {
  if (typeof document === "undefined") {
    return value
      .replace(/&nbsp;/gi, " ")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

export function normalizeRichTextContent(value: string) {
  const decoded = decodeHtmlEntities(value ?? "").trim();

  if (!decoded) return "";

  if (/<\/?[a-z][\s\S]*>/i.test(decoded)) {
    return decoded;
  }

  return decoded
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function stripHtml(value: string) {
  const normalized = normalizeRichTextContent(value);

  if (!normalized) return "";

  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(normalized, "text/html");
    return (doc.body.textContent || "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return normalized
    .replace(/<[^>]*>/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
