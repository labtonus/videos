import shotstack from '../config/shotstack.js';
import logger from '../config/logger.js';

function sanitizeFieldName(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

function extractAnswerValue(answer) {
  if (answer.text) return answer.text;
  if (answer.number) return answer.number.toString();
  if (answer.email) return answer.email;
  if (answer.choice) return answer.choice.label;
  if (answer.choices) return answer.choices.labels.join(', ');
  return '';
}

function createMergeFields(formData) {
  try {
    const answers = formData.form_response.answers;
    if (!Array.isArray(answers)) {
      throw new Error('Formato de respostas inválido');
    }

    return answers.reduce((fields, answer) => {
      const fieldName = sanitizeFieldName(answer.field.ref);
      fields[fieldName] = extractAnswerValue(answer);
      return fields;
    }, {});
  } catch (error) {
    logger.error('Erro ao criar merge fields:', error);
    throw new Error('Falha ao processar respostas do formulário');
  }
}

function createVideoTimeline(mergeFields) {
  return {
    soundtrack: {
      src: "https://templates.shotstack.io/basic/audio/upbeat.mp3",
      effect: "fadeInFadeOut"
    },
    background: "#000000",
    tracks: [
      {
        clips: [
          {
            asset: {
              type: "html",
              html: `
                <div style="text-align: center; color: white; font-family: 'Arial', sans-serif;">
                  {{#each answers}}
                  <div class="answer-field">
                    <h2>{{@key}}</h2>
                    <p>{{this}}</p>
                  </div>
                  {{/each}}
                </div>
              `,
              css: `
                .answer-field { 
                  margin-bottom: 30px; 
                  opacity: 0; 
                  animation: fadeIn 0.5s ease-in forwards;
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                h2 { 
                  font-size: 40px; 
                  margin-bottom: 10px; 
                  color: #FFD700;
                  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                }
                p { 
                  font-size: 30px; 
                  line-height: 1.4;
                  color: #FFFFFF;
                }
              `,
              width: 1920,
              height: 1080
            },
            start: 0,
            length: 10,
            transition: {
              in: "fade",
              out: "fade"
            },
            position: "center",
            offset: {
              y: 0
            }
          }
        ]
      }
    ]
  };
}

export async function createVideo(formData) {
  try {
    const mergeFields = createMergeFields(formData);
    
    const edit = {
      timeline: createVideoTimeline(mergeFields),
      output: {
        format: "mp4",
        resolution: "1080",
        fps: 30,
        quality: "high"
      },
      merge: mergeFields,
      callback: process.env.CALLBACK_URL
    };

    const response = await shotstack.render(edit);
    
    logger.info('Vídeo iniciado com sucesso', {
      id: response.response.id,
      formId: formData.form_response.form_id
    });

    return {
      id: response.response.id,
      status: response.response.status,
      message: 'Renderização do vídeo iniciada com sucesso',
      mergeFields
    };
  } catch (error) {
    logger.error('Erro na criação do vídeo:', error);
    throw new Error(`Falha ao criar vídeo: ${error.message}`);
  }
}

export async function getVideoStatus(id) {
  try {
    const response = await shotstack.getRender(id);
    return response.response;
  } catch (error) {
    logger.error('Erro ao verificar status do vídeo:', error);
    throw new Error(`Falha ao verificar status do vídeo: ${error.message}`);
  }
}