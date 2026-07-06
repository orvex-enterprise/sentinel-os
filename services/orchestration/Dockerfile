FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY services/orchestration/pyproject.toml ./
RUN pip install --no-cache-dir -e .

COPY services/orchestration/ ./services/orchestration/
WORKDIR /app/services/orchestration

EXPOSE 5000
CMD ["python", "main.py"]
