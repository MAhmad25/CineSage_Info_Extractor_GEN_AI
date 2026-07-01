# Movie Info Extractor

Extract structured movie data from a paragraph.

The backend uses FastAPI and Gemini through `langchain-google-genai`. The frontend is a Vite React app.

## Requirements

- Python 3.13+
- Node.js and npm
- Google Gemini API key

## Environment

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_api_key_here
```

## Install

Backend:

```bash
pip install -r requirements.txt
```

Frontend:

```bash
cd frontend
npm install
```

## Run In Development

Start the API from the project root:

```bash
uvicorn main:app --reload --port 8000
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal. API calls to `/api` are proxied to `http://127.0.0.1:8000`.

## API

Endpoint:

```http
POST /api/extract
```

Request body:

```json
{
      "paragraph": "Christopher Nolan's Inception stars Leonardo DiCaprio and runs 148 minutes."
}
```

Response fields:

```json
{
      "name": "Inception",
      "description": "...",
      "genres": [],
      "cast": [],
      "rating": 0,
      "director": "Christopher Nolan",
      "country": null,
      "language": null,
      "release_date": null,
      "runtime_minutes": 148
}
```

The model is instructed to extract only information explicitly present in the input paragraph.

## Production Build

Build the frontend:

```bash
cd frontend
npm run build
```

The generated files are written to `frontend/dist`.
