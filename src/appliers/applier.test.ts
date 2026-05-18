import { NodeEditor } from 'rete'
import { BaseAreaPlugin } from 'rete-area-plugin'
import { ElkNode } from 'elkjs'
import { ExpectedSchemes } from '../types'
import { Applier } from './applier'

// Create a concrete implementation of the abstract Applier class for testing
class TestApplier<K> extends Applier<ExpectedSchemes, K> {
  public async apply(nodes: ElkNode[]): Promise<void> {
    // Implementation for testing purposes
    return Promise.resolve()
  }
}

describe('Applier', () => {
  let applier: TestApplier<unknown>
  let mockEditor: jest.Mocked<NodeEditor<ExpectedSchemes>>
  let mockArea: jest.Mocked<BaseAreaPlugin<ExpectedSchemes, unknown>>

  beforeEach(() => {
    applier = new TestApplier<unknown>()
    mockEditor = {
      // Mock NodeEditor methods/properties as needed
    } as jest.Mocked<NodeEditor<ExpectedSchemes>>

    mockArea = {
      // Mock BaseAreaPlugin methods/properties as needed
    } as jest.Mocked<BaseAreaPlugin<ExpectedSchemes, unknown>>
  })

  describe('setEditor', () => {
    it('should set the editor property', () => {
      applier.setEditor(mockEditor)
      expect(applier.editor).toBe(mockEditor)
    })
  })

  describe('setArea', () => {
    it('should set the area property', () => {
      applier.setArea(mockArea)
      expect(applier.area).toBe(mockArea)
    })
  })

  describe('apply', () => {
    it('should be implemented in concrete classes', async () => {
      const nodes: ElkNode[] = []
      const result = await applier.apply(nodes)
      expect(result).toBeUndefined()
    })

    it('should handle an array of ElkNode objects', async () => {
      const nodes: ElkNode[] = [
        { id: 'node1', width: 100, height: 50 },
        { id: 'node2', width: 200, height: 100 }
      ]
      const result = await applier.apply(nodes)
      expect(result).toBeUndefined()
    })
  })

  describe('property initialization', () => {
    it('should initially have undefined editor and area properties', () => {
      const newApplier = new TestApplier<unknown>()
      expect(newApplier.editor).toBeUndefined()
      expect(newApplier.area).toBeUndefined()
    })
  })
})