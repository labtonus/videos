import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { limiter } from './middleware/rateLimiter.js';
import { createVideo, getVideoStatus } from './services/videoService.js';
import logger from './config/logger.js';

dotenv.config();

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

const PORT = process.env.PORT || 3000;

// Middleware de validação do Typeform
const validateTypeformPayload = (req, res, next) => {
  if (!req.body.form_response || !req.body.form_response.answers) {
    return res.status(400).json({
      success: false,
      error: 'Payload inválido do Typeform'
    });
  }
  next();
};

// Rotas
app.post('/webhook', validateTypeformPayload, async (req, res) => {
  try {
    const videoResponse = await createVideo(req.body);
    
    logger.info('Webhook processado com sucesso', {
      formId: req.body.form_response.form_id
    });

    res.json({
      success: true,
      message: 'Criação do vídeo iniciada com sucesso',
      data: videoResponse
    });
  } catch (error) {
    logger.error('Erro ao processar webhook:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao processar a requisição',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const videoStatus = await getVideoStatus(id);
    
    res.json({
      success: true,
      data: videoStatus
    });
  } catch (error) {
    logger.error('Erro ao buscar status do vídeo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar status do vídeo' 
    });
  }
});

// Middleware de erro global
app.use((err, req, res, next) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});