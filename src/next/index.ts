
import ELK, { ElkNode, ElkPort } from 'elkjs'
import { ConnectionBase, GetSchemes, NodeBase, NodeEditor, NodeId, Scope } from 'rete'
import { Area2DInherited, AreaPlugin } from 'rete-area-plugin'

console.log('arrange')

type NodeScheme = NodeBase & {
  width: number
  height: number
  parent?: NodeId
  inputs?: Record<string, { id: string, index?: number }>
  outputs?: Record<string, { id: string, index?: number }>
}
type ConnectionScheme = ConnectionBase & {
  targetInput?: string
  sourceOutput?: string
}


export type BaseSchemes = GetSchemes<NodeScheme, ConnectionScheme>

export class AutoArrangePlugin<Schemes extends BaseSchemes, T> extends Scope<never, Area2DInherited<Schemes>> {
    elk = new ELK()

    constructor(private props: { editor: NodeEditor<Schemes>, area: AreaPlugin<Schemes, T> }) {
        super('auto-arrange')

    // this.addPipe(context => {
    //     if (context.type === '')
    //     return context
    // })
    }

    private extractNodes(parent?: NodeId): ElkNode[] {
        return this.props.editor.getNodes()
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

                return <ElkNode>{
                    id,
                    width,
                    height,
                    children: this.extractNodes(id),
                    ports: [
                        ...inputs.map(({ key, input }) => (<ElkPort>{
                            id: [id, key, 'in'].join('_'),
                            width: 15,
                            height: 15,
                            properties: {
                                side: 'WEST',
                                index: input.index || 0
                            }
                        })),
                        ...outputs.map(({ key, output }) => (<ElkPort>{
                            id: [id, key, 'out'].join('_'),
                            width: 15,
                            height: 15,
                            properties: {
                                side: 'EAST',
                                index: output.index || 0
                            }
                        }))
                    ],
                    properties: {
                        'portAlignment.east': 'BEGIN',
                        'portAlignment.west': 'END',
                        portConstraints: 'FIXED_ORDER'
                    }
                }
            })
    }

    private apply(nodes: ElkNode[], parent?: ElkNode) {
        nodes.forEach(node => {
            const { id, x, y, width, height, children } = node

            if (typeof x === 'undefined' || typeof y === 'undefined') return

            const data = this.props.editor.getNode(id)

            if (data && typeof height !== 'undefined' && typeof width !== 'undefined') {
                data.height = height
                data.width = width
                this.props.area.renderNode(data)
            }
            if (children) this.apply(children, node)

            const parentPosition = parent
              && typeof parent.x !== 'undefined'
              && typeof parent.y !== 'undefined'
                ? { x: 0, y: 0 }// { x: parent.x, y: parent.y }
                : { x: 0, y: 0 }

            this.props.area.nodeViews.get(id)
                ?.translate(parentPosition.x + x, parentPosition.y + y)
        })
    }

    async layout() {
        const graph: ElkNode = {
            id: 'root',
            layoutOptions: { 'elk.algorithm': 'layered' },
            children: this.extractNodes(),
            edges: this.props.editor.getConnections()
                .map(({ id, source, sourceOutput, target, targetInput }) => {
                    return {
                        id,
                        sources: [[source, sourceOutput, 'out'].join('_')],
                        targets: [[target, targetInput, 'in'].join('_')]
                    }
                })
        }

        console.log(JSON.stringify(graph, null, 4))

        const result = await this.elk.layout(graph)

        if (result.children) {
            this.apply(result.children)
        }
    }
}
