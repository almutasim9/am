import { z } from 'zod';

// Store validation schema - Updated per user requirements
export const storeSchema = z.object({
    store_code: z.string()
        .min(5, 'Store Code must be 5 digits')
        .max(5, 'Store Code must be 5 digits')
        .regex(/^\d{5}$/, 'Store Code must be exactly 5 digits (numbers only)'), // 5 أرقام فقط
    name: z.string()
        .min(2, 'Store name must be at least 2 characters')
        .max(100, 'Store name is too long'),
    category: z.string()
        .min(1, 'Category is required'),
    pinned_note: z.string().max(500, 'Note is too long').optional(), // ملاحظات - اختياري
    has_pos: z.boolean().optional().default(false),
    has_sim_card: z.boolean().optional().default(false),
    zone: z.string().min(1, 'Zone is required'),
    area_name: z.string().min(1, 'Area name is required'), // المنطقة - مطلوب
    address: z.string().min(1, 'Address is required'), // العنوان - مطلوب
    map_link: z.string().url('Invalid map link URL').optional().or(z.literal('')),
    owner: z.string()
        .min(2, 'Owner name is required')
        .max(100, 'Owner name is too long'),
    phone: z.string()
        .min(1, 'Phone number is required')
        .min(5, 'Phone number must be at least 5 digits'),
    status: z.enum(['Active', 'Closed']).default('Active'),
    contacts: z.array(z.object({
        name: z.string().optional(),
        role: z.string().optional(),
        phone: z.string().optional(),
    })).optional(),
});

// Task validation schema
export const taskSchema = z.object({
    store_id: z.string()
        .min(1, 'Please select a store'),
    cat: z.string()
        .min(1, 'Category is required'),
    sub: z.string()
        .min(1, 'Sub-task is required'),
    priority: z.enum(['high', 'medium', 'low']).default('medium'),
    due_date: z.string()
        .min(1, 'Due date is required'),
    description: z.string()
        .max(1000, 'Description is too long')
        .optional(),
    status: z.enum(['pending', 'in_progress', 'done']).default('pending'),
});

// Visit validation schema
export const visitSchema = z.object({
    store_id: z.string()
        .min(1, 'Please select a store'),
    date: z.string()
        .min(1, 'Date is required'),
    type: z.string()
        .min(1, 'Visit type is required'),
    reason: z.string().optional(),
    note: z.string()
        .max(1000, 'Note is too long')
        .optional(),
    status: z.enum(['scheduled', 'completed']).default('scheduled'),
    is_effective: z.boolean().nullable().optional(),
});

// Visit completion validation schema
export const completeVisitSchema = z.object({
    rating: z.number()
        .min(1, 'Please rate the visit')
        .max(5),
    notes: z.string()
        .min(5, 'Please provide more details about the visit (at least 5 characters)')
        .max(2000, 'Notes are too long'),
});

// Contact validation schema
export const contactSchema = z.object({
    name: z.string()
        .min(2, 'Employee name is required'),
    role: z.string()
        .min(1, 'Role is required'),
    phone: z.string()
        .regex(/^[+]?[0-9\s-]{8,15}$/, 'Invalid phone number format'),
});

// Validation helper function
export const validate = (schema, data) => {
    try {
        const result = schema.parse(data);
        return { success: true, data: result, errors: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = {};
            (error.issues || []).forEach(err => {
                const path = err.path.join('.');
                errors[path] = err.message;
            });
            return { success: false, data: null, errors };
        }
        throw error;
    }
};

// Safe validation (doesn't throw)
export const safeValidate = (schema, data) => {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data, errors: null };
    }
    const errors = {};
    if (result.error && result.error.issues) {
        result.error.issues.forEach(err => {
            const path = err.path.join('.');
            errors[path] = err.message;
        });
    }
    return { success: false, data: null, errors };
};
