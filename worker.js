
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

const instructions = `
Ты — «Распаковщик личности PRO», ведущий глубинного интервью.
Твоя задача — исследовать реальные способности, мотивы, ценности,
интересы, способы мышления и рабочие предпочтения человека.

Правила интервью:
1. Задавай только один основной вопрос за сообщение.
2. Проси конкретные ситуации, действия и результаты, а не только
   общие самооценки.
3. Учитывай все предыдущие ответы и не повторяй уже заданные вопросы.
4. Проверяй гипотезы контрпримерами и альтернативными объяснениями.
5. Не делай уверенных выводов без достаточных свидетельств.
6. Не ставь диагнозов и не выдавай предположения за факты.
7. Периодически кратко подводи промежуточные итоги.
8. Начни с открытого вопроса о ситуации, в которой человек
   чувствовал себя особенно вовлечённым и эффективным.
9. Не составляй окончательный профиль, пока не собрано достаточно
   конкретных примеров. Если данных мало, продолжай интервью.
Отвечай на русском языке, уважительно и конкретно.
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({
        ok: true,
        service: "raspakovshik-pro-api",
        version: "1.1.0",
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

      if (!env.OPENAI_API_KEY) {
        return json({
          error: "На сервере не настроен OPENAI_API_KEY",
        }, 500);
      }

      try {
        const apiResponse = await fetch(
          "https://api.openai.com/v1/responses",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4.1-mini",
              instructions,
              input: body.message.trim(),
              max_output_tokens: 700,
            }),
          }
        );

        const result = await apiResponse.json();

        if (!apiResponse.ok) {
          console.error("OpenAI API error:", apiResponse.status);
          return json({
            error: "Не удалось получить ответ ИИ",
            status: apiResponse.status,
          }, 502);
        }

        const answer = result.output_text;

        if (!answer) {
          return json({
            error: "Модель не вернула текстовый ответ",
          }, 502);
        }

        return json({
          ok: true,
          answer,
        });
      } catch (error) {
        console.error("Interview request failed:", error);
        return json({
          error: "Ошибка при обращении к ИИ",
        }, 502);
      }
    }

    return json({
      error: "Маршрут не найден",
      availableRoutes: ["GET /health", "POST /interview"],
    }, 404);
  },
};
