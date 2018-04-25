import createNotif from '../../util/notifications'
import { idleManager } from '../../util/idle'
import { MigrationManager } from './migration-manager'
import { getBackend } from '../'

window['Migrate'] = MigrationManager

const migrator = new MigrationManager({
    onComplete() {
        createNotif({
            requireInteraction: true,
            title: 'Memex Extension',
            message:
                'Your data has been migrated to our new and improved index!',
        })

        // Update global setting to force switch to using new index for all interface methods
        getBackend._reset({ useOld: false })
    },
})

// Schedule migrator to run when browser is idle
idleManager.scheduleIdleCbs({
    onIdle: () => migrator.start(),
    onActive: () => migrator.stop(),
})

export * from './types'
export { MigrationManager }
