interface SkipLinkProps {
  targetId: string
}

/** First focusable element on the page. Hidden until it receives keyboard focus (WCAG 2.4.1). */
export function SkipLink({ targetId }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only rounded-theme bg-accent px-4 py-2 font-semibold text-accent-fg focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
    >
      Saltar al contenido
    </a>
  )
}
