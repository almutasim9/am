import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LangContext } from '../../../../contexts/AppContext';
import StoreCard from './StoreCard';

const mockStore = {
    id: 'store-1',
    name: 'مطعم الشيف فهد',
    category: 'Restaurant',
    owner: 'Chef Fahd',
    phone: '+964 770 123 4567',
    zone: 'Baghdad Central',
    area_name: 'Karrada',
    status: 'Active',
    last_visit: '2026-02-01T10:00:00Z',
};

const Wrapper = ({ children }) => (
    <BrowserRouter>
        <LangContext.Provider value={{ lang: 'en', setLang: vi.fn() }}>
            {children}
        </LangContext.Provider>
    </BrowserRouter>
);

describe('StoreCard', () => {
    const defaultProps = {
        store: mockStore,
        onSelect: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        bulkMode: false,
        isSelected: false,
        onToggleSelect: vi.fn(),
    };

    it('renders store name correctly', () => {
        render(<StoreCard {...defaultProps} />, { wrapper: Wrapper });
        expect(screen.getByText('مطعم الشيف فهد')).toBeInTheDocument();
    });

    it('renders store zone and area', () => {
        render(<StoreCard {...defaultProps} />, { wrapper: Wrapper });
        expect(screen.getByText(/Baghdad Central - Karrada/)).toBeInTheDocument();
    });

    it('renders owner name', () => {
        render(<StoreCard {...defaultProps} />, { wrapper: Wrapper });
        expect(screen.getByText(/Chef Fahd/)).toBeInTheDocument();
    });

    it('shows checkbox when in bulk mode', () => {
        render(<StoreCard {...defaultProps} bulkMode={true} />, { wrapper: Wrapper });
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('checkbox is checked when selected in bulk mode', () => {
        render(<StoreCard {...defaultProps} bulkMode={true} isSelected={true} />, { wrapper: Wrapper });
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('shows active status badge with indicator', () => {
        render(<StoreCard {...defaultProps} />, { wrapper: Wrapper });
        // Status shows as "● Active"
        expect(screen.getByText(/Active/)).toBeInTheDocument();
    });

    it('renders action buttons with correct aria-labels', () => {
        render(<StoreCard {...defaultProps} />, { wrapper: Wrapper });
        // aria-labels use translations - in English: "call store.name", "edit store.name", "delete store.name"
        expect(screen.getByRole('button', { name: /call/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('renders view profile button', () => {
        render(<StoreCard {...defaultProps} />, { wrapper: Wrapper });
        expect(screen.getByText(/View/)).toBeInTheDocument();
    });
});
