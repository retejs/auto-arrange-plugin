import ELK, { ElkNode, ElkPort, LayoutOptions } from 'elkjs'
import { NodeEditor, NodeId, Scope } from 'rete'
import { Area2DInherited, AreaPlugin } from 'rete-area-plugin'

import { Applier, StandardApplier } from './appliers'
import { Preset } from './presets/types'
import { ExpectedSchemes } from './types'

export * as ArrangeAppliers from './appliers'
export * as Presets from './presets'
export * from './types'

type Context<S extends ExpectedSchemes> = {
  nodes: S['Node'][]
  connections: S['Connection'][]
}

export class AutoArrangePlugin<Schemes extends ExpectedSchemes, T = never> extends Scope<never, Area2DInherited<Schemes, T>> {
  elk = new ELK()
  demonstration = 'https://rtsys.informatik.uni-kiel.de/elklive/json.html'
  presets: Preset[] = []

  constructor() {
    super('auto-arrange')
  }

  public addPreset(preset: Preset) {
    this.presets.push(preset)
  }

  private findPreset(nodeId: string) {
    for (const presetFactory of this.presets) {
      const result = presetFactory(nodeId)

      if (result) return result
    }
    throw new Error('cannot find preset for node with id = ' + nodeId)
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
    const preset = this.findPreset(id)

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
          .map(({ key }, index) => {
            const { side, width: portWidth, height: portHeight, x, y } = preset.port({
              nodeId: id,
              key,
              side: 'input',
              width,
              height,
              index,
              ports: inputs.length
            })

            return <ElkPort>{
              id: this.getPortId(id, key, 'input'),
              width: portWidth,
              height: portHeight,
              x,
              y,
              properties: {
                side
              }
            }
          }),
        ...outputs
          .sort((a, b) => (a.output?.index || 0) - (b.output?.index || 0))
          .map(({ key }, index) => {
            const { side, width: portWidth, height: portHeight, x, y } = preset.port({
              nodeId: id,
              side: 'output',
              key,
              index,
              width,
              height,
              ports: outputs.length
            })

            return <ElkPort>{
              id: this.getPortId(id, key, 'output'),
              width: portWidth,
              height: portHeight,
              x,
              y,
              properties: {
                side
              }
            }
          })
      ],
      properties: {
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
        /* eslint-disable @typescript-eslint/naming-convention */
        'elk.algorithm': 'layered',
        'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
        'elk.edgeRouting': 'POLYLINE',
        ...(props?.options || {} as LayoutOptions)
        /* eslint-enable @typescript-eslint/naming-convention */
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
      // eslint-disable-next-line no-console
      console.warn('[rete-auto-arrange-plugin]', {
        source,
        demonstration: this.demonstration
      })
      throw error
    }
  }
}
