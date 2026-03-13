import DOMPurify from "dompurify";

/**
 * Sanitize untrusted HTML (e.g. AI-generated email content) before rendering
 * with dangerouslySetInnerHTML. Strips scripts, event handlers, and other XSS
 * vectors while preserving safe formatting tags.
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "em", "strong", "u", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td", "img", "span", "div",
      "hr",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "class", "style", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}
