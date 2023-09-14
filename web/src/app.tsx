import { PromptSelect } from '@/components/promptSelect';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { VideoInputForm } from '@/components/videoInputForm';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useCompletion } from 'ai/react';

export function App() {
  // * state
  const [temperature, setTemperature] = useState(0.5);
  const [videoId, setVideoId] = useState<string | null>(null);

  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading,
  } = useCompletion({
    api: 'http://localhost:3333/ai/complete',
    body: {
      videoId,
      temperature,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return (
    <div className='flex min-h-screen flex-col'>
      <header className='flex items-center gap-2 border-b px-6 py-3'>
        <img src='/favicon-32x32.png' alt='upload.ai' className='h-8 w-8' />
        <h1 className='text-xl font-bold'>upload.ai</h1>

        <div className='ms-auto flex items-center gap-3'>
          <span className='text-sm text-muted-foreground'>
            Desenvolvido com 💜 no NLW da Rocketseat
          </span>

          <Separator orientation='vertical' className='h-6' />

          <Button variant='outline' className='gap-2'>
            <Icon icon='lucide:github' className='h-4 w-4' />
            Github
          </Button>
        </div>
      </header>

      <main className='grid flex-1 grid-cols-4 grid-rows-2 gap-x-6 gap-y-4 p-6'>
        <Textarea
          className='col-start-1 col-end-4 row-start-1 row-end-1 resize-none p-4 leading-relaxed'
          placeholder='Inclua o prompt para a IA...'
          value={input}
          onChange={handleInputChange}
        />
        <Textarea
          className='col-start-1 col-end-4 row-start-2 row-end-2 resize-none p-4 leading-relaxed'
          placeholder='Resultado gerado pela IA...'
          value={completion}
          readOnly
        />

        <aside className='col-start-4 col-end-4 row-span-2 space-y-6'>
          <VideoInputForm onVideoUploaded={setVideoId} />

          <Separator />

          <form className='space-y-6' onSubmit={handleSubmit}>
            <div className='space-y-2'>
              <Label>Prompt</Label>

              <PromptSelect onPromptSelected={setInput} />
              <span className='block text-xs italic text-muted-foreground'>
                Você poderá customizar essa opção em breve
              </span>
            </div>

            <div className='space-y-2'>
              <Label>Modelo</Label>

              <Select disabled defaultValue='gpt3.5'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='gpt3.5'>GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>
              <span className='block text-xs italic text-muted-foreground'>
                Você poderá customizar essa opção em breve
              </span>
            </div>

            <Separator />

            <div className='space-y-4'>
              <Label>Temperatura</Label>

              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={([value]) => setTemperature(value)}
              />

              <span className='block text-xs italic leading-relaxed text-muted-foreground'>
                Valores mais altos tendem a deixar o resultado mais criativo e
                com possíveis erros
              </span>
            </div>

            <Separator />

            <Button type='submit' className='w-full gap-2' disabled={isLoading}>
              Executar
              <Icon icon='lucide:wand-2' className='h-4 w-4' />
            </Button>
          </form>
        </aside>
      </main>

      <p className='mx-6 -mt-2 mb-4 text-sm text-muted-foreground'>
        Lembre-se: você pode utilizar a variável{' '}
        <code className='text-violet-400'>{'{transcription}'}</code> no seu
        prompt para adicionar o conteúdo da transcrição do vídeo selecionado.
      </p>
    </div>
  );
}
