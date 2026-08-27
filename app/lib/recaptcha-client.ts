declare global {
  interface Window {
    grecaptcha?: {
      ready(callback: () => void): void;
      execute(siteKey: string, options: { action: string }): Promise<string>;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

export function preloadRecaptcha(siteKey: string) {
  if (!siteKey || typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}&trustedtypes=true`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("reCAPTCHA failed to load"));
    document.head.appendChild(script);
  }).catch((error) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

export async function getRecaptchaToken(siteKey: string, action: string) {
  if (!siteKey) return "";
  try {
    await Promise.race([
      preloadRecaptcha(siteKey),
      new Promise<void>((resolve) => setTimeout(resolve, 1_200)),
    ]);
    if (!window.grecaptcha) return "";
    const token = new Promise<string>((resolve) => {
      window.grecaptcha?.ready(() => {
        void window.grecaptcha?.execute(siteKey, { action }).then(resolve).catch(() => resolve(""));
      });
    });
    return await Promise.race([
      token,
      new Promise<string>((resolve) => setTimeout(() => resolve(""), 1_200)),
    ]);
  } catch {
    return "";
  }
}
