import { NodeEditor, NodeId } from 'rete'
import { BaseAreaPlugin, NodeView } from 'rete-area-plugin'
import { ElkNode, ElkShape } from 'elkjs'
import { ExpectedSchemes } from '../../types'
import { StandardApplier } from './standard'

// Mock the node view interface
interface MockNodeView extends NodeView {
  element: HTMLElement
  position: { x: number; y: number }
  translate: jest.Mock<Promise<boolean>, [number, number]>
  resize: jest.Mock<Promise<boolean>, [number, number]>
  destroy: jest.Mock<void, []>
}

// Mock the area plugin interface
interface MockBaseAreaPlugin extends BaseAreaPlugin<ExpectedSchemes, unknown> {
  nodeViews: Map<NodeId, MockNodeView>
  resize: jest.Mock<Promise<void | boolean>, [NodeId, number, number]>
}

describe('StandardApplier', () => {
  let applier: StandardApplier<ExpectedSchemes, unknown>
  let mockEditor: jest.Mocked<NodeEditor<ExpectedSchemes>>
  let mockArea: MockBaseAreaPlugin

  beforeEach(() => {
    applier = new StandardApplier<ExpectedSchemes, unknown>()
    mockArea = {
      nodeViews: new Map(),
      resize: jest.fn().mockResolvedValue(undefined),
    } as MockBaseAreaPlugin

    mockEditor = {} as jest.Mocked<NodeEditor<ExpectedSchemes>>

    applier.setEditor(mockEditor)
    applier.setArea(mockArea)
  })

  describe('getValidShapes', () => {
    it('should filter out shapes with undefined properties', () => {
      const shapes: ElkShape[] = [
        { id: '1', x: 0, y: 0, width: 100, height: 50 },
        { id: '2', x: undefined, y: 0, width: 100, height: 50 },
        { id: '3', x: 0, y: 0, width: undefined, height: 50 },
        { id: '4', x: 0, y: 0, width: 100, height: 50 },
      ]

      // Use reflection to access the protected method
      const result = (applier as any).getValidShapes(shapes)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('4')
    })

    it('should return all shapes when all properties are defined', () => {
      const shapes: ElkShape[] = [
        { id: '1', x: 0, y: 0, width: 100, height: 50 },
        { id: '2', x: 10, y: 20, width: 200, height: 100 },
      ]

      // Use reflection to access the protected method
      const result = (applier as any).getValidShapes(shapes)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('2')
    })

    it('should return empty array when all shapes have undefined properties', () => {
      const shapes: ElkShape[] = [
        { id: '1', x: undefined, y: 0, width: 100, height: 50 },
        { id: '2', x: 0, y: undefined, width: 100, height: 50 },
      ]

      // Use reflection to access the protected method
      const result = (applier as any).getValidShapes(shapes)

      expect(result).toHaveLength(0)
    })
  })

  describe('resizeNode', () => {
    it('should call area.resize with correct parameters', async () => {
      const nodeId: NodeId = 'node1'
      const width = 100
      const height = 50

      const result = await (applier as any).resizeNode(nodeId, width, height)

      expect(mockArea.resize).toHaveBeenCalledWith(nodeId, width, height)
      expect(result).toBeUndefined()
    })

    it('should handle resize returning a boolean value', async () => {
      const nodeId: NodeId = 'node2'
      const width = 150
      const height = 75

      mockArea.resize.mockResolvedValueOnce(true)

      const result = await (applier as any).resizeNode(nodeId, width, height)

      expect(mockArea.resize).toHaveBeenCalledWith(nodeId, width, height)
      expect(result).toBe(true)
    })
  })

  describe('translateNode', () => {
    it('should call translate on node view when view exists', async () => {
      const nodeId: NodeId = 'node1'
      const x = 10
      const y = 20

      const mockView: MockNodeView = {
        element: {} as HTMLElement,
        position: { x: 0, y: 0 },
        translate: jest.fn().mockResolvedValue(true),
        resize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      } as unknown as MockNodeView

      mockArea.nodeViews.set(nodeId, mockView)

      await (applier as any).translateNode(nodeId, x, y)

      expect(mockView.translate).toHaveBeenCalledWith(x, y)
    })

    it('should not call translate when node view does not exist', async () => {
      const nodeId: NodeId = 'nonexistent'
      const x = 10
      const y = 20

      const mockView: MockNodeView = {
        element: {} as HTMLElement,
        position: { x: 0, y: 0 },
        translate: jest.fn().mockResolvedValue(true),
        resize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      } as unknown as MockNodeView

      // Do not add the view to nodeViews

      await (applier as any).translateNode(nodeId, x, y)

      expect(mockView.translate).not.toHaveBeenCalled()
    })

    it('should handle translation errors gracefully', async () => {
      const nodeId: NodeId = 'node1'
      const x = 10
      const y = 20

      const mockView: MockNodeView = {
        element: {} as HTMLElement,
        position: { x: 0, y: 0 },
        translate: jest.fn().mockRejectedValue(new Error('Translation failed')),
        resize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      } as unknown as MockNodeView

      mockArea.nodeViews.set(nodeId, mockView)

      await expect((applier as any).translateNode(nodeId, x, y)).rejects.toThrow('Translation failed')
    })
  })

  describe('apply', () => {
    it('should apply layout to valid nodes', async () => {
      const nodes: ElkNode[] = [
        { id: 'node1', x: 10, y: 20, width: 100, height: 50 },
        { id: 'node2', x: 30, y: 40, width: 200, height: 100 },
      ]

      // Mock view translation
      const mockView1: MockNodeView = {
        element: {} as HTMLElement,
        position: { x: 0, y: 0 },
        translate: jest.fn().mockResolvedValue(true),
        resize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      } as unknown as MockNodeView
      const mockView2: MockNodeView = {
        element: {} as HTMLElement,
        position: { x: 0, y: 0 },
        translate: jest.fn().mockResolvedValue(true),
        resize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      } as unknown as MockNodeView
      mockArea.nodeViews.set('node1', mockView1)
      mockArea.nodeViews.set('node2', mockView2)

      await applier.apply(nodes)

      // Check that resize was called for both nodes
      expect(mockArea.resize).toHaveBeenCalledWith('node1', 100, 50)
      expect(mockArea.resize).toHaveBeenCalledWith('node2', 200, 100)

      // Check that translation was called for both nodes
      expect(mockView1.translate).toHaveBeenCalledWith(10, 20)
      expect(mockView2.translate).toHaveBeenCalledWith(30, 40)
    })

    it('should skip nodes with undefined properties', async () => {
      const nodes: ElkNode[] = [
        { id: 'node1', x: 10, y: 20, width: 100, height: 50 }, // Valid
        { id: 'node2', x: undefined, y: 40, width: 200, height: 100 }, // Invalid - x is undefined
      ]

      const mockView1: MockNodeView = {
        element: {} as HTMLElement,
        position: { x: 0, y: 0 },
        translate: jest.fn().mockResolvedValue(true),
        resize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      } as unknown as MockNodeView
      mockArea.nodeViews.set('node1', mockView1)

      await applier.apply(nodes)

      // Only valid node should be processed
      expect(mockArea.resize).toHaveBeenCalledTimes(1)
      expect(mockArea.resize).toHaveBeenCalledWith('node1', 100, 50)
      expect(mockView1.translate).toHaveBeenCalledWith(10, 20)
    })

    it('should apply layout with offset', async () => {
      const nodes: ElkNode[] = [
        { id: 'node1', x: 10, y: 20, width: 100, height: 50 },
      ]

      const mockView1: MockNodeView = {
        element: {} as HTMLElement,
        position: { x: 0, y: 0 },
        translate: jest.fn().mockResolvedValue(true),
        resize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      } as unknown as MockNodeView
      mockArea.nodeViews.set('node1', mockView1)

      await applier.apply(nodes, { x: 5, y: 10 })

      // Check that offset was applied to translation
      expect(mockView1.translate).toHaveBeenCalledWith(15, 30) // 10+5, 20+10
    })

    it('should handle nested children nodes', async () => {
      const nodes: ElkNode[] = [
        {
          id: 'node1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          children: [
            { id: 'child1', x: 5, y: 5, width: 50, height: 25 }
          ]
        }
      ]

      const mockView1: MockNodeView = {
        element: {} as HTMLElement,
        position: { x: 0, y: 0 },
        translate: jest.fn().mockResolvedValue(true),
        resize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      } as unknown as MockNodeView
      const mockViewChild1: MockNodeView = {
        element: {} as HTMLElement,
        position: { x: 0, y: 0 },
        translate: jest.fn().mockResolvedValue(true),
        resize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      } as unknown as MockNodeView
      mockArea.nodeViews.set('node1', mockView1)
      mockArea.nodeViews.set('child1', mockViewChild1)

      await applier.apply(nodes)

      // Check that both parent and child nodes are processed
      expect(mockArea.resize).toHaveBeenCalledWith('node1', 100, 50)
      expect(mockArea.resize).toHaveBeenCalledWith('child1', 50, 25)

      // Check that parent is translated at its position
      expect(mockView1.translate).toHaveBeenCalledWith(10, 20)

      // Check that child is translated at its position relative to parent
      expect(mockViewChild1.translate).toHaveBeenCalledWith(15, 25) // 10+5, 20+5
    })

    it('should handle multiple levels of nested children', async () => {
      const nodes: ElkNode[] = [
        {
          id: 'node1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          children: [
            {
              id: 'child1',
              x: 5,
              y: 5,
              width: 50,
              height: 25,
              children: [
                { id: 'grandchild1', x: 2, y: 2, width: 25, height: 12 }
              ]
            }
          ]
        }
      ]

      const mockView1: MockNodeView = {
        element: {} as HTMLElement,
        position: { x: 0, y: 0 },
        translate: jest.fn().mockResolvedValue(true),
        resize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      } as unknown as MockNodeView
      const mockViewChild1: MockNodeView = {
        element: {} as HTMLElement,
        position: { x: 0, y: 0 },
        translate: jest.fn().mockResolvedValue(true),
        resize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      } as unknown as MockNodeView
      const mockViewGrandchild1: MockNodeView = {
        element: {} as HTMLElement,
        position: { x: 0, y: 0 },
        translate: jest.fn().mockResolvedValue(true),
        resize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      } as unknown as MockNodeView
      mockArea.nodeViews.set('node1', mockView1)
      mockArea.nodeViews.set('child1', mockViewChild1)
      mockArea.nodeViews.set('grandchild1', mockViewGrandchild1)

      await applier.apply(nodes)

      // Check that all nodes are processed
      expect(mockArea.resize).toHaveBeenCalledWith('node1', 100, 50)
      expect(mockArea.resize).toHaveBeenCalledWith('child1', 50, 25)
      expect(mockArea.resize).toHaveBeenCalledWith('grandchild1', 25, 12)

      // Check translations
      expect(mockView1.translate).toHaveBeenCalledWith(10, 20)
      expect(mockViewChild1.translate).toHaveBeenCalledWith(15, 25) // 10+5, 20+5
      expect(mockViewGrandchild1.translate).toHaveBeenCalledWith(17, 27) // 10+5+2, 20+5+2
    })

    it('should handle nodes with no children', async () => {
      const nodes: ElkNode[] = [
        { id: 'node1', x: 10, y: 20, width: 100, height: 50 },
      ]

      const mockView1: MockNodeView = {
        element: {} as HTMLElement,
        position: { x: 0, y: 0 },
        translate: jest.fn().mockResolvedValue(true),
        resize: jest.fn().mockResolvedValue(true),
        destroy: jest.fn()
      } as unknown as MockNodeView
      mockArea.nodeViews.set('node1', mockView1)

      await applier.apply(nodes)

      // Should only process the parent node
      expect(mockArea.resize).toHaveBeenCalledWith('node1', 100, 50)
      expect(mockView1.translate).toHaveBeenCalledWith(10, 20)
      expect(mockArea.resize).toHaveBeenCalledTimes(1)
    })

    it('should handle empty nodes array', async () => {
      await applier.apply([])
      expect(mockArea.resize).not.toHaveBeenCalled()
    })

    it('should handle nodes array with only invalid nodes', async () => {
      const nodes: ElkNode[] = [
        { id: 'node1', x: undefined, y: 20, width: 100, height: 50 },
        { id: 'node2', x: 10, y: 20, width: undefined, height: 50 },
      ]

      await applier.apply(nodes)

      // No resize calls since all nodes are invalid
      expect(mockArea.resize).not.toHaveBeenCalled()
    })
  })
})