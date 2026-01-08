import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { cn, estimateReadingTime, formatDuration, formatRelativeTime, slugify, truncate } from './utils'

describe('utils', () => {
    describe('cn', () => {
        it('merges tailwind classes correctly', () => {
            expect(cn('p-4', 'p-2')).toBe('p-2')
            expect(cn('text-red-500', null, 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
        })
    })

    describe('estimateReadingTime', () => {
        it('calculates reading time for text', () => {
            const text = 'word '.repeat(200) // 200 words -> 1 min
            expect(estimateReadingTime(text)).toBe(1)
        })

        it('adds time for code blocks', () => {
            const text = 'word '.repeat(200) + '```code```' // 1 min + 0.5 min -> 2 mins (ceil)
            expect(estimateReadingTime(text)).toBe(2)
        })

        it('returns minimum 1 minute', () => {
            expect(estimateReadingTime('hi')).toBe(1)
        })
    })

    describe('formatDuration', () => {
        it('formats seconds', () => {
            expect(formatDuration(45)).toBe('45s')
        })
        it('formats minutes', () => {
            expect(formatDuration(120)).toBe('2m')
        })
        it('formats hours', () => {
            expect(formatDuration(3665)).toBe('1h 1m')
        })
    })

    describe('formatRelativeTime', () => {
        beforeAll(() => {
            vi.useFakeTimers()
            vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
        })

        afterAll(() => {
            vi.useRealTimers()
        })

        it('returns just now for recent times', () => {
            const date = new Date('2024-01-01T11:59:50Z') // 10s ago
            expect(formatRelativeTime(date)).toBe('just now')
        })

        it('returns minutes ago', () => {
            const date = new Date('2024-01-01T11:30:00Z') // 30m ago
            expect(formatRelativeTime(date)).toBe('30m ago')
        })

        it('returns date for old times', () => {
            const date = new Date('2023-01-01T12:00:00Z') // 1 year ago
            // The output format depends on locale, which might flap in CI environments.
            // checking if it contains 2023 at least.
           expect(formatRelativeTime(date)).toMatch(/2023/)
        })
    })

    describe('slugify', () => {
        it('slugifies text', () => {
            expect(slugify('Hello World')).toBe('hello-world')
            expect(slugify('Foo  Bar')).toBe('foo-bar')
            expect(slugify('Test@#$String')).toBe('teststring')
        })
    })

    describe('truncate', () => {
        it('truncates text', () => {
            expect(truncate('hello world', 5)).toBe('hello...')
        })
        it('does not truncate short text', () => {
            expect(truncate('hi', 5)).toBe('hi')
        })
    })
})
