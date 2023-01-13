import { ElkNode } from 'elkjs'
import { NodeId } from 'rete'

import { BaseSchemes } from '../../types'
import { StandardApplier } from './standard'

export class TransitionApplier<S extends BaseSchemes, K> extends StandardApplier<S, K> {
    duration: number

    constructor(props?: { duration?: number }) {
        super()
        this.duration = typeof props?.duration !== 'undefined' ? props.duration : 2000
    }

    protected async resizeNode(id: NodeId, width: number, height: number) {
        const node = this.editor.getNode(id)

        if (!node) return
        const previous = { width: node.width, height: node.height }

        await this.animate(
            this.duration,
            t => super.resizeNode(id, width * t + previous.width * (1 - t), height * t + previous.height * (1 - t))
        )
    }

    protected async translateNode(id: NodeId, x: number, y: number) {
        const view = this.area.nodeViews.get(id)

        if (!view) return
        const previous = { ...view.position }

        await this.animate(
            this.duration,
            t => super.translateNode(id, x * t + previous.x * (1 - t), y * t + previous.y * (1 - t))
        )
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
