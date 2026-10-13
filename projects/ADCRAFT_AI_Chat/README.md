# ADCRAFT AI — Chat

A marketing assistant chat with Agency/Creator modes, powered by the OpenAI API. Responses follow the language of the latest message: Hebrew, Arabic, or English. Messages in other languages receive an English response.

## On Windows

1. Create an API key in your OpenAI account.
2. In the ADCRAFT_AI_Chat folder, copy `.env.example` to `.env` and set `OPENAI_API_KEY` to your key.
3. Run `npm.cmd run dev` and open **http://127.0.0.1:3000** (not VS Code Live Server on :5500).
4. Test **http://127.0.0.1:3000/api/status**. `configured:true` means an API key is set.

OpenAI API usage may incur charges. Keep the API key in `.env`; never add it to browser code or commit it. Chat history is stored locally in the browser. Publishing static files to GitHub Pages will not host the Node server; deploy the backend separately if you want a public app.
