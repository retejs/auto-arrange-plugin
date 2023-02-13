
import ELK, { ElkNode, ElkPort, LayoutOptions } from 'elkjs'
import { NodeEditor, NodeId, Scope } from 'rete'
import { Area2DInherited, AreaPlugin } from 'rete-area-plugin'

import { Applier, StandardApplier } from './appliers'
import { ExpectedSchemes, Padding } from './types'

export * as ArrangeAppliers from './appliers'
export * from './types'

console.log('arrange')

type PortPosition = (data: {
    side: 'input' | 'output'
    index: number
    height: number
    ports: number
}) => number

type Context<S extends ExpectedSchemes> = {
    nodes: S['Node'][]
    connections: S['Connection'][]
}

export class AutoArrangePlugin<Schemes extends ExpectedSchemes, T = never> extends Scope<never, Area2DInherited<Schemes, T>> {
    elk = new ELK()
    padding: (node: Schemes['Node']) => Padding
    ports: { getPosition: PortPosition }
    demonstration = 'https://rtsys.informatik.uni-kiel.de/elklive/json.html'

    constructor(props?: { padding?: Padding | ((node: Schemes['Node']) => Padding | undefined), ports?: { position?: PortPosition } | { spacing?: number, top?: number, bottom?: number } }) {
        super('auto-arrange')
        const padding = props && 'padding'in props && props.padding
        const defaultPadding = {
            top: 40,
            left: 20,
            right: 20,
            bottom: 20
        }

        if (padding) {
            this.padding = typeof padding === 'function' ? (node) => padding(node) || defaultPadding : () => padding
        } else {
            this.padding = () => defaultPadding
        }
        this.ports = {
            getPosition: props?.ports && 'position' in props.ports && props.ports.position || (data => {
                const { spacing, top, bottom } = props?.ports && 'spacing' in props.ports ? {
                    spacing: typeof props.ports.spacing !== 'undefined' ? props.ports.spacing : 35,
                    top: typeof props.ports.top !== 'undefined' ? props.ports.top : 35,
                    bottom: typeof props.ports.bottom !== 'undefined' ? props.ports.bottom : 15
                } : {
                    spacing: 35,
                    top: 35,
                    bottom: 15
                }

                if (data.side === 'output') {
                    return top + data.index * spacing
                }
                return data.height - bottom - data.ports * spacing + data.index * spacing
            })
        }

    }

    private getArea() {
        return this.parentScope<AreaPlugin<Schemes, T>>(AreaPlugin)
    }

    private getEditor() {
        return this.getArea().parentScope<NodeEditor<Schemes>>(NodeEditor)
    }

    private nodeToLayoutChild(node: Schemes['Node'], context: Context<Schemes>): ElkNode {
        const { id, width, height } = node
        const inputs = node.inputs
            ? Object.entries(node.inputs).map(([key, input]) => ({
                key,
                input
            }))
            : []
        const outputs = node.outputs
            ? Object.entries(node.outputs).map(([key, output]) => ({
                key,
                output
            }))
            : []
        const { top, left, bottom, right } = this.padding(node)

        return <ElkNode>{
            id,
            width,
            height,
            labels: [
                {
                    text: 'label' in node ? node.label : ''
                }
            ],
            ...this.graphToElk(context, id),
            ports: [
                ...inputs
                    .sort((a, b) => (a.input?.index || 0) - (b.input?.index || 0))
                    .map(({ key }, index) => (<ElkPort>{
                        id: this.getPortId(id, key, 'input'),
                        width: 15,
                        height: 15,
                        y: this.ports.getPosition({ side: 'input', index, height, ports: inputs.length }),
                        properties: {
                            side: 'WEST'
                        }
                    })),
                ...outputs
                    .sort((a, b) => (a.output?.index || 0) - (b.output?.index || 0))
                    .map(({ key }, index) => (<ElkPort>{
                        id: this.getPortId(id, key, 'output'),
                        width: 15,
                        height: 15,
                        y: this.ports.getPosition({ side: 'output', index, height, ports: inputs.length }),
                        properties: {
                            side: 'EAST'
                        }
                    }))
            ],
            properties: {
                'elk.padding': `[top=${top},left=${left},bottom=${bottom},right=${right}]`,
                'portAlignment.east': 'BEGIN',
                'portAlignment.west': 'END',
                portConstraints: 'FIXED_POS'
            }
        }
    }

    private connectionToLayoutEdge(connection: Schemes['Connection']) {
        const source = connection.sourceOutput
            ? this.getPortId(connection.source, connection.sourceOutput, 'output')
            : connection.source
        const target = connection.targetInput
            ? this.getPortId(connection.target, connection.targetInput, 'input')
            : connection.target

        return {
            id: connection.id,
            sources: [source],
            targets: [target]
        }
    }

    private graphToElk(context: Context<Schemes>, parent?: NodeId): Pick<ElkNode, 'children' | 'edges'> {
        const nodes = context.nodes.filter(n => n.parent === parent)

        return {
            children: nodes
                .map(n => this.nodeToLayoutChild(n, context)),
            edges: context.connections
                .filter(() => !parent)
                .map(c => this.connectionToLayoutEdge(c))
        }
    }

    private getPortId(id: NodeId, key: string, side: 'input' | 'output') {
        return [id, key, side].join('_')
    }

    // eslint-disable-next-line max-statements, max-len
    async layout(props?: { options?: LayoutOptions, applier?: Applier<Schemes, T> } & Partial<Context<Schemes>>) {
        const nodes = props?.nodes || this.getEditor().getNodes()
        const connections = props?.connections || this.getEditor().getConnections()
        const graph: ElkNode = {
            id: 'root',
            layoutOptions: {
                'elk.algorithm': 'layered',
                'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
                'elk.edgeRouting': 'POLYLINE',
                ...(props?.options || {} as LayoutOptions)
            },
            ...this.graphToElk({ nodes, connections })
        }
        const applier = props?.applier || new StandardApplier()
        const source = JSON.stringify(graph, null, '\t')

        applier.setEditor(this.getEditor())
        applier.setArea(this.getArea())

        try {
            const result = await this.elk.layout(graph)

            if (result.children) {
                await applier.apply(result.children)
            }

            return {
                demonstration: this.demonstration,
                source,
                result
            }
        } catch (error) {
            console.warn('[rete-auto-arrange-plugin]', {
                source,
                demonstration: this.demonstration
            })
            throw error
        }
    }
}
