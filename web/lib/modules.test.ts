import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllModules, getModulesByWeek, getModuleData, moduleExists } from './modules'
import fs from 'fs'

// Mock fs
vi.mock('fs', () => {
    return {
        default: {
            readdirSync: vi.fn(),
            readFileSync: vi.fn(),
            existsSync: vi.fn(),
        },
        readdirSync: vi.fn(),
        readFileSync: vi.fn(),
        existsSync: vi.fn(),
    }
})

// Mock utils
vi.mock('./utils', () => ({
    estimateReadingTime: vi.fn(() => 5),
}))

describe('modules', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        // Default mock implementation for fs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(fs.readdirSync).mockReturnValue(['day-01-intro.mdx', 'day-02-advanced.mdx', 'ignored.txt'] as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
            if (path.toString().includes('day-01-intro.mdx')) {
                return `---
title: Intro
description: Day 1 Intro
week: 1
---
# Content 1`
            }
            if (path.toString().includes('day-02-advanced.mdx')) {
                return `---
title: Advanced
description: Day 2 Advanced
week: 1
---
# Content 2`
            }
            return ''
        })
        vi.mocked(fs.existsSync).mockReturnValue(true)
    })

    describe('getAllModules', () => {
        it('returns filtered and sorted modules', () => {
            const modules = getAllModules()
            expect(modules).toHaveLength(2)
            expect(modules[0].slug).toBe('day-01-intro')
            expect(modules[0].day).toBe(1)
            expect(modules[1].slug).toBe('day-02-advanced')
            expect(modules[1].day).toBe(2)
        })

        it('parses frontmatter correctly', () => {
             const modules = getAllModules()
             expect(modules[0].title).toBe('Intro')
             expect(modules[0].readingTime).toBe(5)
        })
    })

    describe('getModulesByWeek', () => {
        it('groups modules by week', () => {
            const byWeek = getModulesByWeek()
            expect(byWeek[1]).toHaveLength(2)
        })
    })

    describe('moduleExists', () => {
        it('checks file existence', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true)
            expect(moduleExists('foo')).toBe(true)
            
            vi.mocked(fs.existsSync).mockReturnValue(false)
            expect(moduleExists('bar')).toBe(false)
        })
    })

    describe('getModuleData', () => {
        it('returns module data if exists', () => {
            const data = getModuleData('day-01-intro')
            expect(data).not.toBeNull()
            expect(data?.frontmatter.title).toBe('Intro')
        })

        it('returns null if not exists', () => {
            vi.mocked(fs.existsSync).mockReturnValue(false)
            expect(getModuleData('missing')).toBeNull()
        })
    })
})
