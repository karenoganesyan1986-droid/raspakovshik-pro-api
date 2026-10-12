
export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json(
        {
          status: "ok",
          service: "raspakovshik-pro-api",
          version: "0.1"
        },
        {
          headers: {
            ...cors,
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
    }

    return Response.json(
      { error: "not_found", message: "Маршрут не найден" },
      {
        status: 404,
        headers: {
          ...cors,
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  }
};
