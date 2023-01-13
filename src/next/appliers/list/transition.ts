import { ElkNode } from 'elkjs'
import { NodeId } from 'rete'

import { BaseSchemes } from '../../types'
import { StandardApplier } from './standard'

export class TransitionApplier<S extends BaseSchemes, K> extends StandardApplier<S, K> {
    duration: number
    timingFunction: (t: number) => number

    constructor(props?: { duration?: number, timingFunction?: (t: number) => number }) {
        super()
        this.duration = typeof props?.duration !== 'undefined' ? props.duration : 2000
        this.timingFunction = typeof props?.timingFunction !== 'undefined' ? props.timingFunction : t => t
    }

    protected applyTiming(from: number, to: number, t: number) {
        const k = this.timingFunction(t)

        return from * (1 - k) + to * k
    }

    protected async resizeNode(id: NodeId, width: number, height: number) {
        const node = this.editor.getNode(id)

        if (!node) return
        const previous = { width: node.width, height: node.height }

        await this.animate(this.duration, t => {
            const currentWidth = this.applyTiming(previous.width, width, t)
            const currentHeight = this.applyTiming(previous.height, height, t)

            return super.resizeNode(id, currentWidth, currentHeight)
        })
    }

    protected async translateNode(id: NodeId, x: number, y: number) {
        const view = this.area.nodeViews.get(id)

        if (!view) return
        const previous = { ...view.position }

        await this.animate(this.duration, t => {
            const currentX = this.applyTiming(previous.x, x, t)
            const currentY = this.applyTiming(previous.y, y, t)

            return super.translateNode(id, currentX, currentY)
        })
    }

    protected async animate(duration: number, tick: (t: number) => Promise<void>) {
        const startTime = Date.now()

        for (let t = 0; t < 1; t = (Date.now() - startTime) / duration) {
            await new Promise(res => requestAnimationFrame(res))
            await tick(t)
        }
        await tick(1)
    }

    public async apply(nodes: ElkNode[], offset = { x: 0, y: 0 }) {
        const correctNodes = this.getValidShapes(nodes)

        await Promise.all(correctNodes.map(({ id, x, y, width, height, children }) => {
            const hasChilden = children && children.length

            return Promise.all([
                hasChilden && this.apply(children, { x: offset.x + x, y: offset.y + y }),
                this.resizeNode(id, width, height),
                this.translateNode(id, offset.x + x, offset.y + y)
            ])
        }))
    }
}
