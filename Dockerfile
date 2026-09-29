FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund
ENV PORT=3000
EXPOSE 3000
CMD ["node", "-e", "require('http').createServer((req,res)=>{res.end('ci')}).listen(3000,'0.0.0.0')"]
