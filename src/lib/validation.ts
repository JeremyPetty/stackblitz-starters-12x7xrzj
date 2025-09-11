import { z } from "zod";

export const ReasonEnum = z.enum([
  "scheduled",      // Scheduled Appointment
  "general",        // General Question
  "membership",     // Question on Membership
  "pharma",         // Pharmaceutical Representative
  "other",          // Other (fill in)
]);

export type Reason = z.infer<typeof ReasonEnum>;

export const CheckInSchema = z.object({
  kind: z.enum(["new", "existing", "walkin"]),
  name: z.string().min(2, "Please enter a full name"),
  phone: z
    .string()
    .regex(/^[0-9+().\-\s]{7,20}$/i, "Enter a valid phone number"),
  reason: ReasonEnum,
  otherReason: z.string().max(200).optional().default(""),
  productName: z.string().max(200).optional().default(""),
  company: z.string().max(0).optional().default(""), // honeypot
}).superRefine((data, ctx) => {
  if (data.reason === "other" && !data.otherReason?.trim()) {
    ctx.addIssue({ code: "custom", message: "Please describe your reason.", path: ["otherReason"] });
  }
  if (data.reason === "pharma" && !data.productName?.trim()) {
    ctx.addIssue({ code: "custom", message: "Please list the product you represent.", path: ["productName"] });
  }
});

export type CheckInData = z.infer<typeof CheckInSchema>;
