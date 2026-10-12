// Client-side validation rules. They mirror the backend's Bean Validation constraints,
// so most mistakes are caught before a request is sent (the backend still re-validates).

export type Errors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9]{9,15}$/;

export const isEmail = (v: string) => EMAIL_RE.test(v.trim());
export const isPhone = (v: string) => PHONE_RE.test(v.trim());

export function validateSignIn(v: { email: string; password: string }) {
  const e: Errors<typeof v> = {};
  if (!v.email.trim()) e.email = 'Email is required';
  else if (!isEmail(v.email)) e.email = 'Enter a valid email address';
  if (!v.password) e.password = 'Password is required';
  return e;
}

export function validateSignUp(v: { fullName: string; email: string; phone: string; password: string; confirmPassword: string }) {
  const e: Errors<typeof v> = {};
  if (v.fullName.trim().length < 2) e.fullName = 'Full name must be at least 2 characters';
  if (!v.email.trim()) e.email = 'Email is required';
  else if (!isEmail(v.email)) e.email = 'Enter a valid email address';
  if (v.phone.trim() && !isPhone(v.phone)) e.phone = 'Phone must be 9-15 digits (optional leading +)';
  if (v.password.length < 6) e.password = 'Password must be at least 6 characters';
  else if (v.password.length > 64) e.password = 'Password must be at most 64 characters';
  if (v.confirmPassword !== v.password) e.confirmPassword = 'Passwords do not match';
  return e;
}

export const hasErrors = (e: object) => Object.values(e).some(Boolean);
