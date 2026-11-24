let pathname = "/";
let search = "";

export interface UrlObject {
  pathname?: string;
  query?: Record<string, string>;
}

export function setMockNavigation(next: UrlObject) {
  pathname = next.pathname ?? "/";
  search = next.query ? new URLSearchParams(next.query).toString() : "";
}

export function usePathname() {
  return pathname;
}

export function useSearchParams() {
  return new URLSearchParams(search);
}

export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    refresh: () => {},
    back: () => {},
    forward: () => {},
    prefetch: () => {},
  };
}

export function notFound(): never {
  throw new Error("notFound() called in a story");
}

export function redirect(to: string): never {
  throw new Error(`redirect(${to}) called in a story`);
}
