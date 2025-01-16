import { ElkNode } from 'elkjs';
import { NodeId } from 'rete';
import { ExpectedSchemes } from '../../../types';
import { StandardApplier } from '../standard';
import { AnimationSystem } from './animation';
/**
 * Transition applier props
 */
export type Props = {
    /** Transition duration */
    duration?: number;
    /** Transition timing function. Default is linear */
    timingFunction?: (t: number) => number;
    /** Callback for each tick (frame) of the transition */
    onTick?: (t: number) => void;
    /** Callback specifying whether the node needs to be laid out */
    needsLayout?: (id: NodeId) => boolean;
};
/**
 * Transition applier. Applies the layout to the nodes and their children with transition
 */
export declare class TransitionApplier<S extends ExpectedSchemes, K> extends StandardApplier<S, K> {
    private props?;
    duration: number;
    timingFunction: (t: number) => number;
    animation: AnimationSystem;
    /**
     * @param props Transition applier props
     */
    constructor(props?: Props | undefined);
    protected applyTiming(from: number, to: number, t: number): number;
    protected resizeNode(id: NodeId, width: number, height: number): Promise<boolean>;
    protected translateNode(id: NodeId, x: number, y: number): Promise<boolean>;
    cancel(id: NodeId): void;
    apply(nodes: ElkNode[], offset?: {
        x: number;
        y: number;
    }): Promise<void>;
    destroy(): void;
}
//# sourceMappingURL=index.d.ts.map