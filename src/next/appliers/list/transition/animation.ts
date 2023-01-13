
type AnimationRecord = {
    startTime: number
    duration: number
    cb: (t: number) => void
    done: (success: boolean) => void
}

export class AnimationSystem {
    activeAnimations = new Map<string, AnimationRecord>()
    frameId?: number

    start() {
        const entries = Array.from(this.activeAnimations.entries())

        entries.forEach(([key, { startTime, duration, cb, done }]) => {
            let t = (Date.now() - startTime) / duration

            if (t >= 1) t = 1

            if (t < 0 || t >= 1) {
                this.activeAnimations.delete(key)
                if (t >= 1) {
                    cb(1)
                    done(true)
                }
                return
            }
            cb(t)
        })
        this.frameId = requestAnimationFrame(() => this.start())
    }

    async add<R>(duration: number, id: string, tick: (t: number) => Promise<R>) {
        const startTime = Date.now()

        return new Promise<boolean>(done => {
            this.activeAnimations.set(id, { startTime, duration, cb: tick, done })
        })
    }

    cancel(key: string) {
        this.activeAnimations.get(key)?.done(false)
        this.activeAnimations.delete(key)
    }

    stop() {
        if (typeof this.frameId !== 'undefined') cancelAnimationFrame(this.frameId)
    }
}
