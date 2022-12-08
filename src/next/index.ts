
import ELK, { ElkNode, ElkPort } from 'elkjs'
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


export type BaseSchemes = GetSchemes<NodeScheme, ConnectionScheme>

export class AutoArrangePlugin<Schemes extends BaseSchemes, T = never> extends Scope<never, Area2DInherited<Schemes, T>> {
    elk = new ELK()
    padding: Padding

    constructor(props?: { padding?: Padding }) {
        super('auto-arrange')
        this.padding = props?.padding || {
            top: 40,
            left: 20,
            right: 20,
            bottom: 20
        }
    }

    private getArea() {
        return this.parentScope<AreaPlugin<Schemes, T>>(AreaPlugin)
    }

    private getEditor() {
        return this.getArea().parentScope<NodeEditor<Schemes>>(NodeEditor)
    }

    private extractNodes(parent?: NodeId): ElkNode[] {
        return this.getEditor().getNodes()
            .filter(node => node.parent === parent)
            .map(node => {
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
                    children: this.extractNodes(id),
                    ports: [
                        ...inputs.map(({ key, input }) => (<ElkPort>{
                            id: this.getPortId(id, key, 'input'),
                            width: 15,
                            height: 15,
                            properties: {
                                side: 'WEST',
                                index: input.index || 0
                            }
                        })),
                        ...outputs.map(({ key, output }) => (<ElkPort>{
                            id: this.getPortId(id, key, 'output'),
                            width: 15,
                            height: 15,
                            properties: {
                                side: 'EAST',
                                index: output.index || 0
                            }
                        }))
                    ],
                    properties: {
                        'elk.padding': `[top=${top},left=${left},bottom=${bottom},right=${right}]`,
                        'portAlignment.east': 'BEGIN',
                        'portAlignment.west': 'END',
                        portConstraints: 'FIXED_ORDER'
                    }
                }
            })
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
                if (children) await this.apply(children, { x: offset.x + x, y: offset.y + y })
            }
        }
    }

    private getPortId(id: NodeId, key: string, side: 'input' | 'output') {
        return [id, key, side].join('_')
    }

    async layout() {
        const children = this.extractNodes()
        const connections = this.getEditor().getConnections()
        const edges = connections.map(connection => {
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
        })
        const graph: ElkNode = {
            id: 'root',
            layoutOptions: {
                'elk.algorithm': 'layered',
                'elk.hierarchyHandling': 'INCLUDE_CHILDREN'
            },
            children,
            edges
        }
        const source = JSON.stringify(graph, null, 2)

        const result = await this.elk.layout(graph)

        if (result.children) {
            await this.apply(result.children)
        }

        return {
            source,
            result
        }
    }
}
