import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IconPicker } from '../components/IconPicker';

describe('IconPicker Component', () => {
  it('renders direct icon URL input with type="text" to allow relative /uploads paths without HTML5 validation error', () => {
    render(
      <IconPicker
        currentIcon="/uploads/favicon-e43d5ba65f57.png"
        currentIconType="favicon"
        onChange={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('https://example.com/logo.png') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.type).toBe('text');
    expect(input.value).toBe('/uploads/favicon-e43d5ba65f57.png');
  });

  it('selects auto favicon when "Use this" button is clicked', () => {
    const handleChange = vi.fn();
    render(
      <IconPicker
        currentIcon=""
        currentIconType="favicon"
        autoFaviconUrl="/uploads/favicon-abc123.png"
        onChange={handleChange}
      />
    );

    expect(screen.getByText('Website Favicon')).toBeDefined();
    const useThisBtn = screen.getByRole('button', { name: /Use this/i });
    fireEvent.click(useThisBtn);

    expect(handleChange).toHaveBeenCalledWith('/uploads/favicon-abc123.png', 'favicon');
  });

  it('shows "Selected" state when auto favicon matches currentIcon', () => {
    render(
      <IconPicker
        currentIcon="/uploads/favicon-abc123.png"
        currentIconType="favicon"
        autoFaviconUrl="/uploads/favicon-abc123.png"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Selected/i })).toBeDefined();
  });

  it('switches tabs when tab buttons are clicked', () => {
    render(
      <IconPicker
        currentIcon="Bookmark"
        currentIconType="lucide"
        onChange={vi.fn()}
      />
    );

    // Click Favicon / URL tab
    const faviconTab = screen.getByRole('button', { name: /Favicon \/ URL/i });
    fireEvent.click(faviconTab);

    expect(screen.getByText('Direct Image / Icon URL')).toBeDefined();
  });

  it('updates tab and customUrl when props change to favicon', () => {
    const { rerender } = render(
      <IconPicker
        currentIcon="Bookmark"
        currentIconType="lucide"
        onChange={vi.fn()}
      />
    );

    // Simulate auto-fetch completing and changing props
    rerender(
      <IconPicker
        currentIcon="/uploads/favicon-e43d5ba65f57.png"
        currentIconType="favicon"
        autoFaviconUrl="/uploads/favicon-e43d5ba65f57.png"
        onChange={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('https://example.com/logo.png') as HTMLInputElement;
    expect(input.value).toBe('/uploads/favicon-e43d5ba65f57.png');
  });
});
