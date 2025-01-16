import { ElkNode, LayoutOptions } from 'elkjs';
import { Root, Scope } from 'rete';
import { BaseArea } from 'rete-area-plugin';
import { Applier } from './appliers';
import { Preset } from './presets/types';
import { ExpectedSchemes } from './types';
export type { Preset };
export * as ArrangeAppliers from './appliers';
export * as Presets from './presets';
export * from './types';
type Context<S extends ExpectedSchemes> = {
    nodes: S['Node'][];
    connections: S['Connection'][];
};
/**
 * Auto arrange plugin. Layouts the graph using `elk.js`
 * @priority 10
 */
export declare class AutoArrangePlugin<Schemes extends ExpectedSchemes, T = never> extends Scope<never, [BaseArea<Schemes> | T, Root<Schemes>]> {
    elk: import("elkjs").ELK;
    demonstration: string;
    presets: Preset[];
    constructor();
    /**
     * Adds a preset to the plugin, which will be used to layout the node ports and customize the layout options
     * @param preset Preset to add
     */
    addPreset(preset: Preset): void;
    private findPreset;
    private getArea;
    private getEditor;
    private nodeToLayoutChild;
    private connectionToLayoutEdge;
    private graphToElk;
    private getPortId;
    /**
     * Method to layout the graph
     * @param props Options for the layout
     * @param props.options elk.js options for the layout
     * @param props.applier Layout applier. Responsible for applying node positions to the graph
     * @returns Debug information about the layout
     */
    layout(props?: {
        options?: LayoutOptions;
        applier?: Applier<Schemes, T>;
    } & Partial<Context<Schemes>>): Promise<{
        demonstration: string;
        source: string;
        result: ElkNode;
    }>;
}
//# sourceMappingURL=index.d.ts.map