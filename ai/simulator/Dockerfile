FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY ai/simulator/event_generator.py ./event_generator.py
RUN pip install --no-cache-dir redis

CMD ["python", "event_generator.py", "--mode", "auto", "--interval", "15", "--count", "0"]
