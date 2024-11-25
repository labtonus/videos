import Shotstack from 'shotstack-sdk';

const shotstack = new Shotstack({
  apiKey: process.env.SHOTSTACK_API_KEY,
  host: process.env.SHOTSTACK_HOST
});

function createMergeFields(formData) {
  const mergeFields = {};
  
  // Converte os campos do Typeform em merge fields
  formData.form_response.answers.forEach(answer => {
    const fieldName = answer.field.ref.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    mergeFields[fieldName] = answer.text || answer.number || answer.email || answer.choice?.label || answer.choices?.labels.join(', ') || '';
  });

  return mergeFields;
}

export async function createVideo(formData) {
  const mergeFields = createMergeFields(formData);

  const timeline = {
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
                <div style="text-align: center; color: white; font-family: Arial;">
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
                }
                h2 { 
                  font-size: 40px; 
                  margin-bottom: 10px; 
                  color: #FFD700;
                }
                p { 
                  font-size: 30px; 
                  line-height: 1.4;
                }
              `,
              width: 1920,
              height: 1080
            },
            start: 0,
            length: 8,
            position: "center",
            offset: {
              y: 0
            }
          }
        ]
      }
    ]
  };

  const output = {
    format: "mp4",
    resolution: "1080",
    fps: 30,
    quality: "high"
  };

  const edit = {
    timeline,
    output,
    merge: mergeFields,
    callback: 'https://p7e3pi4k2naqgjo4la455g2tqy0ollaq.lambda-url.us-west-2.on.aws/'
  };

  try {
    const response = await shotstack.render(edit);
    return {
      id: response.response.id,
      status: response.response.status,
      message: 'Renderização do vídeo iniciada',
      mergeFields
    };
  } catch (error) {
    throw new Error(`Falha ao criar vídeo: ${error.message}`);
  }
}