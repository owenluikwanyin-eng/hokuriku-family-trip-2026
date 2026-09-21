export default async (_req: Request, context: { next: () => Promise<Response> }) => {
  const response = await context.next();
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  let html = await response.text();
  if (html.includes("data-live-weather-loader")) return new Response(html, response);

  html = html.replace("</body>", '<script src="/weather.js" defer data-live-weather-loader></script></body>');
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
};

export const config = { path: ["/", "/index.html"] };
