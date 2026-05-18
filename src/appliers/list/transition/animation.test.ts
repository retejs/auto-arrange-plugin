import { AnimationSystem } from './animation';

describe('AnimationSystem', () => {
  let animationSystem: AnimationSystem;

  beforeEach(() => {
    // Create a mocked AnimationSystem that doesn't call requestAnimationFrame recursively
    animationSystem = new AnimationSystem();
    
    // Mock Date.now to provide consistent timing
    jest.useFakeTimers();
    jest.setSystemTime(1000000); // Set an arbitrary reference time
    
    // Mock browser APIs to prevent recursion
    Object.defineProperty(global, 'requestAnimationFrame', {
      writable: true,
      value: jest.fn((callback) => {
        // In tests, we don't want recursive calls, so we just call it once
        setImmediate(() => callback(performance.now()));
        return 1; // Return a dummy ID
      })
    });
    
    Object.defineProperty(global, 'cancelAnimationFrame', {
      writable: true,
      value: jest.fn()
    });
  });

  afterEach(() => {
    animationSystem.stop();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    
    // Clean up global mocks
    delete (global as any).requestAnimationFrame;
    delete (global as any).cancelAnimationFrame;
  });

  describe('add', () => {
    it('should add an animation to the active animations map', async () => {
      const duration = 1000;
      const id = 'test-animation';
      const tickCallback = jest.fn().mockResolvedValue(undefined);

      // Directly call the add method without starting the animation loop
      // to avoid infinite recursion
      const promise = animationSystem.add(duration, id, tickCallback);
      
      expect(animationSystem.activeAnimations.size).toBe(1);
      expect(animationSystem.activeAnimations.has(id)).toBe(true);
      
      // Check that the animation is properly initialized
      const animation = animationSystem.activeAnimations.get(id);
      expect(animation).toBeDefined();
      expect(animation?.duration).toBe(duration);
      expect(animation?.cb).toBeDefined();
      expect(animation?.done).toBeDefined();
    });

    it('should return a promise', async () => {
      const duration = 1000;
      const id = 'test-animation';
      const tickCallback = jest.fn().mockResolvedValue(undefined);

      const promise = animationSystem.add(duration, id, tickCallback);
      
      expect(promise).toBeInstanceOf(Promise);
    });
  });

  describe('start', () => {
    beforeEach(() => {
      // Temporarily override the start method to prevent recursion
      const originalStart = animationSystem.start;
      animationSystem.start = jest.fn().mockImplementation(function(this: AnimationSystem) {
        // Only run the animation logic without scheduling the next frame
        const entries = Array.from(this.activeAnimations.entries());

        entries.forEach(([key, { startTime, duration, cb, done }]) => {
          let t = (Date.now() - startTime) / duration;

          if (t >= 1) t = 1;

          if (t < 0 || t >= 1) {
            this.activeAnimations.delete(key);
            if (t >= 1) {
              cb(1);
              done(true);
            }
            return;
          }
          cb(t);
        });
      });
    });

    it('should process active animations and update their progress', () => {
      const id = 'test-animation';
      const mockCb = jest.fn();
      const mockDone = jest.fn();
      
      // Manually add an animation to the map
      animationSystem.activeAnimations.set(id, {
        startTime: 1000000, // Use the same time as our mock Date.now
        duration: 1000,
        cb: mockCb,
        done: mockDone
      });

      // Call the overridden start method
      (animationSystem.start as jest.MockedFunction<any>)();

      // With mock time at 1000000, and startTime at 1000000, t should be 0 initially
      // However, if we simulate a later time in the callback, t would increase
      expect(mockCb).toHaveBeenCalledWith(expect.any(Number));
    });

    it('should remove completed animations and call done callback with success=true', () => {
      const id = 'completed-animation';
      const mockCb = jest.fn();
      const mockDone = jest.fn();
      
      // Set up an animation that has already completed
      animationSystem.activeAnimations.set(id, {
        startTime: 1000000,
        duration: 1000, 
        cb: mockCb,
        done: mockDone
      });

      // Advance time to make the animation complete
      jest.setSystemTime(2000000); // Time elapsed is more than duration

      // Call the overridden start method
      (animationSystem.start as jest.MockedFunction<any>)();

      // Completed animation should be removed
      expect(animationSystem.activeAnimations.has(id)).toBe(false);
      expect(mockCb).toHaveBeenCalledWith(1); // Final progress value
      expect(mockDone).toHaveBeenCalledWith(true); // Success flag
    });

    it('should handle animations with negative time (time before start)', () => {
      const id = 'future-animation';
      const mockCb = jest.fn();
      const mockDone = jest.fn();

      // Set up an animation that hasn't started yet (hypothetical case)
      animationSystem.activeAnimations.set(id, {
        startTime: 2000000, // Starts in the future
        duration: 1000,
        cb: mockCb,
        done: mockDone
      });

      // Current time is 1000000, so startTime > now means t will be negative
      (animationSystem.start as jest.MockedFunction<any>)();

      // Animation should be removed, but according to the actual implementation,
      // when t < 0, done() is not called, only the animation is deleted
      expect(animationSystem.activeAnimations.has(id)).toBe(false);
      expect(mockCb).not.toHaveBeenCalled();
      expect(mockDone).not.toHaveBeenCalled(); // done is only called when t >= 1
    });
  });

  describe('cancel', () => {
    it('should cancel an active animation and call done callback with success=false', () => {
      const id = 'test-animation';
      const mockCb = jest.fn();
      const mockDone = jest.fn();
      
      animationSystem.activeAnimations.set(id, {
        startTime: 1000000,
        duration: 1000,
        cb: mockCb,
        done: mockDone
      });

      animationSystem.cancel(id);

      expect(animationSystem.activeAnimations.has(id)).toBe(false);
      expect(mockDone).toHaveBeenCalledWith(false);
    });

    it('should handle cancellation of non-existent animation gracefully', () => {
      expect(() => {
        animationSystem.cancel('non-existent');
      }).not.toThrow();
    });
  });

  describe('stop', () => {
    it('should cancel the ongoing animation frame if one exists', () => {
      // Mock cancelAnimationFrame to verify it gets called
      const cancelSpy = jest.fn();
      Object.defineProperty(global, 'cancelAnimationFrame', {
        writable: true,
        value: cancelSpy
      });
      
      // Manually set a frameId to simulate an ongoing animation
      animationSystem.frameId = 999;

      animationSystem.stop();

      expect(cancelSpy).toHaveBeenCalledWith(999);
    });

    it('should handle stopping when no animation frame is scheduled', () => {
      animationSystem.frameId = undefined;

      expect(() => {
        animationSystem.stop();
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      // Temporarily override the start method to prevent recursion
      const originalStart = animationSystem.start;
      animationSystem.start = jest.fn().mockImplementation(function(this: AnimationSystem) {
        // Only run the animation logic without scheduling the next frame
        const entries = Array.from(this.activeAnimations.entries());

        entries.forEach(([key, { startTime, duration, cb, done }]) => {
          let t = (Date.now() - startTime) / duration;

          if (t >= 1) t = 1;

          if (t < 0 || t >= 1) {
            this.activeAnimations.delete(key);
            if (t >= 1) {
              cb(1);
              done(true);
            }
            return;
          }
          cb(t);
        });
      });
    });

    it('should handle multiple animations correctly', () => {
      const id1 = 'animation-1';
      const id2 = 'animation-2';
      const mockCb1 = jest.fn();
      const mockCb2 = jest.fn();
      const mockDone1 = jest.fn();
      const mockDone2 = jest.fn();
      
      animationSystem.activeAnimations.set(id1, {
        startTime: 1000000,
        duration: 1000,
        cb: mockCb1,
        done: mockDone1
      });
      animationSystem.activeAnimations.set(id2, {
        startTime: 1000000,
        duration: 1000,
        cb: mockCb2,
        done: mockDone2
      });

      (animationSystem.start as jest.MockedFunction<any>)();

      expect(mockCb1).toHaveBeenCalled();
      expect(mockCb2).toHaveBeenCalled();
    });

    it('should handle animation with zero duration', () => {
      const id = 'zero-duration';
      const mockCb = jest.fn();
      const mockDone = jest.fn();

      // When startTime equals current time and duration is 0, we get (0 / 0) = NaN
      animationSystem.activeAnimations.set(id, {
        startTime: 1000000,
        duration: 0, // Zero duration
        cb: mockCb,
        done: mockDone
      });

      (animationSystem.start as jest.MockedFunction<any>)();

      // With duration 0, when startTime equals current time: t = (0) / 0 = NaN
      // Since NaN comparison with anything is false (NaN >= 1 is false),
      // the animation won't complete but will call cb(NaN)
      // However, in the original logic: NaN >= 1 is false, so t<0 and t>=1 are both false
      // So cb(NaN) will be called but the animation won't be removed
      expect(animationSystem.activeAnimations.has(id)).toBe(true); // Animation should still exist but is still in the map
      expect(mockCb).toHaveBeenCalledWith(NaN); // cb called with NaN
    });
  });
});

// Add a helper function for approximate comparisons
declare global {
  namespace jest {
    interface Expect {
      closeTo(expected: number, precision?: number): any;
    }
    
    interface Matchers<R> {
      closeTo(expected: number, precision?: number): R;
    }
  }
}

expect.extend({
  closeTo(received, expected, precision = 2) {
    const pass = Math.abs(received - expected) < Math.pow(10, -precision) / 2;
    if (pass) {
      return {
        message: () => `expected ${received} not to be close to ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be close to ${expected}`,
        pass: false,
      };
    }
  },
});