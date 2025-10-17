# Use an official lightweight Python image
FROM python:3.12-slim

# Set working directory inside container
WORKDIR /app

# Copy dependency files first (for caching)
COPY pyproject.toml requirements.txt ./

# Install dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Install dev dependencies from pyproject.toml (optional)
RUN pip install -e ".[dev]"

# pre-commit
RUN apt-get update && apt-get install -y git

# Copy the rest of the app code
COPY . .

# Expose Flask default port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app
ENV FLASK_RUN_HOST=0.0.0.0

# Run the app
CMD ["flask", "run"]
