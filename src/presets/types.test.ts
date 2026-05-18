import { Size } from '../types';
import { PortData, Preset } from './types';

describe('PortData', () => {
  it('should have the required properties', () => {
    const mockSize: Size = { width: 100, height: 50 };
    const portData: PortData = {
      y: 10,
      x: 20,
      side: 'NORTH',
      ...mockSize
    };

    expect(portData.y).toBe(10);
    expect(portData.x).toBe(20);
    expect(portData.side).toBe('NORTH');
    expect(portData.width).toBe(100);
    expect(portData.height).toBe(50);
  });

  it('should accept all valid side values', () => {
    const northPort: PortData = { y: 0, x: 0, side: 'NORTH', width: 10, height: 10 };
    const southPort: PortData = { y: 0, x: 0, side: 'SOUTH', width: 10, height: 10 };
    const eastPort: PortData = { y: 0, x: 0, side: 'EAST', width: 10, height: 10 };
    const westPort: PortData = { y: 0, x: 0, side: 'WEST', width: 10, height: 10 };

    expect(northPort.side).toBe('NORTH');
    expect(southPort.side).toBe('SOUTH');
    expect(eastPort.side).toBe('EAST');
    expect(westPort.side).toBe('WEST');
  });

  it('should extend Size interface correctly', () => {
    const portWithSize: PortData = {
      y: 5,
      x: 15,
      side: 'EAST',
      width: 100,
      height: 50
    };

    // Ensure it has Size properties
    expect(portWithSize.width).toBe(100);
    expect(portWithSize.height).toBe(50);
  });
});

describe('Preset', () => {
  it('should accept a string nodeId and return appropriate function', () => {
    const mockSize: Size = { width: 30, height: 20 };

    // Create a mock preset function
    const mockPreset: Preset = (nodeId: string) => {
      return {
        port: (data) => {
          return {
            // Calculate y and x based on other properties since they're not in the input data
            y: data.index * 10,  // Calculate y from index
            x: 0,                // Fixed x value
            side: data.side === 'input' ? 'WEST' : 'EAST',
            width: data.width,
            height: data.height
          };
        }
      };
    };

    // Test the preset function
    const result = mockPreset('test-node-id');
    expect(result).not.toBeNull();

    if (result !== null) {
      const portResult = result.port({
        nodeId: 'test',
        side: 'input',
        key: 'input-1',
        index: 0,
        ports: 1,
        width: 30,
        height: 20
      });

      expect(portResult).toEqual({
        y: 0, // index * 10 = 0 * 10
        x: 0,
        side: 'WEST',
        width: 30,
        height: 20
      });
    }
  });

  it('should allow returning null from preset function', () => {
    const nullPreset: Preset = (nodeId: string) => {
      return null;
    };

    const result = nullPreset('any-id');
    expect(result).toBeNull();
  });

  it('should properly handle the port data structure', () => {
    const mockSize: Size = { width: 30, height: 20 };

    const presetWithPort: Preset = (nodeId: string) => ({
      port: (data) => {
        return {
          y: data.index * 20,  // Calculate y from index
          x: 5,                // Fixed x value
          side: data.side === 'input' ? 'WEST' : 'EAST',
          width: data.width,
          height: data.height
        };
      }
    });

    const presetInstance = presetWithPort('node-1');
    expect(presetInstance).not.toBeNull();

    if (presetInstance !== null) {
      const portInfo = presetInstance.port({
        nodeId: 'node-1',
        side: 'output',
        key: 'output-1',
        index: 2,
        ports: 3,
        width: 25,
        height: 15
      });

      expect(portInfo).toEqual({
        y: 40, // index * 20 = 2 * 20
        x: 5,  // Fixed x value
        side: 'EAST',
        width: 25,
        height: 15
      });
    }
  });

  it('should support optional options function', () => {
    const presetWithOptions: Preset = (nodeId: string) => ({
      port: (data) => {
        return {
          y: 10,  // Fixed y value
          x: 20,  // Fixed x value
          side: 'NORTH',
          width: data.width,
          height: data.height
        };
      },
      options: (id: string) => {
        return {
          id: id,
          label: `Port ${id}`,
          enabled: true
        };
      }
    });

    const presetInstance = presetWithOptions('test-node');
    expect(presetInstance).not.toBeNull();

    if (presetInstance !== null && presetInstance.options) {
      const options = presetInstance.options('port-1');
      expect(options).toEqual({
        id: 'port-1',
        label: 'Port port-1',
        enabled: true
      });
    }
  });
});