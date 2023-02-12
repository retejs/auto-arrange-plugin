import { ElkNode } from 'elkjs'
import { NodeEditor } from 'rete'
import { AreaPlugin } from 'rete-area-plugin'

import { ExpectedSchemes } from '../types'

export abstract class Applier<S extends ExpectedSchemes, K> {
    editor!: NodeEditor<S>
    area!: AreaPlugin<S, K>

    setEditor(editor: NodeEditor<S>) {
        this.editor = editor
    }

    setArea(area: AreaPlugin<S, K>) {
        this.area = area
    }

    public abstract apply(nodes: ElkNode[]): Promise<void>
}
