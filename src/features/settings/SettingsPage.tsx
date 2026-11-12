import { Page } from '../../shared/ui/Page'
import { BackupSection } from '../backup/BackupSection'
import { CustomDaysManager } from '../special-days/CustomDaysManager'
import { StorageSection } from './StorageSection'

const sectionClass = 'space-y-3'

export function SettingsPage() {
  return (
    <Page title="Ajustes">
      <div className="space-y-8">
        <section aria-labelledby="settings-family" className={sectionClass}>
          <h2 id="settings-family" className="text-xl font-bold">
            Fechas de la familia
          </h2>
          <CustomDaysManager />
        </section>

        <section aria-labelledby="settings-backup" className={sectionClass}>
          <h2 id="settings-backup" className="text-xl font-bold">
            Respaldo
          </h2>
          <BackupSection />
        </section>

        <section aria-labelledby="settings-storage" className={sectionClass}>
          <h2 id="settings-storage" className="text-xl font-bold">
            Almacenamiento
          </h2>
          <StorageSection />
        </section>
      </div>
    </Page>
  )
}
