import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  sku: z.string().min(3, 'El SKU debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  purchasePrice: z.number().positive('El precio de compra debe ser positivo'),
  salePrice: z.number().positive('El precio de venta debe ser positivo'),
  stock: z.number().int().nonnegative('El stock no puede ser negativo'),
  minStock: z.number().int().nonnegative('El stock mínimo no puede ser negativo'),
  categoryId: z.string().uuid('Categoría inválida'),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
