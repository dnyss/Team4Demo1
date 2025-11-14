# Custom Jenkins Docker Image for CI/CD Pipeline

**Project**: Team4Demo1 - Community Recipe Book  
**Component**: Jenkins CI/CD Server  
**Version**: 1.0  
**Last Updated**: November 13, 2025

---

## 📋 Overview

Custom Jenkins Docker image tailored for the Team4Demo1 CI/CD pipeline. Includes all necessary tools and plugins to run the complete automated build, test, and deployment pipeline.

## ✨ Features

- **Base Image**: `jenkins/jenkins:lts` (Long Term Support)
- **Docker Support**: Docker CLI + Docker Compose plugin
- **Build Tools**: Make, Git, Wget
- **Security Scanning**: Trivy vulnerability scanner
- **Jenkins Plugins**: Pre-installed CI/CD plugins
- **Non-root Execution**: Runs as jenkins user

## 🚀 Quick Start

### Using Make (Recommended)
```bash
# From project root
make jenkins-up          # Start Jenkins
make jenkins-password    # Get initial admin password
make jenkins-logs        # View logs
make jenkins-down        # Stop Jenkins
```

### Using Docker Compose
```bash
docker compose -f docker-compose.jenkins.yaml up -d
docker compose -f docker-compose.jenkins.yaml logs -f jenkins
```

## 🔧 Included Tools

| Tool | Purpose |
|------|---------|
| Docker CLI | Build and manage containers |
| Docker Compose | Multi-container orchestration |
| Make | Build automation |
| Trivy | Security vulnerability scanning |

## 🔌 Pre-installed Jenkins Plugins

- **git**: Git repository integration
- **workflow-aggregator**: Jenkins Pipeline support
- **docker-workflow**: Docker pipeline steps
- **blueocean**: Modern UI for pipelines
- **credentials-binding**: Secure credential management
- **timestamper**: Console timestamps
- **jira**: Jira ticket integration
- **http_request**: HTTP API calls (Discord, monitoring)
- **htmlpublisher**: HTML reports (coverage)
- **junit**: JUnit test results
- **pipeline-stage-view**: Pipeline visualization
- **job-dsl**: Job DSL for pipelines
- **pipeline-utility-steps**: Additional utilities
- **ws-cleanup**: Workspace cleanup

## 🔐 Security Considerations

### Docker Socket Access
The container needs access to the Docker socket:
- **Mounted volume**: `/var/run/docker.sock`
- **Jenkins user**: Added to docker group (GID 999)

⚠️ **Warning**: Mounting the Docker socket gives full control over Docker daemon. Use only in trusted environments.

### User Permissions
- Runs as **non-root** user (`jenkins`)
- Added to `docker` group for socket access
- Home directory: `/var/jenkins_home` (persisted)

## 🛠️ Configuration

### Docker Group ID
Assumes host's docker group has **GID 999**.

Check your system:
```bash
stat -c '%g' /var/run/docker.sock
```

If different, update `Dockerfile` and rebuild:
```dockerfile
RUN groupadd -g YOUR_GID docker || true && \
    usermod -aG docker jenkins
```

### Persistent Data
- **Volume**: `team4demo1_jenkins_home`
- **Path**: `/var/jenkins_home`
- **Contents**: Jobs, configurations, credentials, build history

### Ports
- **8080**: Jenkins web interface
- **50000**: Jenkins agent communication

## 📚 Documentation

- **Full Setup Guide**: [/docs/JENKINS_SETUP_GUIDE.md](/docs/JENKINS_SETUP_GUIDE.md)
- **Quick Reference**: [/docs/JENKINS_QUICK_REFERENCE.md](/docs/JENKINS_QUICK_REFERENCE.md)
- **Jira Ticket**: [/Jira_tickets.md](/Jira_tickets.md) (MFLP-84)

## 🔧 Troubleshooting

### Permission Denied on Docker Socket
```bash
# Check Docker GID
stat -c '%g' /var/run/docker.sock

# Rebuild if different from 999
make jenkins-down
docker compose -f docker-compose.jenkins.yaml build --no-cache
make jenkins-up
```

### Jenkins Won't Start
```bash
# Check logs
make jenkins-logs

# Common issues:
# - Port 8080 in use
# - Insufficient memory (needs ~2GB)
# - Corrupted volume (run: make jenkins-clean)
```

## 🔄 Maintenance

### Update Image
```bash
docker pull jenkins/jenkins:lts
docker compose -f docker-compose.jenkins.yaml build --no-cache
docker compose -f docker-compose.jenkins.yaml up -d
```

### Add Plugins
Edit `jenkins-plugin-cli` in `Dockerfile`, then rebuild.

### Backup
```bash
docker run --rm \
  -v team4demo1_jenkins_home:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/jenkins-backup-$(date +%Y%m%d).tar.gz /data
```

---

**Built For**: MFLP-84 - Jenkins CI/CD Pipeline  
**Maintainer**: Eduardo Abarca  
**Team**: Team 4 Demo 1
