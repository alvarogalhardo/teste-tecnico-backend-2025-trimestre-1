# Como Rodar o Projeto - API de Upload e Streaming de Vídeos

Este projeto implementa uma API para upload e streaming de vídeos com cache Redis e suporte a Range requests.

## 📋 Pré-requisitos

- **Docker** e **Docker Compose** instalados
- **Node.js 22+** (opcional, apenas para desenvolvimento local)
- **Git** para clonar o repositório

## 🚀 Executando com Docker (Recomendado)

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd teste-tecnico-backend-2025-trimestre-1
```

### 2. Build e execução dos containers
```bash
# Comando completo para rebuildar e subir
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```


### 4. Testar a aplicação
A API estará disponível em: `http://localhost:3000`

## 📡 Endpoints Disponíveis

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

### Streaming de Vídeo
```bash
GET /static/video/:filename

# Exemplo para download completo
curl http://localhost:3000/static/video/seu-video.mp4

# Exemplo com Range request (streaming)
curl -H "Range: bytes=0-1023" http://localhost:3000/static/video/seu-video.mp4
```

**Resposta:**
- `200 OK` - Arquivo completo
- `206 Partial Content` - Parte do arquivo (Range request)
- `404 Not Found` - Arquivo não encontrado
- `416 Range Not Satisfiable` - Range inválido

## 🛠️ Comandos Úteis

### Gerenciamento de Containers
```bash
# Parar todos os containers
docker-compose down

# Parar e remover volumes (dados do Redis)
docker-compose down -v

# Rebuildar sem cache
docker-compose build --no-cache

# Subir em modo detached (background)
docker-compose up -d

# Subir e ver logs em tempo real
docker-compose up
```

### Debug e Monitoramento
```bash
# Entrar no container da aplicação
docker-compose exec app sh

# Verificar conectividade com Redis
docker-compose exec redis redis-cli ping

# Monitorar logs em tempo real
docker-compose logs -f

# Ver apenas logs da aplicação
docker-compose logs -f app
```

### Limpeza do Sistema
```bash
# Remover containers, redes e imagens não utilizadas
docker system prune -a

# Remover apenas containers parados
docker container prune
```

## 🔧 Desenvolvimento Local (Opcional)

Se preferir rodar localmente para desenvolvimento:

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
# Criar arquivo .env
echo "REDIS_URL=redis://localhost:6379" > .env
```

### 3. Iniciar Redis localmente
```bash
# Com Docker
docker run -d -p 6379:6379 redis:7-alpine

# Ou instalar Redis localmente
```

### 4. Executar em modo desenvolvimento
```bash
# Compilar e executar
npm run build
npm run start

# Ou em modo watch
npm run start:dev
```

## 📊 Arquitetura do Sistema

### Componentes
- **API Node.js/NestJS** - Servidor principal na porta 3000
- **Redis** - Cache de vídeos com TTL de 60 segundos
- **Volume uploads** - Armazenamento persistente de arquivos

### Fluxo de Dados
1. **Upload**: Arquivo é salvo no disco e colocado no cache Redis
2. **Streaming**: Busca primeiro no Redis, depois no disco se não encontrar
3. **Cache**: TTL de 60 segundos, armazena arquivos em base64

## 🐛 Troubleshooting

### Problema: Containers não sobem
```bash
# Verificar se as portas estão em uso
netstat -an | grep :3000
netstat -an | grep :6379

# Parar processos conflitantes ou alterar portas no docker-compose.yml
```

### Problema: Redis não conecta
```bash
# Verificar logs do Redis
docker-compose logs redis

# Testar conectividade
docker-compose exec app sh -c "ping redis"
```

### Problema: Upload falha
```bash
# Verificar permissões do diretório uploads
docker-compose exec app ls -la /app/uploads

# Verificar logs da aplicação
docker-compose logs app
```

### Problema: Vídeo não carrega
```bash
# Verificar se arquivo existe
docker-compose exec app ls -la /app/uploads

# Verificar cache Redis
docker-compose exec redis redis-cli keys "*"
```

## 📝 Variáveis de Ambiente

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| `NODE_ENV` | Ambiente de execução | `production` |
| `REDIS_URL` | URL de conexão com Redis | `redis://redis:6379` |
| `PORT` | Porta da aplicação | `3000` |

## 🎯 Funcionalidades Implementadas

- ✅ Upload de vídeos com limite de 10MB
- ✅ Validação de tipo de arquivo (apenas vídeos)
- ✅ Streaming com suporte a Range requests
- ✅ Cache Redis com TTL de 60 segundos
- ✅ Sistema de arquivos intercambiável
- ✅ Containerização com Docker
- ✅ Tratamento de erros adequado
- ✅ Headers corretos para streaming de vídeo

## 📚 Tecnologias Utilizadas

- **Node.js 22** - Runtime JavaScript
- **NestJS** - Framework web
- **Redis** - Cache em memória
- **Docker** - Containerização
- **TypeScript** - Linguagem tipada
- **Multer** - Upload de