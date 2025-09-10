import { z } from 'zod';

export const CheckInSchema = z.object({
  kind: z.enum(['new', 'existing', 'walkin']),
  name: z.string().min(2, 'Please enter a full name'),
  phone: z.string().regex(/^[0-9+().\-\s]{7,20}$/i, 'Enter a valid phone number'),
  apptTime: z.string().min(1, 'Select an appointment time'),
  notes: z.string().max(500).optional().default(''),
  company: z.string().max(0).optional().default(''), // honeypot
});

export type CheckInData = z.infer<typeof CheckInSchema>;
