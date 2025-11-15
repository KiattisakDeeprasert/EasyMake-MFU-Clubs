export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export async function authedFetch(
  path: string,
  options: RequestInit & { requireJson?: boolean } = {}
) {
  const isForm =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isForm
        ? {}
        : {
            "Content-Type":
              options.headers && (options.headers as any)["Content-Type"]
                ? (options.headers as any)["Content-Type"]
                : options.method === "POST" ||
                  options.method === "PATCH" ||
                  options.method === "PUT"
                ? "application/json"
                : undefined,
          }),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        if (data?.message) msg = data.message;
        else if (data?.error) msg = data.error;
      } else {
        const text = await res.text();
        if (text) msg = text;
      }
    } catch {}
    throw new Error(msg);
  }

  if (options.requireJson === false) return null;
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : (res.text() as any);
}
