import { ElkNode, ElkShape } from 'elkjs'
import { NodeId } from 'rete'

import { ExpectedSchemes } from '../../types'
import { Applier } from '../applier'

/**
 * Standard applier. Applies the layout to the nodes and their children immediately
 */
export class StandardApplier<S extends ExpectedSchemes, K> extends Applier<S, K> {
  protected getValidShapes<Shape extends ElkShape>(shapes: Shape[]): (Shape & Required<ElkShape>)[] {
    return shapes.filter((shape): shape is Shape & Required<ElkShape> => {
      const { x, y, width, height } = shape

      return ![typeof x, typeof y, typeof width, typeof height].includes('undefined')
    })
  }
  protected async resizeNode(id: NodeId, width: number, height: number): Promise<void | boolean> {
    return await this.area.resize(id, width, height)
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
