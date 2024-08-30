import { ConnectionBase, GetSchemes, NodeBase, NodeId } from 'rete'

type NodeScheme = NodeBase & {
  width: number
  height: number
  parent?: NodeId
  inputs?: Record<string, undefined | { id: string, index?: number }>
  outputs?: Record<string, undefined | { id: string, index?: number }>
  label?: string
}
type ConnectionScheme = ConnectionBase & {
  targetInput?: string
  sourceOutput?: string
}
export type ExpectedSchemes = GetSchemes<NodeScheme, ConnectionScheme>

export type Size = {
  width: number
  height: number
}
