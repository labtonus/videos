# Typeform to Shotstack Video Generator

Este serviço recebe webhooks do Typeform e gera vídeos personalizados usando Shotstack.

## Configuração

1. Crie um arquivo `.env` com suas credenciais da API Shotstack
2. Instale as dependências: `npm install`
3. Execute o servidor: `npm run dev`

## Endpoints

- POST `/webhook`: Recebe dados do Typeform e inicia a criação do vídeo
- GET `/video/:id`: Verifica o status da geração do vídeo

## Configuração do Webhook no Typeform

1. Acesse as configurações do seu formulário no Typeform
2. Vá para a seção "Connect" ou "Integrações"
3. Selecione "Webhooks"
4. Adicione a URL do seu servidor: `https://seu-servidor.com/webhook`
5. Mantenha o formato padrão do payload do Typeform

## Estrutura do Projeto

- `src/server.js`: Servidor Express com endpoints
- `src/videoService.js`: Lógica de geração de vídeos com Shotstack
- `.env`: Configurações e chaves de API