import { Readable } from "node:stream";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  if (!process.env.OPENAI_API_KEY_FILE) {
    throw new Error(
      "One of the following environment variables must bet set: OPENAI_API_KEY OPENAI_API_KEY_FILE",
    );
  }
  const key = await Bun.file(process.env.OPENAI_API_KEY_FILE).text();
  process.env["OPENAI_API_KEY"] = key.trim();
}
const port = parseInt(process.env.PORT ?? "3000");

const openai = new OpenAI();

Bun.serve({
  port,
  idleTimeout: 120,
  async fetch(req: Request) {
    const url = new URL(req.url);
    if (url.pathname === "/") {
      return new Response(Bun.file(import.meta.dir + "/assets/index.html"));
    }
    if (url.pathname === "/index.js") {
      return new Response(Bun.file(import.meta.dir + "/assets/index.js"));
    }
    if (req.method === "POST" && url.pathname === "/generate") {
      const text = await req.text();
      const readable = new Readable({ read() {} });
      openai.beta.chat.completions
        .stream({
          model: "gpt-4",
          messages: [
            {
              role: "developer",
              content:
                "This is the state of an HTML document right after the user asked you to change something on the webpage. Please make the requested change, and then add your own message to the page saying what you did. Please output the entire page with your modifications.",
            },
            {
              role: "user",
              content: text,
            },
          ],
        })
        .on("refusal.done", () => {
          readable.push("request refused");
          readable.push(null);
        })
        .on("content.delta", ({ delta }) => readable.push(delta))
        .on("content.done", () => readable.push(null));
      return new Response(readable);
    }
    return new Response("not found", { status: 404 });
  },
});

console.log("Listening on port " + port);
