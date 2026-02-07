import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import VisitsStats from './VisitsStats';

describe('VisitsStats', () => {
    const mockStats = {
        total: 150,
        today: 5,
        overdue: 3,
        effectiveRate: 85,
    };

    it('renders total visits count', () => {
        render(<VisitsStats stats={mockStats} />);
        expect(screen.getByText('150')).toBeInTheDocument();
        expect(screen.getByText('Total Visits')).toBeInTheDocument();
    });

    it('renders today visits count', () => {
        render(<VisitsStats stats={mockStats} />);
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('renders overdue count', () => {
        render(<VisitsStats stats={mockStats} />);
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('Overdue')).toBeInTheDocument();
    });

    it('renders effective rate with percent sign', () => {
        render(<VisitsStats stats={mockStats} />);
        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText('Effective Rate')).toBeInTheDocument();
    });

    it('renders all four stat cards', () => {
        const { container } = render(<VisitsStats stats={mockStats} />);
        const statCards = container.querySelectorAll('.rounded-xl');
        expect(statCards.length).toBe(4);
    });

    it('handles zero values correctly', () => {
        const zeroStats = { total: 0, today: 0, overdue: 0, effectiveRate: 0 };
        render(<VisitsStats stats={zeroStats} />);
        expect(screen.getByText('0%')).toBeInTheDocument();
    });
});
