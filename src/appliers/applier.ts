import { ElkNode } from 'elkjs'
import { NodeEditor } from 'rete'
import { BaseAreaPlugin } from 'rete-area-plugin'

import { ExpectedSchemes } from '../types'

export abstract class Applier<S extends ExpectedSchemes, K> {
  editor!: NodeEditor<S>
  area!: BaseAreaPlugin<S, K>

  setEditor(editor: NodeEditor<S>) {
    this.editor = editor
  }

  setArea(area: BaseAreaPlugin<S, K>) {
    this.area = area
  }

  public abstract apply(nodes: ElkNode[]): Promise<void>
}
