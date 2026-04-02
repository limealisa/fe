/**
 * Client Store - Quản lý token và storage
 * Tương tự BC88BET
 */

export function getStore(key: string): any {
  const store =
    typeof window !== "undefined"
      ? JSON.parse(window.localStorage.getItem(key) || "null")
      : null;
  return store;
}

export function getToken(): string | null {
  const store =
    typeof window !== "undefined"
      ? window.localStorage.getItem("token")
      : null;
  
  if (store) {
    try {
      const parsed = JSON.parse(store);
      return parsed?.token || null;
    } catch {
      return store;
    }
  }
  return null;
}

export function setStore<T>(key: string, value: T): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    const tokenString = JSON.stringify({ token });
    localStorage.setItem("token", tokenString);
  }
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}



