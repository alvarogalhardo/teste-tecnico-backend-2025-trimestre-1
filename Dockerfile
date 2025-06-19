FROM node:22-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY dist/ ./dist/

# Criar diretório para uploads
RUN mkdir -p /app/uploads

# Expor porta da aplicação
EXPOSE 3000

# Definir comando de inicialização
CMD ["node", "dist/main"]
