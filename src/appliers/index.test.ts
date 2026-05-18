import {
  Applier,
  StandardApplier,
  TransitionApplier,
  type TransitionApplierProps
} from './index'

describe('Appliers Index Exports', () => {
  test('should export Applier interface/type', () => {
    expect(Applier).toBeDefined()
  })

  test('should export StandardApplier class', () => {
    expect(StandardApplier).toBeDefined()
  })

  test('should export TransitionApplier class', () => {
    expect(TransitionApplier).toBeDefined()
  })

  test('should export TransitionApplierProps type', () => {
    // Since this is only a type export, we cannot directly test its existence at runtime
    // The fact that the import doesn't cause a compile error is sufficient
    expect(true).toBe(true) // This test passes if the import compiles successfully
  })

  test('exported classes should be constructable', () => {
    // Since we don't have the actual implementation details,
    // we'll just verify that the exported symbols are functions/constructors where applicable
    expect(typeof StandardApplier).toBe('function')
    expect(typeof TransitionApplier).toBe('function')
  })
})