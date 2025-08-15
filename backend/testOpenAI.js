import OpenAI from "openai";

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "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",
});

async function testAI(userMessage) {
  try {
    const prompt = `
You are a finance transaction assistant.
The user will give you a request like "add a 20 dollar coffee expense".
You must respond ONLY in valid JSON in this exact format:

{
  "type": "income" or "expense",
  "category": "string",
  "amount": number,
  "description": "string",
  "recurring": true or false
}

Do NOT include userId or date — the system will handle it.
User message: "${userMessage}"
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a finance transaction assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
    });

    const text = completion.choices[0].message.content;
    console.log("Raw AI output:\n", text);

    // Try parsing JSON
    const aiOutput = JSON.parse(text);
    console.log("\nParsed JSON output:\n", aiOutput);

  } catch (err) {
    console.error("AI test error:", err);
  }
}

// Example usage
testAI("Add 15 for coffee");
