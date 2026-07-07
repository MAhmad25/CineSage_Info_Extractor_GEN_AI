FROM node:22-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json .

RUN npm install

COPY frontend/ .

RUN npm run build

FROM python:3.13-slim

WORKDIR /app

COPY pyproject.toml .

COPY uv.lock .

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

RUN uv sync --frozen

COPY main.py .

COPY scripts .

COPY --from=frontend-builder /frontend/dist ./frontend/dist

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]