FROM node:22-bookworm-slim
WORKDIR /app
ENV PORT=3000
EXPOSE 3000
CMD ["node", "-e", "require('http').createServer((req,res)=>{res.end('ok')}).listen(3000,'0.0.0.0')"]
