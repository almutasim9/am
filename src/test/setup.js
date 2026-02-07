import '@testing-library/jest-dom';

// Mock matchMedia for components using media queries
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => { },
    }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    observe() { return null; }
    disconnect() { return null; }
    unobserve() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    observe() { return null; }
    disconnect() { return null; }
    unobserve() { return null; }
};

// Suppress console errors during tests (optional)
// console.error = () => {};
