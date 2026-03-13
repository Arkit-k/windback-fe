import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/test/utils';
import { StatCard } from '../stat-card';
import { Activity } from 'lucide-react';

describe('StatCard', () => {
  it('renders title and value', () => {
    renderWithProviders(
      <StatCard title="Total Events" value="42" icon={Activity} />
    );
    expect(screen.getByText('Total Events')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    renderWithProviders(
      <StatCard title="Recovered" value="10" subtitle="of 50 events" icon={Activity} />
    );
    expect(screen.getByText('of 50 events')).toBeInTheDocument();
  });

  it('shows skeleton when loading', () => {
    const { container } = renderWithProviders(
      <StatCard title="Test" value="0" icon={Activity} isLoading />
    );
    // Skeleton elements should be present, actual value should not
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[class*="skeleton"], [data-slot="skeleton"]').length).toBeGreaterThan(0);
  });
});
