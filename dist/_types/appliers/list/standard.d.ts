import { ElkNode, ElkShape } from 'elkjs';
import { NodeId } from 'rete';
import { ExpectedSchemes } from '../../types';
import { Applier } from '../applier';
/**
 * Standard applier. Applies the layout to the nodes and their children immediately
 */
export declare class StandardApplier<S extends ExpectedSchemes, K> extends Applier<S, K> {
    protected getValidShapes<Shape extends ElkShape>(shapes: Shape[]): (Shape & Required<ElkShape>)[];
    protected resizeNode(id: NodeId, width: number, height: number): Promise<void | boolean>;
    protected translateNode(id: NodeId, x: number, y: number): Promise<void | boolean>;
    apply(nodes: ElkNode[], offset?: {
        x: number;
        y: number;
    }): Promise<void>;
}
//# sourceMappingURL=standard.d.ts.map