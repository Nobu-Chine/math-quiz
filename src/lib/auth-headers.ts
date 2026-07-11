export function authHeaders(username: string, password: string): HeadersInit {
  return {
    "x-username": encodeURIComponent(username),
    "x-password": encodeURIComponent(password),
  };
}
