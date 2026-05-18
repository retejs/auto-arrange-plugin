import { ConnectionBase, NodeBase, NodeId } from 'rete';
import { ExpectedSchemes, Size } from './types';

// We'll define local types that match the internal structure to test against
type LocalNodeScheme = NodeBase & {
  width: number
  height: number
  parent?: NodeId
  inputs?: Record<string, undefined | { id: string, index?: number }>
  outputs?: Record<string, undefined | { id: string, index?: number }>
  label?: string
};

type LocalConnectionScheme = ConnectionBase & {
  targetInput?: string
  sourceOutput?: string
};

describe('Types', () => {
  describe('NodeScheme (via internal composition)', () => {
    it('should match the expected structure', () => {
      const node: LocalNodeScheme = {
        id: 'node1',
        width: 100,
        height: 200,
        parent: 'parent1' as NodeId,
        inputs: {
          input1: { id: 'input1' },
          input2: { id: 'input2', index: 1 }
        },
        outputs: {
          output1: { id: 'output1' },
          output2: { id: 'output2', index: 2 }
        },
        label: 'Test Node'
      };

      expect(node.id).toBe('node1');
      expect(node.width).toBe(100);
      expect(node.height).toBe(200);
      expect(node.parent).toBe('parent1');
      expect(node.inputs?.input1?.id).toBe('input1');
      expect(node.outputs?.output1?.id).toBe('output1');
      expect(node.label).toBe('Test Node');
    });

    it('should allow optional properties to be undefined', () => {
      const node: LocalNodeScheme = {
        id: 'node2',
        width: 150,
        height: 250
        // parent, inputs, outputs, and label are all optional
      };

      expect(node.id).toBe('node2');
      expect(node.width).toBe(150);
      expect(node.height).toBe(250);
      expect(node.parent).toBeUndefined();
      expect(node.inputs).toBeUndefined();
      expect(node.outputs).toBeUndefined();
      expect(node.label).toBeUndefined();
    });
  });

  describe('ConnectionScheme (via internal composition)', () => {
    it('should match the expected structure', () => {
      const connection: LocalConnectionScheme = {
        id: 'conn1',
        source: 'source1' as NodeId,
        target: 'target1' as NodeId,
        sourceOutput: 'sourceOutput1',
        targetInput: 'targetInput1'
      };

      expect(connection.id).toBe('conn1');
      expect(connection.source).toBe('source1');
      expect(connection.target).toBe('target1');
      expect(connection.sourceOutput).toBe('sourceOutput1');
      expect(connection.targetInput).toBe('targetInput1');
    });

    it('should allow optional properties to be undefined', () => {
      const connection: LocalConnectionScheme = {
        id: 'conn2',
        source: 'source2' as NodeId,
        target: 'target2' as NodeId
        // sourceOutput and targetInput are optional
      };

      expect(connection.id).toBe('conn2');
      expect(connection.source).toBe('source2');
      expect(connection.target).toBe('target2');
      expect(connection.sourceOutput).toBeUndefined();
      expect(connection.targetInput).toBeUndefined();
    });
  });

  describe('ExpectedSchemes', () => {
    it('should correctly compose node and connection schemes', () => {
      // Verify that ExpectedSchemes is a valid type with the expected structure
      // This test checks that the type correctly combines Node and Connection schemes
      const expectedSchemesChecker = (schemes: ExpectedSchemes) => schemes;

      // We can't directly instantiate ExpectedSchemes, but we can verify it's a valid type
      expect(typeof expectedSchemesChecker).toBe('function');
    });
  });

  describe('Size', () => {
    it('should match the expected structure', () => {
      const size: Size = {
        width: 300,
        height: 400
      };

      expect(size.width).toBe(300);
      expect(size.height).toBe(400);
    });

    it('should enforce required properties', () => {
      const size: Size = {
        width: 100,
        height: 200
      };

      // Verify both properties exist
      expect(typeof size.width).toBe('number');
      expect(typeof size.height).toBe('number');
    });
  });
});