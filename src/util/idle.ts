import { browser, Idle } from 'webextension-polyfill-ts'

export type IdleState = Idle.IdleState | 'locked'
type Handler = () => Promise<void> | void
type ErrHandler = (err: Error) => void

interface IdleHandlers {
    onIdle: Handler
    onActive: Handler
    onLocked: Handler
}

export class IdleManager {
    // States to hold scheduled handlers in
    private handlers = {
        idle: new Set<Handler>(),
        locked: new Set<Handler>(),
        active: new Set<Handler>(),
    }

    private runHandler = (handler: Handler) =>
        Promise.resolve(handler()).catch(this._errHandler)

    private _errHandler: ErrHandler = err => {
        if (process.env.NODE_ENV === 'development') {
            console.error(err)
        }
    }

    set errHandler(handler: ErrHandler) {
        this._errHandler = handler
    }

    public handleIdleStateChange = (state: IdleState) =>
        [...this.handlers[state]].map(this.runHandler)

    /**
     * Allow setting up of logic to be run on different browser idle events.
     */
    public scheduleIdleCbs(handlerCbs: Partial<IdleHandlers>) {
        if (handlerCbs.onIdle) {
            this.handlers.idle.add(handlerCbs.onIdle)
        }

        if (handlerCbs.onLocked) {
            this.handlers.locked.add(handlerCbs.onLocked)
        }

        if (handlerCbs.onActive) {
            this.handlers.active.add(handlerCbs.onActive)
        }
    }
}

const idleManager = new IdleManager()

if (browser.idle) {
    // Run all handlers in specific state corresponding to idle state change
    browser.idle.onStateChanged.addListener(idleManager.handleIdleStateChange)
}

export { idleManager }
