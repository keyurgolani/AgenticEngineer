import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CodeBlock } from './CodeBlock'

// Mock clipboard
const writeText = vi.fn()
Object.assign(navigator, {
    clipboard: {
        writeText,
    },
})

describe('CodeBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders code content and language header', () => {
        // The component extracts language from children's data-language prop
        const codeChild = <pre data-language="python">print(&apos;Hello&apos;)</pre>
        render(<CodeBlock raw="print('Hello')">{codeChild}</CodeBlock>);
        
        expect(screen.getByText('python')).toBeDefined()
        expect(screen.getByText("print('Hello')")).toBeDefined()
    })

    it('toggles word wrap', () => {
        const children = <pre>some long code</pre>
        // Start unwrapped
        render(<CodeBlock raw="">{children}</CodeBlock>)
        
        // Find wrap toggle button. It usually has title "Enable Word Wrap" or "Disable Word Wrap"
        const toggleBtn = screen.getByTitle('Enable Word Wrap')
        fireEvent.click(toggleBtn)
        
        // Now it should be wrapped. The boolean state `isWrapped` is true.
        // The implementation adds `isWrapped && "whitespace-pre-wrap break-words"` to the container div.
        // We can check the class on the scrolling container (the second div inside the root).
        // Let's inspect the structure roughly.
        // Root -> Header -> Content Div
        // When wrapped, it might still have overflow-x-auto or change?
        // Code: className={cn("overflow-x-auto p-4", isWrapped && "whitespace-pre-wrap break-words", ...)}
        // So checking for break-words class is good.
        // Note: The selector might need to be looser if classes change.
        
        // Re-query or check
        expect(screen.getByText('some long code').parentElement?.className).toContain('break-words')
    })
})
