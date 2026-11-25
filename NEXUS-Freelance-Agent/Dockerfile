FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY nexus nexus
COPY web web
COPY data/knowledge_base.json data/knowledge_base.json
ENV NEXUS_HOST=0.0.0.0 NEXUS_IN_DOCKER=1 NEXUS_DATA_DIR=/data
HEALTHCHECK --interval=60s --timeout=5s CMD python -c "import urllib.request;urllib.request.urlopen('http://127.0.0.1:8765/health')"
CMD ["python", "-m", "nexus"]
