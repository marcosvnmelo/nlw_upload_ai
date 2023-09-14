import { prisma } from '@/lib/prisma';
import { FastifyInstance } from 'fastify';

export async function getAllPromptsRoute(app: FastifyInstance) {
  app.get('/prompts', async () => {
    const prompts = await prisma.prompt.findMany();

    return prompts;
  });
}
