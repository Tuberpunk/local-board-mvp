import { z } from 'zod';

// Схема для создания/редактирования товара
export const productFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(2000, 'Описание не должно превышать 2000 символов'),
  
  type: z.enum(['good', 'service'], {
    required_error: 'Выберите тип объявления',
  }),
  
  price: z
    .union([
      z.number().min(0, 'Цена не может быть отрицательной'),
      z.null(),
    ])
    .optional()
    .transform((val) => (val === undefined ? null : val)),
  
  price_from: z.boolean().default(false),
  
  is_available: z.boolean().default(true),
  
  category_id: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === '' ? null : val)),
  
  images: z
    .array(z.string().url('Некорректный URL изображения'))
    .max(10, 'Максимум 10 изображений')
    .default([]),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;

// Схема для создания магазина
export const shopFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(50, 'Название не должно превышать 50 символов'),
  
  slug: z
    .string()
    .min(2, 'Slug должен содержать минимум 2 символа')
    .max(50, 'Slug не должен превышать 50 символов')
    .regex(/^[a-z0-9-]+$/, 'Slug может содержать только строчные буквы, цифры и дефисы'),
  
  description: z
    .string()
    .max(500, 'Описание не должно превышать 500 символов')
    .optional()
    .transform((val) => val || ''),
  
  avatar_url: z
    .string()
    .url()
    .nullable()
    .optional()
    .transform((val) => val || null),
  
  cover_url: z
    .string()
    .url()
    .nullable()
    .optional()
    .transform((val) => val || null),
  
  contact_phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, 'Некорректный формат телефона')
    .nullable()
    .optional()
    .transform((val) => val || null),
  
  contact_whatsapp: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, 'Некорректный формат телефона')
    .nullable()
    .optional()
    .transform((val) => val || null),
  
  contact_telegram: z
    .string()
    .regex(/^@?[a-zA-Z0-9_]+$/, 'Некорректный формат Telegram')
    .nullable()
    .optional()
    .transform((val) => val || null),
  
  contact_email: z
    .string()
    .email('Некорректный email')
    .nullable()
    .optional()
    .transform((val) => val || null),
  
  address: z
    .string()
    .max(200, 'Адрес не должен превышать 200 символов')
    .optional()
    .transform((val) => val || ''),
  
  city: z
    .string()
    .max(50, 'Город не должен превышать 50 символов')
    .optional()
    .transform((val) => val || ''),
});

export type ShopFormSchema = z.infer<typeof shopFormSchema>;

// Схема авторизации
export const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  confirmPassword: z.string(),
  full_name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

export type RegisterSchema = z.infer<typeof registerSchema>;
