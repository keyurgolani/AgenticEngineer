import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
    it('renders correctly', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByRole('button', { name: /click me/i })).toBeDefined()
    })

    it('applies variant classes', () => {
        const { container } = render(<Button variant="destructive">Delete</Button>)
        // Check if the button has destructive class (usually bg-destructive)
        // Adjust based on actual implementation, often 'bg-destructive'
        const button = container.firstChild as HTMLElement
        expect(button.className).toContain('bg-destructive')
    })
    
    it('applies custom className', () => {
        render(<Button className="custom-class">Custom</Button>)
        const button = screen.getByRole('button', { name: /custom/i })
        expect(button.className).toContain('custom-class')
    })
})
