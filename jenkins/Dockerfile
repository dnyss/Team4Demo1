# Custom Jenkins Image for Team4Demo1 CI/CD Pipeline
# Based on Jenkins LTS with Docker, Docker Compose, and CI/CD plugins pre-installed

FROM jenkins/jenkins:lts

LABEL maintainer="Eduardo Abarca <eduardo.abarca.c@usach.cl>"
LABEL description="Custom Jenkins image for Community Recipe Book CI/CD pipeline"
LABEL version="1.0"

# Cambiar a usuario root para instalar paquetes
USER root

# Instalar Docker CLI, Docker Compose, Make, y herramientas de seguridad
RUN apt-get update && \
    apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    make \
    wget && \
    # Agregar la clave GPG oficial de Docker
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    chmod a+r /etc/apt/keyrings/docker.gpg && \
    # Agregar el repositorio de Docker a las fuentes de Apt
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    # Instalar Docker CLI y Docker Compose plugin
    apt-get update && \
    apt-get install -y docker-ce-cli docker-compose-plugin && \
    # Instalar Trivy para security scanning (opcional, se instala en pipeline si no está)
    wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | apt-key add - && \
    echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | tee /etc/apt/sources.list.d/trivy.list && \
    apt-get update && \
    apt-get install -y trivy || true && \
    # Limpiar cache de apt para reducir el tamaño de la imagen
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Agregar usuario jenkins al grupo docker
# GID 999 es común en hosts Linux, ajustar si es necesario
RUN groupadd -g 999 docker || true && \
    usermod -aG docker jenkins

# Volver al usuario jenkins por seguridad
USER jenkins

# Instalar plugins de Jenkins recomendados para CI/CD
# Estos plugins soportan el pipeline completo definido en Jenkinsfile
RUN jenkins-plugin-cli --plugins \
    git \
    workflow-aggregator \
    docker-workflow \
    blueocean \
    credentials-binding \
    timestamper \
    jira \
    http_request \
    htmlpublisher \
    junit \
    pipeline-stage-view \
    job-dsl \
    pipeline-utility-steps \
    ws-cleanup

# Exponer puertos
EXPOSE 8080 50000

# Jenkins se ejecutará con el usuario jenkins (no root)
# El volumen /var/jenkins_home persistirá la configuración
