import { describe, it, expect } from 'vitest'
import { slugify } from '../utils'

describe('slugify()', () => {
  describe('Cyrillic transliteration', () => {
    it('transliterates basic Russian', () => {
      expect(slugify('Привет мир')).toBe('privet-mir')
    })

    it('transliterates Ukrainian-specific letters', () => {
      // К=k, и=i, ї=yi, в=v → 'kiyiv'
      expect(slugify('Київ')).toBe('kiyiv')
      expect(slugify('їжак')).toBe('yizhak')
      expect(slugify('єдність')).toBe('yednist')
    })

    it('handles ш, щ, ж, ч, ц, х multi-char mappings', () => {
      expect(slugify('Шашлык')).toBe('shashlyk')
      expect(slugify('Щедрость')).toBe('shchedrost')
      expect(slugify('Живот')).toBe('zhivot')
      expect(slugify('Человек')).toBe('chelovek')
      expect(slugify('Цирк')).toBe('tsirk')
      expect(slugify('Хлеб')).toBe('khleb')
    })

    it('drops hard/soft signs', () => {
      expect(slugify('объект')).toBe('obekt')
      expect(slugify('мальчик')).toBe('malchik')
    })
  })

  describe('Latin passthrough and normalization', () => {
    it('passes Latin unchanged', () => {
      expect(slugify('My Company')).toBe('my-company')
    })

    it('lowercases everything', () => {
      expect(slugify('SMENGO')).toBe('smengo')
    })

    it('replaces special chars and spaces with hyphens', () => {
      expect(slugify('Hello   World!!')).toBe('hello-world')
    })

    it('strips leading and trailing hyphens', () => {
      expect(slugify('--hello--')).toBe('hello')
    })

    it('collapses multiple separators into one hyphen', () => {
      expect(slugify('hello   ---   world')).toBe('hello-world')
    })
  })

  describe('edge cases', () => {
    it('truncates to 40 characters', () => {
      const long = 'abcdefghijklmnopqrstuvwxyz1234567890abcdefghij'
      expect(slugify(long).length).toBeLessThanOrEqual(40)
    })

    it('handles mixed Cyrillic + Latin', () => {
      const result = slugify('Компания Alpha')
      expect(result).toBe('kompaniya-alpha')
    })

    it('handles numbers', () => {
      expect(slugify('Team 42')).toBe('team-42')
    })
  })
})
