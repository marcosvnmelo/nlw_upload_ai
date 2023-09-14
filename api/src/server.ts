import { createTranscription } from '@/routes/create-transcription';
import { generateAICompletionRoute } from '@/routes/generate-ai-completion';
import { getAllPromptsRoute } from '@/routes/get-all-prompts';
import { uploadVideoRoute } from '@/routes/upload-video';
import fastifyCors from '@fastify/cors';
import { fastify } from 'fastify';

const app = fastify();

app.register(fastifyCors, {
  origin: '*',
});

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(createTranscription);
app.register(generateAICompletionRoute);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Server is running on port 3333');
  });
