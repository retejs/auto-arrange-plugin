import { ElkNode } from 'elkjs'
import { NodeId } from 'rete'

import { ExpectedSchemes } from '../../../types'
import { StandardApplier } from '../standard'
import { AnimationSystem } from './animation'

/**
 * Transition applier props
 */
export type Props = {
  /** Transition duration */
  duration?: number
  /** Transition timing function. Default is linear */
  timingFunction?: (t: number) => number
  /** Callback for each tick (frame) of the transition */
  onTick?: (t: number) => void
  /** Callback specifying whether the node needs to be laid out */
  needsLayout?: (id: NodeId) => boolean
}

/**
 * Transition applier. Applies the layout to the nodes and their children with transition
 */
export class TransitionApplier<S extends ExpectedSchemes, K> extends StandardApplier<S, K> {
  duration: number
  timingFunction: (t: number) => number
  animation = new AnimationSystem()

  /**
   * @param props Transition applier props
   */
  constructor(private props?: Props) {
    super()
    this.duration = typeof props?.duration !== 'undefined' ? props.duration : 2000
    this.timingFunction = typeof props?.timingFunction !== 'undefined' ? props.timingFunction : t => t

    this.animation.start()
  }

  protected applyTiming(from: number, to: number, t: number) {
    const k = this.timingFunction(t)

    return from * (1 - k) + to * k
  }

  protected async resizeNode(id: NodeId, width: number, height: number) {
    const node = this.editor.getNode(id)

    if (!node) return false
    const previous = { width: node.width, height: node.height }

    return await this.animation.add(this.duration, `${id}_resize`, t => {
      const currentWidth = this.applyTiming(previous.width, width, t)
      const currentHeight = this.applyTiming(previous.height, height, t)

      this.props?.onTick && this.props.onTick(t)
      return super.resizeNode(id, currentWidth, currentHeight)
    })
  }

  protected async translateNode(id: NodeId, x: number, y: number) {
    const view = this.area.nodeViews.get(id)

    if (!view) return false
    const previous = { ...view.position }

    return await this.animation.add(this.duration, `${id}_translate`, t => {
      const currentX = this.applyTiming(previous.x, x, t)
      const currentY = this.applyTiming(previous.y, y, t)

      this.props?.onTick && this.props.onTick(t)
      return super.translateNode(id, currentX, currentY)
    })
  }

  public cancel(id: NodeId) {
    this.animation.cancel(`${id}_resize`)
    this.animation.cancel(`${id}_translate`)
  }

  public async apply(nodes: ElkNode[], offset = { x: 0, y: 0 }) {
    const correctNodes = this.getValidShapes(nodes)

    await Promise.all(correctNodes.map(({ id, x, y, width, height, children }) => {
      const hasChilden = children && children.length
      const needsLayout = this.props?.needsLayout ? this.props.needsLayout(id) : true
      const forceSelf = !hasChilden || needsLayout

      return Promise.all([
        hasChilden && this.apply(children, { x: offset.x + x, y: offset.y + y }),
        forceSelf && this.resizeNode(id, width, height),
        forceSelf && this.translateNode(id, offset.x + x, offset.y + y)
      ])
    }))
  }

  public destroy() {
    this.animation.stop()
  }
}
