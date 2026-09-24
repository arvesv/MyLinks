import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HealthBadge } from '../components/HealthBadge';

describe('HealthBadge Component', () => {
  it('renders nothing when health is undefined and not pinging', () => {
    const { container } = render(<HealthBadge />);
    expect(container.firstChild).toBeNull();
  });

  it('renders online status with latency when showText is true', () => {
    render(
      <HealthBadge
        health={{
          url: 'https://homeassistant.local',
          status: 'online',
          latencyMs: 35,
          statusCode: 200,
          checkedAt: Date.now(),
        }}
        showText={true}
      />
    );

    expect(screen.getByText('35ms')).toBeInTheDocument();
  });

  it('renders offline status when server is unreachable', () => {
    render(
      <HealthBadge
        health={{
          url: 'http://192.168.1.200:8123',
          status: 'offline',
          error: 'ETIMEDOUT',
          checkedAt: Date.now(),
        }}
        showText={true}
      />
    );

    expect(screen.getByText('Down')).toBeInTheDocument();
  });

  it('calls onPing when clicked', () => {
    const onPing = vi.fn();
    render(
      <HealthBadge
        health={{
          url: 'https://homeassistant.local',
          status: 'online',
          latencyMs: 20,
          checkedAt: Date.now(),
        }}
        onPing={onPing}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onPing).toHaveBeenCalledTimes(1);
  });
});
