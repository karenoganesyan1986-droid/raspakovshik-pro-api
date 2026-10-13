
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({
        ok: true,
        service: "raspakovshik-pro-api",
        version: "1.0.0",
      });
    }

    if (url.pathname === "/interview" && request.method === "POST") {
      let body;

      try {
        body = await request.json();
      } catch {
        return json({ error: "Некорректный JSON" }, 400);
      }

      if (
        !body ||
        typeof body.message !== "string" ||
        !body.message.trim()
      ) {
        return json({
          error: "Передайте непустое поле message",
        }, 400);
      }

      return json({
        ok: false,
        status: "ai_not_configured",
        message:
          "Интервью API доступно, но интеллектуальный модуль ещё не подключён.",
        received: true,
      }, 200);
    }

    return json({
      error: "Маршрут не найден",
      availableRoutes: ["GET /health", "POST /interview"],
    }, 404);
  },
};