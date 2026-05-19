"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SHOW_DEV_WIDGET } from "@/lib/dev/config";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-5 w-9 rounded-full transition-colors ${
        enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <div
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function DevModeWidget() {
  const router = useRouter();
  const [authBypass, setAuthBypass] = useState(false);
  const [mockData, setMockData] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const devCookie = getCookie("dev_mode");
    const mockCookie = getCookie("mock_data");
    const envDev = process.env.NEXT_PUBLIC_DEV_MODE !== "false";
    const envMock = process.env.NEXT_PUBLIC_MOCK_DATA === "true";
    setAuthBypass(devCookie === "true" || envDev);
    setMockData(mockCookie === "true" || envMock);
  }, []);

  if (!SHOW_DEV_WIDGET) return null;

  const handleToggleAuth = () => {
    const newValue = !authBypass;
    setAuthBypass(newValue);
    if (newValue) {
      setCookie("dev_mode", "true", 30);
    } else {
      deleteCookie("dev_mode");
    }
    router.refresh();
  };

  const handleToggleMock = () => {
    const newValue = !mockData;
    setMockData(newValue);
    if (newValue) {
      setCookie("mock_data", "true", 30);
    } else {
      deleteCookie("mock_data");
    }
    router.refresh();
    // Force reload pour que les Server Components re-fetchent
    window.location.reload();
  };

  const isActive = authBypass || mockData;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex flex-col items-start gap-2">
      {isExpanded && (
        <div
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900"
          style={{ minWidth: 240 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Dev Tools
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {/* Auth bypass toggle */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 dark:border-gray-700">
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Auth bypass
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Pas de login requis
                </span>
              </div>
              <Toggle enabled={authBypass} onChange={handleToggleAuth} />
            </div>

            {/* Mock data toggle */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 dark:border-gray-700">
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Mock data
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Donnees statiques
                </span>
              </div>
              <Toggle enabled={mockData} onChange={handleToggleMock} />
            </div>
          </div>

          {/* Status */}
          <div className="mt-3 rounded-md bg-gray-50 px-2.5 py-2 dark:bg-gray-800">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${authBypass ? "bg-green-500" : "bg-red-400"}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {authBypass ? "Auth bypass actif" : "Login requis"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${mockData ? "bg-yellow-500" : "bg-blue-500"}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {mockData ? "Mock data" : "API Spring Boot"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 ${
          isActive
            ? "bg-green-500 text-white"
            : "bg-gray-800 text-gray-300 dark:bg-gray-700"
        }`}
        title="Dev Tools"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 18l6-6-6-6" />
          <path d="M8 6l-6 6 6 6" />
        </svg>
      </button>
    </div>
  );
}
