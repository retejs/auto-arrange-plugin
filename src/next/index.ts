
import ELK, { ElkNode, ElkPort, LayoutOptions } from 'elkjs'
import { ConnectionBase, GetSchemes, NodeBase, NodeEditor, NodeId, Scope } from 'rete'
import { Area2DInherited, AreaPlugin } from 'rete-area-plugin'

import { Padding } from './types'

console.log('arrange')

type NodeScheme = NodeBase & {
  width: number
  height: number
  parent?: NodeId
  inputs?: Record<string, { id: string, index?: number }>
  outputs?: Record<string, { id: string, index?: number }>
  label?: string
}
type ConnectionScheme = ConnectionBase & {
  targetInput?: string
  sourceOutput?: string
}
type PortPosition = (data: {
    side: 'input' | 'output'
    index: number
    height: number
    ports: number
}) => number

export type BaseSchemes = GetSchemes<NodeScheme, ConnectionScheme>
export type ArrangePatch<Schemes extends BaseSchemes> = {
    node: (node: Schemes['Node']) => false | Schemes['Node']
    connection: (node: Schemes['Connection']) => false | Schemes['Connection']
}
type Context<S extends BaseSchemes> = { nodes: S['Node'][], connections: S['Connection'][] }


export class AutoArrangePlugin<Schemes extends BaseSchemes, T = never> extends Scope<never, Area2DInherited<Schemes, T>> {
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
        const { top, left, bottom, right } = this.padding

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

    // eslint-disable-next-line max-statements
    private async apply(nodes: ElkNode[], offset = { x: 0, y: 0 }) {
        const area = this.getArea()
        const editor = this.getEditor()

        for (const node of nodes) {
            const { id, x, y, width, height, children } = node

            if (typeof x === 'undefined' || typeof y === 'undefined') return

            const data = editor.getNode(id)

            if (data && typeof height !== 'undefined' && typeof width !== 'undefined') {
                data.height = height
                data.width = width
                area.renderNode(data)
            }

            const view = area.nodeViews.get(id)

            if (view) {
                await view.translate(offset.x + x, offset.y + y)
            }
            if (children) {
                await this.apply(children, { x: offset.x + x, y: offset.y + y })
            }
        }
    }

    private getPortId(id: NodeId, key: string, side: 'input' | 'output') {
        return [id, key, side].join('_')
    }

    // eslint-disable-next-line max-statements
    async layout(props?: { options?: LayoutOptions } & Partial<Context<Schemes>>) {
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
        const source = JSON.stringify(graph, null, '\t')

        try {
            const result = await this.elk.layout(graph)

            if (result.children) {
                await this.apply(result.children)
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
