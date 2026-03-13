import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, fireEvent } from '@/test/utils';
import { FilterBar } from '../filter-bar';

describe('FilterBar', () => {
  it('renders search input with placeholder', () => {
    renderWithProviders(
      <FilterBar searchValue="" onSearchChange={() => {}} searchPlaceholder="Search..." />
    );
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <FilterBar searchValue="" onSearchChange={onChange} />
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('renders children', () => {
    renderWithProviders(
      <FilterBar searchValue="" onSearchChange={() => {}}>
        <button>Extra</button>
      </FilterBar>
    );
    expect(screen.getByText('Extra')).toBeInTheDocument();
  });
});
