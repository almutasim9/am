import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useTranslation from './useTranslation';
import { LangContext } from '../contexts/AppContext';
import React from 'react';

// Mock translations
vi.mock('../utils/translations', () => ({
    translations: {
        en: {
            welcome: 'Welcome',
            greeting: 'Hello John' // In the current impl, this is just a string
        },
        ar: {
            welcome: 'أهلاً',
            greeting: 'مرحباً John'
        }
    }
}));

const wrapper = ({ children, lang = 'en' }) => (
    <LangContext.Provider value={{ lang }}>
        {children}
    </LangContext.Provider>
);

describe('useTranslation', () => {
    it('returns English translations by default', () => {
        const { result } = renderHook(() => useTranslation(), {
            wrapper: ({ children }) => wrapper({ children, lang: 'en' })
        });

        expect(result.current('welcome')).toBe('Welcome');
    });

    it('returns Arabic translations when lang is ar', () => {
        const { result } = renderHook(() => useTranslation(), {
            wrapper: ({ children }) => wrapper({ children, lang: 'ar' })
        });

        expect(result.current('welcome')).toBe('أهلاً');
    });

    it('returns key if translation is missing', () => {
        const { result } = renderHook(() => useTranslation(), {
            wrapper: ({ children }) => wrapper({ children, lang: 'en' })
        });

        expect(result.current('non_existent')).toBe('non_existent');
    });
});
