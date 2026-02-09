import { describe, it, expect } from 'vitest';
import { storeSchema, taskSchema, visitSchema, contactSchema, validate, safeValidate } from './validation';

describe('Validation Utils', () => {
    describe('storeSchema', () => {
        const validStore = {
            store_code: '12345',
            name: 'Test Store',
            category: 'Grocery',
            zone: 'Baghdad Central',
            area_name: 'Test Area',
            address: '123 Test St',
            owner: 'John Doe',
            phone: '07701234567',
            status: 'Active'
        };

        it('validates a correct store object', () => {
            const result = safeValidate(storeSchema, validStore);
            expect(result.success).toBe(true);
        });

        it('fails if store_code is not 5 digits', () => {
            const result = safeValidate(storeSchema, { ...validStore, store_code: '1234' });
            expect(result.success).toBe(false);
            // Zod processes validations in order, but the last one (regex) might overwrite if it fails too.
            // In our schema: min(5) -> max(5) -> regex. '1234' fails min(5) and regex.
            expect(result.errors.store_code).toBeDefined();
        });

        it('fails if store_code contains non-numeric characters', () => {
            const result = safeValidate(storeSchema, { ...validStore, store_code: '1234a' });
            expect(result.success).toBe(false);
            expect(result.errors.store_code).toBe('Store Code must be exactly 5 digits (numbers only)');
        });

        it('fails if required fields are missing', () => {
            const result = safeValidate(storeSchema, { name: '', category: '' });
            expect(result.success).toBe(false);
            expect(result.errors.name).toBe('Store name must be at least 2 characters');
            expect(result.errors.category).toBe('Category is required');
        });
    });

    describe('taskSchema', () => {
        const validTask = {
            store_id: 'store-1',
            cat: 'Sales',
            sub: 'Pricing',
            priority: 'high',
            due_date: new Date().toISOString()
        };

        it('validates a correct task object', () => {
            const result = safeValidate(taskSchema, validTask);
            expect(result.success).toBe(true);
        });

        it('fails if store_id is missing', () => {
            const result = safeValidate(taskSchema, { ...validTask, store_id: '' });
            expect(result.success).toBe(false);
            expect(result.errors.store_id).toBe('Please select a store');
        });
    });

    describe('visitSchema', () => {
        const validVisit = {
            store_id: 'store-1',
            date: new Date().toISOString(),
            type: 'Regular',
            status: 'scheduled'
        };

        it('validates a correct visit object', () => {
            const result = safeValidate(visitSchema, validVisit);
            expect(result.success).toBe(true);
        });
    });

    describe('contactSchema', () => {
        const validContact = {
            name: 'Jane Doe',
            role: 'Manager',
            phone: '07701234567' // Fixed length to match schema expectations (8-15)
        };

        it('validates a correct contact object', () => {
            const result = safeValidate(contactSchema, validContact);
            expect(result.success).toBe(true);
        });

        it('fails with invalid phone format', () => {
            const result = safeValidate(contactSchema, { ...validContact, phone: 'abc' });
            expect(result.success).toBe(false);
            expect(result.errors.phone).toBe('Invalid phone number format');
        });
    });

    describe('validate helper', () => {
        it('returns success for valid data', () => {
            const data = { name: 'Test', role: 'Staff', phone: '123456789' };
            const result = validate(contactSchema, data);
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });

        it('returns compiled errors for invalid data', () => {
            const data = { name: '', role: '', phone: '' };
            const result = validate(contactSchema, data);
            expect(result.success).toBe(false);
            expect(result.errors.name).toBeDefined();
            expect(result.errors.role).toBeDefined();
        });
    });
});
