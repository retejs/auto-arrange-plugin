import { Size } from '../types'

type NodeSide = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'

export type PortData = {
  y: number
  x: number
  side: NodeSide
} & Size
export type Preset = (nodeId: string) => (null | {
  port(data: {
    nodeId: string
    side: 'input' | 'output'
    key: string
    index: number
    ports: number
  } & Size): PortData
  options?: (id: string) => Record<string, string | number | boolean>
})
