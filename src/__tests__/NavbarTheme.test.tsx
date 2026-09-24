import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../components/Navbar';

describe('Navbar Theme Toggle & Health Control', () => {
  it('calls onCycleTheme when theme toggle button is clicked', () => {
    const onCycleTheme = vi.fn();

    render(
      <Navbar
        user={null}
        viewMode="grid"
        onSetViewMode={vi.fn()}
        themeMode="system"
        onCycleTheme={onCycleTheme}
        onOpenSearch={vi.fn()}
        onOpenAddLink={vi.fn()}
        onOpenCategories={vi.fn()}
        onOpenBackup={vi.fn()}
        onOpenSystemInfo={vi.fn()}
        isOnline={true}
      />
    );

    const themeBtn = screen.getByRole('button', { name: /Toggle theme mode/i });
    expect(themeBtn).toBeInTheDocument();
    expect(themeBtn).toHaveAttribute('title', expect.stringContaining('System'));

    fireEvent.click(themeBtn);
    expect(onCycleTheme).toHaveBeenCalledTimes(1);
  });

  it('renders health check refresh button when online and triggers onRefreshHealth', () => {
    const onRefreshHealth = vi.fn();

    render(
      <Navbar
        user={null}
        viewMode="grid"
        onSetViewMode={vi.fn()}
        themeMode="dark"
        onCycleTheme={vi.fn()}
        onOpenSearch={vi.fn()}
        onOpenAddLink={vi.fn()}
        onOpenCategories={vi.fn()}
        onOpenBackup={vi.fn()}
        onOpenSystemInfo={vi.fn()}
        isOnline={true}
        onRefreshHealth={onRefreshHealth}
        isCheckingHealth={false}
      />
    );

    const healthBtn = screen.getByRole('button', { name: /Refresh service health checks/i });
    expect(healthBtn).toBeInTheDocument();

    fireEvent.click(healthBtn);
    expect(onRefreshHealth).toHaveBeenCalledTimes(1);
  });
});
