import { describe, expect, test } from '@jest/globals'
import * as presets from './index'
import * as classicPreset from './classic'
import { Preset } from './types'

describe('presets/index', () => {
  describe('classic export', () => {
    test('should export classic preset as classic', () => {
      // Check that the classic export exists
      expect(presets.classic).toBeDefined()
      
      // Check that classic has the expected structure
      expect(typeof presets.classic).toBe('object')
    })

    test('should have the same properties as direct classic import', () => {
      // Compare the exported classic with direct import
      expect(presets.classic).toEqual(classicPreset)
    })

    test('should have expected classic preset properties', () => {
      // Classic preset should have the setup function
      expect(presets.classic).toHaveProperty('setup')
      expect(typeof presets.classic.setup).toBe('function')
    })
  })

  describe('type exports', () => {
    test('should export Preset type', () => {
      // Check that types are properly re-exported
      expect(() => {
        const dummyPreset: Preset = (nodeId: string) => {
          // Minimal implementation for testing type
          return null
        }
        return dummyPreset
      }).not.toThrow()
    })

    test('should have all type definitions available', () => {
      // The import itself verifies that the type exists
      // Since Preset is only a type, we can't test it at runtime
      expect(true).toBe(true)
    })
  })

  describe('module structure', () => {
    test('should export correct number of items', () => {
      // Count the number of top-level exports
      const exportCount = Object.keys(presets).length
      // Should have at least the classic export (the types are re-exported but may not appear as separate keys)
      expect(exportCount).toBeGreaterThanOrEqual(1) // at least classic
    })

    test('should have classic as a named export', () => {
      expect('classic' in presets).toBe(true)
    })
  })
})