import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  const apiList = {
    Auth: [
      { name: "Register", method: "POST", url: "/api/auth/register", body: { name: "string", email: "string", password: "string" }, description: "Register a new user" },
      { name: "Login", method: "POST", url: "/api/auth/login", body: { email: "string", password: "string" }, description: "Login user and get JWT token" }
    ],
    Transactions: [
      { name: "Get All Transactions", method: "GET", url: "/api/transactions?userId={userId}", headers: { Authorization: "Bearer <token>" }, description: "Get all transactions for a user" },
      { name: "Add Transaction", method: "POST", url: "/api/transactions", headers: { Authorization: "Bearer <token>" }, body: { type: "income|expense", category: "string", amount: "number", description: "string", userId: "string" }, description: "Add a new transaction" },
      { name: "Delete Transaction by Description", method: "POST", url: "/api/assistant", headers: { Authorization: "Bearer <token>" }, body: { message: "string", userId: "string" }, description: "Send a delete message to AI to remove transaction by description" }
    ],
    OpenAI: [
      { name: "AI Assistant", method: "POST", url: "/api/assistant", headers: { Authorization: "Bearer <token>" }, body: { message: "string", userId: "string" }, description: "Send a message to the AI assistant (OpenAI GPT). Can handle add/delete transactions automatically." }
    ]
  };

  const sectionColors = {
    Auth: "bg-[#1E1E1E] border-l-4 border-blue-400",
    Transactions: "bg-[#1E1E1E] border-l-4 border-green-400",
    OpenAI: "bg-[#1E1E1E] border-l-4 border-purple-400"
  };

  let html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { font-family: 'Fira Code', monospace; background-color: #1E1E1E; color: #D4D4D4; }
      h1 { letter-spacing: 1px; }
      .card { transition: all 0.3s ease-in-out; }
      .card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,255,255,0.1); }
      pre { background-color: #252526; border-radius: 0.5rem; padding: 0.75rem; overflow-x: auto; color: #D4D4D4; }
    </style>
  </head>
  <body class="p-6">
    <h1 class="text-4xl font-bold mb-10 text-gray-100">Expense Tracker API Docs</h1>
  `;

  for (const section in apiList) {
    html += `<div class="mb-10">
      <h2 class="text-2xl font-semibold mb-6 text-gray-300">${section}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;

    apiList[section].forEach((api) => {
      const colorClass = sectionColors[section] || "bg-gray-800 border-l-4 border-gray-400";
      html += `
        <div class="card p-6 rounded-xl ${colorClass}">
          <p class="text-sm text-gray-400 mb-1 font-semibold">${api.method}</p>
          <p class="font-mono text-lg text-gray-100 mb-2">${api.url}</p>
          <p class="text-gray-300 mb-3">${api.description}</p>
          ${api.body ? `<pre><code>${JSON.stringify(api.body, null, 2)}</code></pre>` : ""}
          ${api.headers ? `<pre><code>Headers: ${JSON.stringify(api.headers, null, 2)}</code></pre>` : ""}
        </div>
      `;
    });

    html += `</div></div>`;
  }

  html += `
  </body>
  </html>
  `;

  res.send(html);
});

export default router;
