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
export type BaseSchemes = GetSchemes<NodeScheme, ConnectionScheme>

export type Padding = {
  top: number,
  left: number,
  right: number,
  bottom: number
}
export type Size = {
  width: number,
  height: number
}
