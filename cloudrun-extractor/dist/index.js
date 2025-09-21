import express from "express";
import { chromium } from "playwright";
const app = express();
app.use(express.json());
app.post("/extract", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url)
            return res.status(400).json({ error: "Missing url" });
        const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        const title = await page.title();
        const text = await page.evaluate(() => document.body.innerText.slice(0, 2000));
        await browser.close();
        const type = url.includes("youtube.com") || url.includes("tiktok.com") ? "video" : "article";
        const source = new URL(url).hostname;
        res.json({ title, text, type, source });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get("/health", (_req, res) => res.json({ ok: true }));
app.listen(8080, () => console.log("Extractor listening on 8080"));
