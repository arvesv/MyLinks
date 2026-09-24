import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchModal } from '../components/SearchModal';
import { Category } from '../types';

const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Infrastructure',
    sort_order: 1,
    collapsed: 0,
    links: [
      {
        id: 'link-ha',
        category_id: 'cat-1',
        title: 'Home Assistant',
        url: 'http://homeassistant.local:8123',
        description: 'Smart home hub',
        icon: 'home-assistant',
        icon_type: 'homelab',
        is_favorite: 1,
        open_new_tab: 1,
        tags: 'iot,home',
        click_count: 5,
        sort_order: 1,
      },
      {
        id: 'link-proxmox',
        category_id: 'cat-1',
        title: 'Proxmox VE',
        url: 'https://proxmox.local:8006',
        description: 'Hypervisor',
        icon: 'proxmox',
        icon_type: 'homelab',
        is_favorite: 0,
        open_new_tab: 1,
        tags: 'vm,linux',
        click_count: 2,
        sort_order: 2,
      },
    ],
  },
];

describe('SearchModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <SearchModal
        isOpen={false}
        onClose={vi.fn()}
        categories={mockCategories}
        onLinkClick={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all links when opened with empty query', () => {
    render(
      <SearchModal
        isOpen={true}
        onClose={vi.fn()}
        categories={mockCategories}
        onLinkClick={vi.fn()}
      />
    );

    expect(screen.getByText('Home Assistant')).toBeInTheDocument();
    expect(screen.getByText('Proxmox VE')).toBeInTheDocument();
  });

  it('filters bookmarks by query string matching title or description', () => {
    render(
      <SearchModal
        isOpen={true}
        onClose={vi.fn()}
        categories={mockCategories}
        onLinkClick={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Type to search/i);
    fireEvent.change(input, { target: { value: 'Hypervisor' } });

    expect(screen.queryByText('Home Assistant')).not.toBeInTheDocument();
    expect(screen.getByText('Proxmox VE')).toBeInTheDocument();
  });

  it('filters bookmarks by tag', () => {
    render(
      <SearchModal
        isOpen={true}
        onClose={vi.fn()}
        categories={mockCategories}
        onLinkClick={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Type to search/i);
    fireEvent.change(input, { target: { value: 'iot' } });

    expect(screen.getByText('Home Assistant')).toBeInTheDocument();
    expect(screen.queryByText('Proxmox VE')).not.toBeInTheDocument();
  });

  it('shows no bookmarks message when query has no matches', () => {
    render(
      <SearchModal
        isOpen={true}
        onClose={vi.fn()}
        categories={mockCategories}
        onLinkClick={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Type to search/i);
    fireEvent.change(input, { target: { value: 'NonexistentService123' } });

    expect(screen.getByText(/No bookmarks matching/i)).toBeInTheDocument();
  });
});
