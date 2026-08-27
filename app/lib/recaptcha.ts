export type RecaptchaAssessment = {
  status: "passed" | "low_score" | "invalid" | "missing" | "unavailable" | "not_configured";
  score?: number;
  action?: string;
  hostname?: string;
};

type SiteVerifyResponse = {
  success?: boolean;
  score?: number;
  action?: string;
  hostname?: string;
};

const EXPECTED_ACTION = "lead_submit";

export async function assessRecaptcha(token: string, remoteIp: string): Promise<RecaptchaAssessment> {
  if (process.env.RECAPTCHA_TEST_MODE === "1") {
    return token === "test-low"
      ? { status: "low_score", score: 0.1, action: EXPECTED_ACTION, hostname: "open.entero.by" }
      : { status: "passed", score: 0.9, action: EXPECTED_ACTION, hostname: "open.entero.by" };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  if (!secret) return { status: "not_configured" };
  if (!token) return { status: "missing" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });
    const result = await response.json().catch(() => null) as SiteVerifyResponse | null;
    if (!response.ok || !result) return { status: "unavailable" };

    const hostname = result.hostname || "";
    const allowedHostnames = new Set(
      (process.env.RECAPTCHA_ALLOWED_HOSTNAMES || "open.entero.by")
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    );
    if (!result.success || result.action !== EXPECTED_ACTION || !allowedHostnames.has(hostname.toLowerCase())) {
      return { status: "invalid", score: result.score, action: result.action, hostname };
    }

    const threshold = Number(process.env.RECAPTCHA_SCORE_THRESHOLD || "0.5");
    const score = typeof result.score === "number" ? result.score : 0;
    return {
      status: score >= threshold ? "passed" : "low_score",
      score,
      action: result.action,
      hostname,
    };
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}
