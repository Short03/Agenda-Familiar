import { Link } from 'react-router'
import { Page } from '../shared/ui/Page'

export function NotFoundPage() {
  return (
    <Page title="Página no encontrada">
      <p className="mb-4 text-fg-muted">Esta página no existe.</p>
      <Link to="/calendario" className="font-semibold text-accent underline underline-offset-4">
        Ir al calendario
      </Link>
    </Page>
  )
}
