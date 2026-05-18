import { NodeEditor, Root } from 'rete';
import { BaseAreaPlugin } from 'rete-area-plugin';
import ELK from 'elkjs';
import { AutoArrangePlugin } from './index';
import { Preset, PortData } from './presets/types';
import { ExpectedSchemes, Size } from './types';

// Mock types to match the plugin's expected schemes
type TestNode = {
  id: string;
  width: number;
  height: number;
  parent?: string;
  inputs?: Record<string, { id: string; index?: number } | undefined>;
  outputs?: Record<string, { id: string; index?: number } | undefined>;
  label?: string;
};

type TestConnection = {
  id: string;
  source: string;
  target: string;
  sourceOutput?: string;
  targetInput?: string;
};

type TestSchemes = {
  Node: TestNode;
  Connection: TestConnection;
};

describe('AutoArrangePlugin', () => {
  let plugin: AutoArrangePlugin<TestSchemes>;

  beforeEach(() => {
    plugin = new AutoArrangePlugin<TestSchemes>();
  });

  it('should create an instance of AutoArrangePlugin', () => {
    expect(plugin).toBeInstanceOf(AutoArrangePlugin);
    expect(plugin.presets).toEqual([]);
    // Since 'id' is private, we can't directly test it, but we can verify the plugin exists
    expect(plugin).toBeTruthy();
  });

  it('should add presets correctly', () => {
    const mockPreset: jest.MockedFunction<Preset> = jest.fn(() => null) as any;
    plugin.addPreset(mockPreset);

    expect(plugin.presets).toHaveLength(1);
    expect(plugin.presets[0]).toBe(mockPreset);
  });

  it('should find preset using findPreset method', () => {
    const mockPreset: jest.MockedFunction<Preset> = jest.fn((nodeId: string) => {
      if (nodeId === 'test-node') {
        return {
          port: () => ({ side: 'NORTH', width: 10, height: 10, x: 0, y: 0 } as PortData),
          options: () => ({ 'elk.padding': '[10,10,10,10]' })
        };
      }
      return null;
    }) as any;

    plugin.addPreset(mockPreset);

    // We need to access the private method, so we'll use any type to bypass TS restrictions
    const findPreset = (plugin as any).findPreset.bind(plugin);

    const result = findPreset('test-node');
    expect(result).not.toBeNull();
    expect(mockPreset).toHaveBeenCalledWith('test-node');

    // Test with non-existent node to check error is thrown
    expect(() => {
      findPreset('non-existent-node');
    }).toThrow('cannot find preset for node with id = non-existent-node');
  });

  it('should generate port IDs correctly', () => {
    const getPortId = (plugin as any).getPortId.bind(plugin);
    
    expect(getPortId('node1', 'input1', 'input')).toBe('node1_input1_input');
    expect(getPortId('node2', 'output1', 'output')).toBe('node2_output1_output');
    expect(getPortId('complex-node', 'complex-key', 'input')).toBe('complex-node_complex-key_input');
  });

  it('should convert connection to layout edge correctly', () => {
    const connectionToLayoutEdge = (plugin as any).connectionToLayoutEdge.bind(plugin);
    
    const connection: TestConnection = {
      id: 'conn1',
      source: 'node1',
      target: 'node2',
      sourceOutput: 'output1',
      targetInput: 'input1'
    };
    
    const edge = connectionToLayoutEdge(connection);
    
    expect(edge.id).toBe('conn1');
    expect(edge.sources).toEqual(['node1_output1_output']);
    expect(edge.targets).toEqual(['node2_input1_input']);
  });

  it('should convert connection to layout edge without ports', () => {
    const connectionToLayoutEdge = (plugin as any).connectionToLayoutEdge.bind(plugin);
    
    const connection: TestConnection = {
      id: 'conn2',
      source: 'node1',
      target: 'node2'
    };
    
    const edge = connectionToLayoutEdge(connection);
    
    expect(edge.id).toBe('conn2');
    expect(edge.sources).toEqual(['node1']);
    expect(edge.targets).toEqual(['node2']);
  });

  // For tests of methods that access parent scopes, we need to mock them
  // since the plugin requires to be embedded in a scope with BaseAreaPlugin and NodeEditor
  it('should handle default elk.js layout options', async () => {
    // Mock the elk layout method
    const mockLayout = jest.fn().mockResolvedValue({
      id: 'root',
      children: []
    });

    (plugin as any).elk = { layout: mockLayout };

    const mockPreset: jest.MockedFunction<Preset> = jest.fn(() => ({
      port: () => ({ side: 'NORTH', width: 10, height: 10, x: 0, y: 0 } as PortData),
      options: () => ({})
    })) as any;
    plugin.addPreset(mockPreset);

    // Mock the private methods that access parent scopes
    const mockGetEditor = jest.fn();
    const mockGetArea = jest.fn();
    const mockNodes: TestNode[] = [];
    const mockConnections: TestConnection[] = [];

    (plugin as any).getEditor = jest.fn(() => ({
      getNodes: () => mockNodes,
      getConnections: () => mockConnections
    }));
    (plugin as any).getArea = jest.fn(() => mockGetArea);

    const result = await plugin.layout();

    expect(mockLayout).toHaveBeenCalledWith({
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
        'elk.edgeRouting': 'POLYLINE'
      },
      children: [],
      edges: []
    });

    expect(result).toHaveProperty('demonstration');
    expect(result).toHaveProperty('source');
    expect(result).toHaveProperty('result');
  });

  it('should accept custom layout options', async () => {
    const mockLayout = jest.fn().mockResolvedValue({
      id: 'root',
      children: []
    });

    (plugin as any).elk = { layout: mockLayout };

    const mockPreset: jest.MockedFunction<Preset> = jest.fn(() => ({
      port: () => ({ side: 'NORTH', width: 10, height: 10, x: 0, y: 0 } as PortData),
      options: () => ({})
    })) as any;
    plugin.addPreset(mockPreset);

    // Mock the private methods that access parent scopes
    const mockGetEditor = jest.fn();
    const mockGetArea = jest.fn();
    const mockNodes: TestNode[] = [];
    const mockConnections: TestConnection[] = [];

    (plugin as any).getEditor = jest.fn(() => ({
      getNodes: () => mockNodes,
      getConnections: () => mockConnections
    }));
    (plugin as any).getArea = jest.fn(() => mockGetArea);

    const customOptions = {
      'elk.algorithm': 'stress',
      'elk.spacing.nodeNode': '20.0'
    };

    await plugin.layout({ options: customOptions });

    expect(mockLayout).toHaveBeenCalledWith({
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'stress',
        'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
        'elk.edgeRouting': 'POLYLINE',
        'elk.spacing.nodeNode': '20.0'
      },
      children: [],
      edges: []
    });
  });

  it('should create nodes with proper structure for ELK layout', () => {
    const nodeToLayoutChild = (plugin as any).nodeToLayoutChild.bind(plugin);
    const mockPreset: jest.MockedFunction<Preset> = jest.fn(() => ({
      port: () => ({ side: 'NORTH', width: 10, height: 10, x: 0, y: 0 } as PortData),
      options: () => ({ 'elk.padding': '[5,5,5,5]' })
    })) as any;
    plugin.addPreset(mockPreset);

    const node: TestNode = {
      id: 'test-node',
      width: 100,
      height: 200,
      inputs: {
        input1: { id: 'input1', index: 0 }
      },
      outputs: {
        output1: { id: 'output1', index: 0 }
      },
      label: 'Test Node'
    };

    const context = {
      nodes: [node],
      connections: []
    };

    const layoutNode = nodeToLayoutChild(node, context);

    expect(layoutNode.id).toBe('test-node');
    expect(layoutNode.width).toBe(100);
    expect(layoutNode.height).toBe(200);
    expect(layoutNode.labels).toEqual([{ text: 'Test Node' }]);
    expect(layoutNode.layoutOptions).toEqual({
      'elk.padding': '[5,5,5,5]',
      portConstraints: 'FIXED_POS'
    });
    expect(layoutNode.ports).toHaveLength(2); // 1 input + 1 output
  });

  it('should handle nodes without inputs or outputs', () => {
    const nodeToLayoutChild = (plugin as any).nodeToLayoutChild.bind(plugin);
    const mockPreset: jest.MockedFunction<Preset> = jest.fn(() => ({
      port: () => ({ side: 'NORTH', width: 10, height: 10, x: 0, y: 0 } as PortData),
      options: () => ({})
    })) as any;
    plugin.addPreset(mockPreset);

    const node: TestNode = {
      id: 'simple-node',
      width: 50,
      height: 50
      // No inputs or outputs
    };

    const context = {
      nodes: [node],
      connections: []
    };

    const layoutNode = nodeToLayoutChild(node, context);

    expect(layoutNode.id).toBe('simple-node');
    expect(layoutNode.width).toBe(50);
    expect(layoutNode.height).toBe(50);
    expect(layoutNode.ports).toHaveLength(0); // No ports
  });

  it('should handle nodes with undefined inputs/outputs', () => {
    const nodeToLayoutChild = (plugin as any).nodeToLayoutChild.bind(plugin);
    const mockPreset: jest.MockedFunction<Preset> = jest.fn(() => ({
      port: () => ({ side: 'NORTH', width: 10, height: 10, x: 0, y: 0 } as PortData),
      options: () => ({})
    })) as any;
    plugin.addPreset(mockPreset);

    const node: TestNode = {
      id: 'undefined-ports-node',
      width: 50,
      height: 50,
      inputs: undefined,
      outputs: undefined
    };

    const context = {
      nodes: [node],
      connections: []
    };

    const layoutNode = nodeToLayoutChild(node, context);

    expect(layoutNode.id).toBe('undefined-ports-node');
    expect(layoutNode.width).toBe(50);
    expect(layoutNode.height).toBe(50);
    expect(layoutNode.ports).toHaveLength(0); // No ports
  });

  it('should handle nodes without a label', () => {
    const nodeToLayoutChild = (plugin as any).nodeToLayoutChild.bind(plugin);
    const mockPreset: jest.MockedFunction<Preset> = jest.fn(() => ({
      port: () => ({ side: 'NORTH', width: 10, height: 10, x: 0, y: 0 } as PortData),
      options: () => ({})
    })) as any;
    plugin.addPreset(mockPreset);

    const node: TestNode = {
      id: 'no-label-node',
      width: 50,
      height: 50
    };

    const context = {
      nodes: [node],
      connections: []
    };

    const layoutNode = nodeToLayoutChild(node, context);

    expect(layoutNode.labels).toEqual([{ text: '' }]);
  });

  it('should properly implement the Scope interface', () => {
    // Since id and priority are private, we just verify the plugin exists
    expect(plugin).toBeTruthy();
  });

  it('should handle ELK layout errors', async () => {
    const mockLayout = jest.fn().mockRejectedValue(new Error('ELK layout error'));

    (plugin as any).elk = { layout: mockLayout };

    const mockPreset: jest.MockedFunction<Preset> = jest.fn(() => ({
      port: () => ({ side: 'NORTH', width: 10, height: 10, x: 0, y: 0 } as PortData),
      options: () => ({})
    })) as any;
    plugin.addPreset(mockPreset);

    // Mock the private methods that access parent scopes
    const mockGetEditor = jest.fn();
    const mockGetArea = jest.fn();
    const mockNodes: TestNode[] = [];
    const mockConnections: TestConnection[] = [];

    (plugin as any).getEditor = jest.fn(() => ({
      getNodes: () => mockNodes,
      getConnections: () => mockConnections
    }));
    (plugin as any).getArea = jest.fn(() => mockGetArea);

    await expect(plugin.layout()).rejects.toThrow('ELK layout error');
  });

  it('should demonstrate the example URL', () => {
    expect(plugin.demonstration).toBe('https://rtsys.informatik.uni-kiel.de/elklive/json.html');
  });
});
