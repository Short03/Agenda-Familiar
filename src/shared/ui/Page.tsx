import type { ReactNode } from 'react'

const APP_NAME = 'Agenda familiar'

interface PageProps {
  title: string
  children?: ReactNode
}

/**
 * Every route renders one Page: it sets the document title (React 19 hoists <title>
 * into <head>) and the single <h1>. The h1 has tabIndex={-1} so the layout can move
 * focus to it after a navigation.
 */
export function Page({ title, children }: PageProps) {
  return (
    <>
      <title>{`${title} · ${APP_NAME}`}</title>
      <h1 tabIndex={-1} className="mb-4 text-2xl font-bold text-fg sm:text-3xl">
        {title}
      </h1>
      {children}
    </>
  )
}
