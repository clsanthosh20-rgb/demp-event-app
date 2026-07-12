import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@demp/ui';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders with variant classes', () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByText('Outline');
    expect(btn.className).toContain('border');
  });
});
