export default {
  async fetch(request, env) {
    // Health-check в браузере
    if (request.method === "GET") {
      return new Response("OK");
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Проверка, что запрос пришел именно от Telegram (через secret_token в setWebhook)
    const secretHeader = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (!secretHeader || secretHeader !== env.TG_SECRET) {
      return new Response("Forbidden", { status: 403 });
    }

    const update = await request.json();

    const message = update.message;
    const chatId = message?.chat?.id;

    if (chatId) {
      const incomingText = message?.text ?? "";
      const replyText = incomingText
        ? `Тест: бот работает!\nВы написали: ${incomingText}`
        : "Тест: бот работает!";

      await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
        }),
      });
    }

    return new Response("OK");
  },
};
