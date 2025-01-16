import { ElkNode } from 'elkjs';
import { NodeEditor } from 'rete';
import { BaseAreaPlugin } from 'rete-area-plugin';
import { ExpectedSchemes } from '../types';
export declare abstract class Applier<S extends ExpectedSchemes, K> {
    editor: NodeEditor<S>;
    area: BaseAreaPlugin<S, K>;
    setEditor(editor: NodeEditor<S>): void;
    setArea(area: BaseAreaPlugin<S, K>): void;
    abstract apply(nodes: ElkNode[]): Promise<void>;
}
//# sourceMappingURL=applier.d.ts.map