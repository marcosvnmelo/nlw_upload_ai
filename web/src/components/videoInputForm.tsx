import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getFFmpeg } from '@/lib/ffmpeg';
import { Icon } from '@iconify/react';
import { type ChangeEvent, useState, useMemo, FormEvent, useRef } from 'react';
import { Else, If, Then } from 'react-if';
import { fetchFile } from '@ffmpeg/util';
import { api } from '@/lib/axios';

type Status =
  | 'waiting'
  | 'converting'
  | 'uploading'
  | 'generating'
  | 'success'
  | 'error';

const statusMessages: Record<Status, string> = {
  waiting: 'Carregar vídeo',
  converting: 'Convertendo...',
  generating: 'Transcrevendo...',
  uploading: 'Carregando...',
  success: 'Sucesso!',
  error: 'Erro!',
};

const statusIcon: Record<Status, string> = {
  waiting: 'lucide:upload',
  converting: 'lucide:loader-2',
  generating: 'lucide:loader-2',
  uploading: 'lucide:loader-2',
  success: 'lucide:check',
  error: 'lucide:x',
};

interface VideoInputFormProps {
  onVideoUploaded: (id: string) => void;
}

export function VideoInputForm(props: VideoInputFormProps) {
  // * state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('waiting');

  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  // * computed
  const previewUrl = useMemo(() => {
    if (!videoFile) return null;

    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  // * handler
  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget;

    if (!files) return;

    const selectedFile = files[0];

    setVideoFile(selectedFile);
  }

  async function convertVideoToAudio(video: File) {
    console.log('Converting video to audio...');

    const ffmpeg = await getFFmpeg();

    await ffmpeg.writeFile('input.mp4', await fetchFile(video));

    ffmpeg.on('progress', progress => {
      console.log(`Convert progress: ${Math.round(progress.progress * 100)}%`);
    });

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20K',
      '-acodec',
      'libmp3lame',
      'output.mp3',
    ]);

    const data = await ffmpeg.readFile('output.mp3');

    const audioFileBlob = new Blob([data], { type: 'audio/mp3' });
    const audioFile = new File([audioFileBlob], 'audio.mp3', {
      type: 'audio/mp3',
    });

    console.log('Conversion finished!');

    return audioFile;
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = promptInputRef.current?.value;

    if (!videoFile) return;

    setStatus('converting');

    try {
      const audioFile = await convertVideoToAudio(videoFile);

      const data = new FormData();

      data.append('file', audioFile);

      setStatus('uploading');

      const response = await api.post('/videos', data);

      const videoId = response.data.video.id;

      setStatus('generating');

      await api.post(`/videos/${videoId}/transcription`, {
        prompt,
      });

      setStatus('success');

      props.onVideoUploaded(videoId);
    } catch (error) {
      setStatus('error');
    }
  }

  return (
    <form className='space-y-6' onSubmit={handleUploadVideo}>
      <label
        htmlFor='video'
        className='flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground hover:bg-primary/5'
      >
        <If condition={!!previewUrl}>
          <Then>
            {() => (
              <video
                src={previewUrl!}
                controls={false}
                className='pointer-events-none'
              />
            )}
          </Then>
          <Else>
            <Icon icon='lucide:file-video' className='h-4 w-4' />
            Selecione um vídeo
          </Else>
        </If>
      </label>
      <input
        type='file'
        id='video'
        accept='video/mp4'
        className='sr-only'
        onChange={handleFileSelected}
      />

      <Separator />

      <div className='space-y-2'>
        <Label htmlFor='transcription_prompt'>Prompt de transcrição</Label>
        <Textarea
          ref={promptInputRef}
          id='transcription_prompt'
          className='min-h-[1.25rem] leading-relaxed'
          placeholder='Inclua palavras-chave mencionadas no vídeo separadas pro vírgula (,)'
          disabled={status !== 'waiting'}
        />
      </div>

      <Button
        type='submit'
        disabled={status !== 'waiting'}
        data-loading={
          status !== 'waiting' && status !== 'success' && status !== 'error'
        }
        data-success={status === 'success'}
        data-error={status === 'error'}
        className='group w-full gap-2 data-[error=true]:bg-red-600 data-[success=true]:bg-emerald-400'
      >
        {statusMessages[status]}

        <Icon
          icon={statusIcon[status]}
          className='h-4 w-4 group-data-[loading=true]:animate-spin'
        />
      </Button>
    </form>
  );
}
