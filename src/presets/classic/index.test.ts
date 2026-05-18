import { setup } from './index'

describe('Classic Preset', () => {
  describe('setup function', () => {
    it('should return a preset function when called without props', () => {
      const preset = setup()
      expect(typeof preset).toBe('function')
    })

    it('should return a preset function when called with props', () => {
      const preset = setup({ spacing: 20, top: 10, bottom: 5 })
      expect(typeof preset).toBe('function')
    })

    it('should use default values when no props are provided', () => {
      const preset = setup()
      const nodePreset = preset('node1')
      
      expect(nodePreset).toBeDefined()
    })
  })

  describe('port positioning', () => {
    it('should position output ports on the right top side of the node with default values', () => {
      const preset = setup()
      const nodePreset = preset('node1')
      
      if (!nodePreset) {
        throw new Error('Preset should not return null')
      }
      
      const portData = nodePreset.port({
        nodeId: 'node1',
        side: 'output',
        key: 'output1',
        index: 0,
        ports: 1,
        width: 200,
        height: 100
      })
      
      expect(portData).toEqual({
        x: 0,
        y: 35, // default top value
        width: 15,
        height: 15,
        side: 'EAST'
      })
    })

    it('should position output ports with different indices correctly', () => {
      const preset = setup()
      const nodePreset = preset('node1')
      
      if (!nodePreset) {
        throw new Error('Preset should not return null')
      }
      
      const portData1 = nodePreset.port({
        nodeId: 'node1',
        side: 'output',
        key: 'output1',
        index: 0,
        ports: 2,
        width: 200,
        height: 100
      })
      
      const portData2 = nodePreset.port({
        nodeId: 'node1',
        side: 'output',
        key: 'output2',
        index: 1,
        ports: 2,
        width: 200,
        height: 100
      })
      
      expect(portData1.y).toBe(35) // 35 + 0 * 35 (first port)
      expect(portData2.y).toBe(70) // 35 + 1 * 35 (second port)
    })

    it('should position input ports on the left bottom side of the node with default values', () => {
      const preset = setup()
      const nodePreset = preset('node1')
      
      if (!nodePreset) {
        throw new Error('Preset should not return null')
      }
      
      const portData = nodePreset.port({
        nodeId: 'node1',
        side: 'input',
        key: 'input1',
        index: 0,
        ports: 1,
        width: 200,
        height: 100
      })
      
      expect(portData).toEqual({
        x: 0,
        y: 50, // height - bottom - ports * spacing + index * spacing = 100 - 15 - 1 * 35 + 0 * 35 = 50
        width: 15,
        height: 15,
        side: 'WEST'
      })
    })

    it('should position input ports with different indices correctly', () => {
      const preset = setup()
      const nodePreset = preset('node1')
      
      if (!nodePreset) {
        throw new Error('Preset should not return null')
      }
      
      const portData1 = nodePreset.port({
        nodeId: 'node1',
        side: 'input',
        key: 'input1',
        index: 0,
        ports: 2,
        width: 200,
        height: 100
      })
      
      const portData2 = nodePreset.port({
        nodeId: 'node1',
        side: 'input',
        key: 'input2',
        index: 1,
        ports: 2,
        width: 200,
        height: 100
      })
      
      expect(portData1.y).toBe(15) // 100 - 15 - 2 * 35 + 0 * 35 = 15
      expect(portData2.y).toBe(50) // 100 - 15 - 2 * 35 + 1 * 35 = 50
    })
  })

  describe('custom props', () => {
    it('should use custom spacing, top, and bottom values', () => {
      const preset = setup({ spacing: 20, top: 10, bottom: 5 })
      const nodePreset = preset('node1')
      
      if (!nodePreset) {
        throw new Error('Preset should not return null')
      }
      
      // Test output port
      const outputPortData = nodePreset.port({
        nodeId: 'node1',
        side: 'output',
        key: 'output1',
        index: 1,
        ports: 2,
        width: 200,
        height: 100
      })
      
      expect(outputPortData.y).toBe(30) // top + index * spacing = 10 + 1 * 20 = 30
      
      // Test input port
      const inputPortData = nodePreset.port({
        nodeId: 'node1',
        side: 'input',
        key: 'input1',
        index: 1,
        ports: 2,
        width: 200,
        height: 100
      })
      
      expect(inputPortData.y).toBe(75) // height - bottom - ports * spacing + index * spacing = 100 - 5 - 2 * 20 + 1 * 20 = 75
    })

    it('should use default spacing when not provided in props', () => {
      const preset = setup({ top: 20, bottom: 10 })
      const nodePreset = preset('node1')
      
      if (!nodePreset) {
        throw new Error('Preset should not return null')
      }
      
      const outputPortData = nodePreset.port({
        nodeId: 'node1',
        side: 'output',
        key: 'output1',
        index: 1,
        ports: 1,
        width: 200,
        height: 100
      })
      
      expect(outputPortData.y).toBe(55) // default top (35) + index * default spacing (35) = 35 + 1 * 35 = 70... wait, let me recalculate
      // top + index * spacing = 20 + 1 * 35 = 55
    })

    it('should use default top when not provided in props', () => {
      const preset = setup({ spacing: 25, bottom: 10 })
      const nodePreset = preset('node1')
      
      if (!nodePreset) {
        throw new Error('Preset should not return null')
      }
      
      const outputPortData = nodePreset.port({
        nodeId: 'node1',
        side: 'output',
        key: 'output1',
        index: 1,
        ports: 1,
        width: 200,
        height: 100
      })
      
      expect(outputPortData.y).toBe(60) // default top (35) + index * spacing = 35 + 1 * 25 = 60
    })

    it('should use default bottom when not provided in props', () => {
      const preset = setup({ spacing: 20, top: 15 })
      const nodePreset = preset('node1')
      
      if (!nodePreset) {
        throw new Error('Preset should not return null')
      }
      
      const inputPortData = nodePreset.port({
        nodeId: 'node1',
        side: 'input',
        key: 'input1',
        index: 1,
        ports: 2,
        width: 200,
        height: 100
      })
      
      expect(inputPortData.y).toBe(65) // height - default bottom (15) - ports * spacing + index * spacing = 100 - 15 - 2 * 20 + 1 * 20 = 65
    })
  })

  describe('port return object structure', () => {
    it('should always return the correct structure for output ports', () => {
      const preset = setup()
      const nodePreset = preset('node1')
      
      if (!nodePreset) {
        throw new Error('Preset should not return null')
      }
      
      const portData = nodePreset.port({
        nodeId: 'node1',
        side: 'output',
        key: 'output1',
        index: 0,
        ports: 1,
        width: 200,
        height: 100
      })
      
      expect(portData).toHaveProperty('x')
      expect(portData).toHaveProperty('y')
      expect(portData).toHaveProperty('width')
      expect(portData).toHaveProperty('height')
      expect(portData).toHaveProperty('side')
      expect(portData.side).toBe('EAST')
      expect(portData.width).toBe(15)
      expect(portData.height).toBe(15)
    })

    it('should always return the correct structure for input ports', () => {
      const preset = setup()
      const nodePreset = preset('node1')
      
      if (!nodePreset) {
        throw new Error('Preset should not return null')
      }
      
      const portData = nodePreset.port({
        nodeId: 'node1',
        side: 'input',
        key: 'input1',
        index: 0,
        ports: 1,
        width: 200,
        height: 100
      })
      
      expect(portData).toHaveProperty('x')
      expect(portData).toHaveProperty('y')
      expect(portData).toHaveProperty('width')
      expect(portData).toHaveProperty('height')
      expect(portData).toHaveProperty('side')
      expect(portData.side).toBe('WEST')
      expect(portData.width).toBe(15)
      expect(portData.height).toBe(15)
    })
  })
})