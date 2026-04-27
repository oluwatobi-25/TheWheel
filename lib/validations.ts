import { z } from "zod";

export const SignUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  country: z.string().min(1, "Country is required"),
  investmentGoals: z.string().min(1, "Investment goal is required"),
  riskTolerance: z.string().min(1, "Risk tolerance is required"),
  preferredIndustry: z.string().min(1, "Preferred industry is required"),
});

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
