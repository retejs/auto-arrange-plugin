import { ElkNode, ElkShape } from 'elkjs'
import { NodeId } from 'rete'

import { BaseSchemes, Size } from '../../types'
import { Applier } from '..'

export class StandardApplier<S extends BaseSchemes, K> extends Applier<S, K> {
    protected getValidShapes<Shape extends ElkShape>(shapes: Shape[]): (Shape & Required<ElkShape>)[] {
        return shapes.filter((shape): shape is Shape & Required<ElkShape> => {
            const { x, y, width, height } = shape

            return ![typeof x, typeof y, typeof width, typeof height].includes('undefined')
        })
    }

    // eslint-disable-next-line max-statements
    protected async resizeNode(id: NodeId, width: number, height: number): Promise<void | boolean> {
        const node = this.editor.getNode(id)
        const view = this.area.nodeViews.get(id)

        if (!node || !view) return

        const previous: Size = { width: node.width, height: node.height }

        node.height = height
        node.width = width

        const item = view.element.children.item(0) as HTMLElement

        if (item) {
            item.style.width = `${width}px` // TODO create interface and keep performance
            item.style.height = `${height}px`
            this.area.emit({ type: 'noderesized', data: { id: node.id, size: { width, height }, previous } })
        }
    }

    protected async translateNode(id: NodeId, x: number, y: number): Promise<void | boolean> {
        const view = this.area.nodeViews.get(id)

        if (view) {
            await view.translate(x, y)
        }
    }

    public async apply(nodes: ElkNode[], offset = { x: 0, y: 0 }) {
        const correctNodes = this.getValidShapes(nodes)

        await Promise.all(correctNodes.map(async ({ id, x, y, width, height, children }) => {
            await Promise.all([
                this.resizeNode(id, width, height),
                this.translateNode(id, offset.x + x, offset.y + y)
            ])

            if (children) {
                await this.apply(children, { x: offset.x + x, y: offset.y + y })
            }
        }))
    }
}
