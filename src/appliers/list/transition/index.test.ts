import { NodeEditor, NodeId } from 'rete';
import { BaseAreaPlugin, NodeView } from 'rete-area-plugin';
import { ElkNode, ElkShape } from 'elkjs';
import { ExpectedSchemes } from '../../../types';
import { TransitionApplier } from './index';

// Mock the node view as type compatible with NodeView
type MockNodeView = NodeView;

// Mock the area plugin interface
interface MockBaseAreaPlugin extends BaseAreaPlugin<ExpectedSchemes, unknown> {
  nodeViews: Map<NodeId, MockNodeView>;
  resize: jest.Mock<Promise<void | boolean>, [NodeId, number, number]>;
}

// Helper function to create mock node views
function createMockNodeView(
  position: { x: number; y: number } = { x: 0, y: 0 }
): MockNodeView {
  return {
    element: {} as HTMLElement,
    position,
    translate: jest.fn().mockResolvedValue(true),
    resize: jest.fn().mockResolvedValue(true),
    destroy: jest.fn(),
    getZoom: jest.fn(() => 1),
    events: {} as any,
    guards: {} as any,
    dragHandler: {
      destroy: jest.fn()
    } as any,
  } as unknown as MockNodeView;
}

// Mock editor interface
interface MockNodeEditor extends NodeEditor<ExpectedSchemes> {
  getNode: jest.Mock<any, [NodeId]>;
}

describe('TransitionApplier', () => {
  let editor: MockNodeEditor;
  let area: MockBaseAreaPlugin;
  let transitionApplier: TransitionApplier<ExpectedSchemes, unknown>;

  beforeEach(() => {
    editor = {
      getNode: jest.fn()
    } as MockNodeEditor;

    area = {
      nodeViews: new Map(),
      resize: jest.fn().mockResolvedValue(undefined),
    } as MockBaseAreaPlugin;

    // Mock the animation frame functions to avoid running actual animations in tests
    const mockRaf = jest.fn().mockImplementation((callback: FrameRequestCallback): number => {
      // In tests, we don't want to run the animation loop, so we don't call the callback
      // Instead, we return a dummy id
      return 1; // return a dummy id
    });

    const mockCancelRaf = jest.fn((id: number) => {
      // Just mock this function - no need to actually cancel anything in tests
    });

    Object.defineProperty(global, 'requestAnimationFrame', {
      writable: true,
      value: mockRaf,
    });

    Object.defineProperty(global, 'cancelAnimationFrame', {
      writable: true,
      value: mockCancelRaf,
    });

    transitionApplier = new TransitionApplier();

    // Mock the animation system to complete immediately in tests
    jest.spyOn(transitionApplier['animation'], 'add').mockImplementation(async (_duration: number, _id: string, tick: (t: number) => any) => {
      // Execute the tick function with t=1 to complete the animation immediately
      await tick(1);
      return true;
    });

    transitionApplier.setEditor(editor);
    transitionApplier.setArea(area);
  });

  afterEach(() => {
    transitionApplier.destroy();

    // Restore the original requestAnimationFrame and cancelAnimationFrame
    delete (global as any).requestAnimationFrame;
    delete (global as any).cancelAnimationFrame;
  });

  describe('constructor', () => {
    it('should initialize with default values when no props provided', () => {
      const applier = new TransitionApplier();

      expect(applier['duration']).toBe(2000);
      expect(typeof applier['timingFunction']).toBe('function');
      expect(applier['timingFunction'](0.5)).toBe(0.5); // Linear function
    });

    it('should use provided duration', () => {
      const applier = new TransitionApplier({ duration: 1000 });

      expect(applier['duration']).toBe(1000);
    });

    it('should use provided timing function', () => {
      const customTimingFunction = (t: number) => t * t;
      const applier = new TransitionApplier({ timingFunction: customTimingFunction });

      expect(applier['timingFunction']).toBe(customTimingFunction);
      expect(applier['timingFunction'](0.5)).toBe(0.25);
    });
  });

  describe('applyTiming', () => {
    it('should calculate intermediate value based on timing function', () => {
      const applier = new TransitionApplier({ timingFunction: (t: number) => t });

      const result = (applier as any).applyTiming(10, 20, 0.5);
      expect(result).toBe(15); // 10 * (1 - 0.5) + 20 * 0.5 = 5 + 10 = 15
    });

    it('should work with custom timing function', () => {
      const applier = new TransitionApplier({ timingFunction: (t: number) => t * t });

      const result = (applier as any).applyTiming(0, 10, 0.5);
      expect(result).toBe(2.5); // 0 * (1 - 0.25) + 10 * 0.25 = 0 + 2.5 = 2.5
    });
  });

  describe('resizeNode', () => {
    it('should return false if node does not exist', async () => {
      const result = await transitionApplier['resizeNode']('nonexistent', 100, 50);
      expect(result).toBe(false);
    });

    it('should apply animation to resize node', async () => {
      const mockNode = { id: 'node1', width: 50, height: 30 };
      (editor.getNode as jest.Mock).mockReturnValue(mockNode);

      const spy = jest.spyOn(transitionApplier['animation'], 'add').mockResolvedValue(true);

      const result = await transitionApplier['resizeNode']('node1', 100, 50);

      expect(result).toBe(true);
      expect(spy).toHaveBeenCalledWith(
        2000,
        'node1_resize',
        expect.any(Function)
      );
    });

    it('should call onTick if provided', async () => {
      const onTickSpy = jest.fn();
      const applier = new TransitionApplier<ExpectedSchemes, unknown>({ onTick: onTickSpy });
      applier.setEditor(editor);
      applier.setArea(area);

      const mockNode = { id: 'node1', width: 50, height: 30 };
      (editor.getNode as jest.Mock).mockReturnValue(mockNode);

      // Mock the animation add to call the function immediately
      jest.spyOn(applier['animation'], 'add').mockImplementation((_, __, callback) => {
        callback(0.5); // Call with intermediate time
        return Promise.resolve(true);
      });

      await applier['resizeNode']('node1', 100, 50);

      expect(onTickSpy).toHaveBeenCalledWith(0.5);
    });
  });

  describe('translateNode', () => {
    it('should return false if node view does not exist', async () => {
      const result = await transitionApplier['translateNode']('nonexistent', 100, 50);
      expect(result).toBe(false);
    });

    it('should apply animation to translate node', async () => {
      // Set up node view
      const mockView = createMockNodeView({ x: 0, y: 0 });
      area.nodeViews.set('node1', mockView);

      const spy = jest.spyOn(transitionApplier['animation'], 'add').mockResolvedValue(true);

      const result = await transitionApplier['translateNode']('node1', 100, 50);

      expect(result).toBe(true);
      expect(spy).toHaveBeenCalledWith(
        2000,
        'node1_translate',
        expect.any(Function)
      );
    });

    it('should call onTick if provided', async () => {
      const onTickSpy = jest.fn();
      const applier = new TransitionApplier<ExpectedSchemes, unknown>({ onTick: onTickSpy });
      applier.setEditor(editor);
      applier.setArea(area);

      // Set up node view
      const mockView = createMockNodeView({ x: 0, y: 0 });
      area.nodeViews.set('node1', mockView);

      // Mock the animation add to call the function immediately
      jest.spyOn(applier['animation'], 'add').mockImplementation((_, __, callback) => {
        callback(0.5); // Call with intermediate time
        return Promise.resolve(true);
      });

      await applier['translateNode']('node1', 100, 50);

      expect(onTickSpy).toHaveBeenCalledWith(0.5);
    });
  });

  describe('cancel', () => {
    it('should cancel both resize and translate animations for the node', () => {
      const resizeSpy = jest.spyOn(transitionApplier['animation'], 'cancel');
      const translateSpy = jest.spyOn(transitionApplier['animation'], 'cancel');

      transitionApplier.cancel('node1');

      expect(resizeSpy).toHaveBeenCalledWith('node1_resize');
      expect(translateSpy).toHaveBeenCalledWith('node1_translate');
    });
  });

  describe('apply', () => {
    it('should apply layout to nodes with correct offset', async () => {
      const nodes: ElkNode[] = [
        {
          id: 'node1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          children: []
        }
      ];

      // Set up mocks for node and view
      const mockNode = { id: 'node1', width: 50, height: 30 };
      (editor.getNode as jest.Mock).mockReturnValue(mockNode);
      const mockView = createMockNodeView({ x: 0, y: 0 });
      area.nodeViews.set('node1', mockView);

      // Mock the animation system to avoid actual animation
      const resizeSpy = jest.spyOn(transitionApplier as any, 'resizeNode').mockResolvedValue(true);
      const translateSpy = jest.spyOn(transitionApplier as any, 'translateNode').mockResolvedValue(true);

      await transitionApplier.apply(nodes);

      expect(resizeSpy).toHaveBeenCalledWith('node1', 100, 50);
      expect(translateSpy).toHaveBeenCalledWith('node1', 10, 20); // offset 0,0 + position 10,20
    });

    it('should apply layout with custom offset', async () => {
      const nodes: ElkNode[] = [
        {
          id: 'node1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          children: []
        }
      ];

      // Set up mocks for node and view
      const mockNode = { id: 'node1', width: 50, height: 30 };
      (editor.getNode as jest.Mock).mockReturnValue(mockNode);
      const mockView = createMockNodeView({ x: 0, y: 0 });
      area.nodeViews.set('node1', mockView);

      // Mock the animation system to avoid actual animation
      const resizeSpy = jest.spyOn(transitionApplier as any, 'resizeNode').mockResolvedValue(true);
      const translateSpy = jest.spyOn(transitionApplier as any, 'translateNode').mockResolvedValue(true);

      await transitionApplier.apply(nodes, { x: 5, y: 10 });

      expect(resizeSpy).toHaveBeenCalledWith('node1', 100, 50);
      expect(translateSpy).toHaveBeenCalledWith('node1', 15, 30); // offset 5,10 + position 10,20
    });

    it('should process nested children when they exist', async () => {
      const nodes: ElkNode[] = [
        {
          id: 'parent',
          x: 0,
          y: 0,
          width: 200,
          height: 100,
          children: [
            {
              id: 'child',
              x: 10,
              y: 20,
              width: 100,
              height: 50,
              children: []
            }
          ]
        }
      ];

      // Set up mocks for nodes and views
      const mockParentNode = { id: 'parent', width: 100, height: 50 };
      const mockChildNode = { id: 'child', width: 50, height: 25 };
      (editor.getNode as jest.Mock).mockImplementation((id: NodeId) => {
        if (id === 'parent') return mockParentNode;
        if (id === 'child') return mockChildNode;
        return null;
      });

      const mockParentView = createMockNodeView({ x: 0, y: 0 });
      const mockChildView = createMockNodeView({ x: 0, y: 0 });
      area.nodeViews.set('parent', mockParentView);
      area.nodeViews.set('child', mockChildView);

      const resizeSpy = jest.spyOn(transitionApplier as any, 'resizeNode').mockResolvedValue(true);
      const translateSpy = jest.spyOn(transitionApplier as any, 'translateNode').mockResolvedValue(true);

      await transitionApplier.apply(nodes);

      // Check that parent node was processed
      expect(resizeSpy).toHaveBeenCalledWith('parent', 200, 100);
      expect(translateSpy).toHaveBeenCalledWith('parent', 0, 0); // offset 0,0 + parent position 0,0
      // Check that child node was processed with correct offset
      expect(resizeSpy).toHaveBeenCalledWith('child', 100, 50);
      expect(translateSpy).toHaveBeenCalledWith('child', 10, 20); // offset 0,0 + child position 0+10,0+20
    });

    it('should respect needsLayout callback when provided', async () => {
      const nodes: ElkNode[] = [
        {
          id: 'node1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          children: []
        }
      ];

      // Set up mocks for node and view
      const mockNode = { id: 'node1', width: 50, height: 30 };
      (editor.getNode as jest.Mock).mockReturnValue(mockNode);
      const mockView = createMockNodeView({ x: 0, y: 0 });
      area.nodeViews.set('node1', mockView);

      const needsLayoutSpy = jest.fn().mockReturnValue(false);
      const applier = new TransitionApplier<ExpectedSchemes, unknown>({ needsLayout: needsLayoutSpy });
      applier.setEditor(editor);
      applier.setArea(area);

      const resizeSpy = jest.spyOn(applier as any, 'resizeNode').mockResolvedValue(true);
      const translateSpy = jest.spyOn(applier as any, 'translateNode').mockResolvedValue(true);

      await applier.apply(nodes);

      // When needsLayout returns false, it should still process the node because it has no children
      expect(needsLayoutSpy).toHaveBeenCalledWith('node1');
      // The node should still be processed because it has no children
      expect(resizeSpy).toHaveBeenCalledWith('node1', 100, 50);
      expect(translateSpy).toHaveBeenCalledWith('node1', 10, 20);
    });
  });

  describe('destroy', () => {
    it('should stop the animation system', () => {
      const stopSpy = jest.spyOn(transitionApplier['animation'], 'stop');

      transitionApplier.destroy();

      expect(stopSpy).toHaveBeenCalled();
    });
  });
});