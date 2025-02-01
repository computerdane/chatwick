import { Readable } from "node:stream";
import OpenAI from "openai";
const openai = new OpenAI();

const port = parseInt(process.env.PORT ?? "3000");

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
        .on("refusal.done", () => console.log("request refused"))
        .on("content.delta", ({ delta }) => readable.push(delta))
        .on("content.done", () => readable.push(null));
      return new Response(readable);
    }
    return new Response("not found", { status: 404 });
  },
});

console.log("Listening on port " + port);
