export function getStorageItem(key: string): string | null {
  return localStorage.getItem(key);
}

export function setStorageItem(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export function removeStorageItem(key: string): void {
  localStorage.removeItem(key);
}

export function getToken(): string {
  return getStorageItem("token") ?? "";
}
