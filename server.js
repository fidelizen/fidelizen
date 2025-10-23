import { createServer } from "http";
import next from "next";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);

    // ⚙️ On ne sert QUE les routes d'API
    if (parsedUrl.pathname.startsWith("/api/")) {
      return handle(req, res, parsedUrl);
    }

    // 🔒 Toute autre requête est refusée (pas de rendu de page ici)
    res.statusCode = 404;
    res.end("Not Found (API only)");
  }).listen(process.env.PORT || 3000, () => {
    console.log("✅ API server ready on port", process.env.PORT || 3000);
  });
});
