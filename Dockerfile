# Multi-stage Docker build for InvestIQ
FROM python:3.12-slim AS backend

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY ml/ ./ml/

ENV PORT=5000
ENV FLASK_ENV=production
EXPOSE 5000

CMD ["python", "backend/run.py"]
