import z from 'zod';

export const createPropertySchema = z
  .object({
    name: z.string().min(2).max(50),
    description: z.string().min(1).max(100),
    price: z.number().positive(),
  })
  .required();

export type CreatePropertyZodDto = z.infer<typeof createPropertySchema>;
