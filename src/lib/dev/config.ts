// Deux modes independants :
//
// 1. AUTH BYPASS : permet d'acceder aux pages protegees sans login
//    - NEXT_PUBLIC_DEV_MODE=true (build time)
//    - ou cookie "dev_mode"=true (runtime, toggle via widget)
//
// 2. MOCK DATA : utilise les donnees mockees au lieu de l'API
//    - NEXT_PUBLIC_MOCK_DATA=true (build time)
//    - ou cookie "mock_data"=true (runtime, toggle via widget)
//
// Combinaisons possibles :
//   AUTH_BYPASS=true  + MOCK_DATA=true  → Mode demo (pas de login, données statiques)
//   AUTH_BYPASS=true  + MOCK_DATA=false → Mode dev (pas de login, vraie API)
//   AUTH_BYPASS=false + MOCK_DATA=false → Mode prod (login requis, vraie API)
//   AUTH_BYPASS=false + MOCK_DATA=true  → Mode test UI (login requis, données statiques)

export const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE !== "false";

// Mock data est un flag separe. Si non defini, suit IS_DEV_MODE pour backward compat.
const MOCK_DATA_ENV = process.env.NEXT_PUBLIC_MOCK_DATA;
export const IS_MOCK_DATA = MOCK_DATA_ENV !== undefined
  ? MOCK_DATA_ENV === "true"
  : false; // Par defaut, pas de mock data meme en dev mode

// Indique si le widget dev doit etre affiche
// Widget toujours visible en dev ou si DEV_MODE est actif
export const SHOW_DEV_WIDGET = true;

// Check si l'auth bypass est actif (pour middleware / layout)
export async function isAuthBypassed(): Promise<boolean> {
  if (IS_DEV_MODE) return true;

  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      return cookieStore.get("dev_mode")?.value === "true";
    } catch {
      return false;
    }
  }

  if (typeof document !== "undefined") {
    return document.cookie.includes("dev_mode=true");
  }

  return false;
}

// Check si les mock data doivent etre utilisees (pour le data layer)
export async function isDevModeActive(): Promise<boolean> {
  if (IS_MOCK_DATA) return true;

  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      return cookieStore.get("mock_data")?.value === "true";
    } catch {
      return false;
    }
  }

  if (typeof document !== "undefined") {
    return document.cookie.includes("mock_data=true");
  }

  return false;
}
