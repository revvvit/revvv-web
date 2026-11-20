/**
 * Renders an inline script that runs during HTML parsing on the server render only.
 * On the client it becomes `text/plain`, which avoids React's dev warning about
 * rendering <script> tags; `suppressHydrationWarning` covers the type mismatch.
 */
interface InlineScriptProps {
  html: string;
}

export function InlineScript({ html }: InlineScriptProps) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
