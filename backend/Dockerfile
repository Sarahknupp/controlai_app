# Imagem base
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Instalação de dependências
COPY package*.json ./
RUN npm ci --only=production

# Cópia do código fonte
COPY . .

# Compilação do TypeScript
RUN npm run build

# Exposição da porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"] 