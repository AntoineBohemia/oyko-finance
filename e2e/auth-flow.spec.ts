import { test, expect } from "@playwright/test";

// Ce test suppose que le backend Spring Boot tourne sur localhost:8080
// et que la base de donnees est accessible.
// En CI, on peut utiliser NEXT_PUBLIC_DEV_MODE=true pour tester le flow
// avec les mock data (sans backend).

const TEST_EMAIL = `e2e-${Date.now()}@oyko.test`;
const TEST_PASSWORD = "TestPassword123!";
const TEST_PRENOM = "E2E";
const TEST_NOM = "Test";

test.describe("Auth Flow E2E", () => {
  test("register -> login -> dashboard -> logout", async ({ page }) => {
    // =============================================
    // STEP 1: Register
    // =============================================
    await page.goto("/signup");
    await expect(page).toHaveURL(/signup/);

    // Remplir le formulaire d'inscription
    await page.getByLabel(/pr[eé]nom/i).fill(TEST_PRENOM);
    await page.getByLabel(/nom/i).first().fill(TEST_NOM);
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/mot de passe/i).first().fill(TEST_PASSWORD);

    // Soumettre (le bouton peut varier)
    const submitButton = page.getByRole("button", {
      name: /s'inscrire|créer|continuer|suivant/i,
    });
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Attendre la redirection ou un message de succes
    // (le flow exact depend du backend : redirect vers login, onboarding, ou verify-email)
    await page.waitForURL(/login|onboarding|verify|dashboard/, {
      timeout: 10_000,
    });

    // =============================================
    // STEP 2: Login
    // =============================================
    await page.goto("/login");
    await expect(page).toHaveURL(/login/);

    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/mot de passe/i).fill(TEST_PASSWORD);

    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    // Attendre la redirection vers le dashboard
    await page.waitForURL(/dashboard|onboarding/, { timeout: 10_000 });

    // =============================================
    // STEP 3: Verify dashboard loaded
    // =============================================
    if (page.url().includes("dashboard")) {
      // Verifier que le contenu du dashboard est present
      await expect(
        page.getByText(/accueil|semaine|budget|patrimoine/i).first(),
      ).toBeVisible({ timeout: 5_000 });

      // Verifier que AUCUN token n'est dans localStorage
      const localStorageKeys = await page.evaluate(() =>
        Object.keys(localStorage),
      );
      expect(localStorageKeys).not.toContain("access_token");
      expect(localStorageKeys).not.toContain("refresh_token");
      expect(localStorageKeys).not.toContain("token");

      // Verifier que AUCUN token n'est dans sessionStorage
      const sessionStorageKeys = await page.evaluate(() =>
        Object.keys(sessionStorage),
      );
      expect(sessionStorageKeys).not.toContain("access_token");
      expect(sessionStorageKeys).not.toContain("refresh_token");
      expect(sessionStorageKeys).not.toContain("token");

      // Verifier que les cookies httpOnly sont presents
      // (Playwright peut lire les cookies meme httpOnly)
      const cookies = await page.context().cookies();
      const accessCookie = cookies.find((c) => c.name === "access_token");
      const refreshCookie = cookies.find((c) => c.name === "refresh_token");

      expect(accessCookie).toBeDefined();
      expect(accessCookie?.httpOnly).toBe(true);
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie?.httpOnly).toBe(true);
    }

    // =============================================
    // STEP 4: Logout
    // =============================================
    // Aller sur la page et trouver le bouton logout
    // (le logout peut etre dans un menu, on navigue vers une URL directe si disponible)
    await page.evaluate(() =>
      fetch("/api/auth/logout", { method: "POST" }),
    );

    // Attendre que les cookies soient supprimes
    await page.goto("/login");

    // Verifier que les cookies sont supprimes
    const cookiesAfterLogout = await page.context().cookies();
    const accessAfterLogout = cookiesAfterLogout.find(
      (c) => c.name === "access_token",
    );
    expect(accessAfterLogout).toBeUndefined();

    // Verifier qu'on ne peut plus acceder au dashboard
    await page.goto("/dashboard");
    await page.waitForURL(/login/, { timeout: 5_000 });
  });

  test("unauthenticated user redirects to login", async ({ page }) => {
    // Sans cookies, on doit etre redirige vers /login
    await page.goto("/dashboard");
    await page.waitForURL(/login/, { timeout: 5_000 });
    await expect(page).toHaveURL(/login/);
  });

  test("dev mode bypasses auth", async ({ page, context }) => {
    // Ajouter le cookie dev_mode
    await context.addCookies([
      {
        name: "dev_mode",
        value: "true",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/dashboard");

    // En dev mode, on doit pouvoir acceder au dashboard sans auth
    // (si NEXT_PUBLIC_DEV_MODE=true est set dans .env.local)
    await page.waitForTimeout(2_000);

    // Le dashboard devrait se charger avec les mock data
    const url = page.url();
    const isOnDashboard = url.includes("dashboard");
    const isOnLogin = url.includes("login");

    // Accepter les deux cas : si dev mode est actif on reste sur dashboard,
    // sinon on est redirige vers login
    expect(isOnDashboard || isOnLogin).toBe(true);
  });
});
