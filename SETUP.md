# Guia de Funcionamento - API de Upload e Streaming de Vídeos

Este projeto implementa uma API para upload e streaming de vídeos com cache Redis e suporte a Range requests.

## 📋 Pré-requisitos

- **Docker** e **Docker Compose** instalados

## 🚀 Como Executar

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd teste-tecnico-backend-2025-trimestre-1
```

### 2. Execute os containers

```bash
docker-compose up -d
```

### 3. A API estará disponível em

`http://localhost:3000`

## 📡 Como Usar a API

### Upload de Vídeo

```bash
POST /upload/video
Content-Type: multipart/form-data

# Exemplo com curl
curl -X POST \
  http://localhost:3000/upload/video \
  -F "video=@seu-video.mp4"
```

**Resposta:**

- `204 No Content` - Upload realizado com sucesso
- `400 Bad Request` - Arquivo não é um vídeo ou excede 10MB

### Assistir Vídeo (Streaming)

```bash
GET /static/video/:filename

# Exemplo para download completo
curl http://localhost:3000/static/video/seu-video.mp4

# Exemplo com streaming (usando Postman)
Adicione o header: Range: bytes=0-1023
```

**Resposta:**

- `200 OK` - Arquivo completo
- `206 Partial Content` - Streaming parcial
- `404 Not Found` - Arquivo não encontrado

## 🎯 Funcionalidades

- ✅ Upload de vídeos com limite de 10MB
- ✅ Validação de tipo de arquivo (apenas vídeos)
- ✅ Streaming com suporte a Range requests
- ✅ Cache Redis com TTL de 60 segundos
- ✅ Containerização com Docker
