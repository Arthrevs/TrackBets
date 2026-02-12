# Use Python as base image
FROM python:3.10-slim

# Install system dependencies (curl for Node installation)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install Node.js logic
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Set Working Directory
WORKDIR /app

# --- Frontend Build ---
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
# Install Node dependencies
RUN npm install
# Copy frontend source
COPY frontend/ ./
# Build React App
RUN npm run build

# --- Backend Setup ---
WORKDIR /app
# Copy Backend requirements
COPY requirements.txt .
# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
# Copy Backend Source (api folder)
COPY api/ ./api/

# Expose Render Port
EXPOSE 10000

# Start Command
# Run Uvicorn pointing to the main app
# Host 0.0.0.0 is crucial for Docker
# Port 10000 is standard for Render web services
CMD ["uvicorn", "api.backend.main:app", "--host", "0.0.0.0", "--port", "10000"]
