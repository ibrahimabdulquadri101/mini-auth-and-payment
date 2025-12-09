import { AuthGuard as Base } from './auth.guard';
export * from './auth.guard';

export function UserGuard() {
  return new Base(['user']);
}
export function ServiceGuard() {
  return new Base(['service']);
}
export function AnyAuthGuard() {
  return new Base(['user','service']);
}
