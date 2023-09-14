import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/axios';
import { useEffect, useState } from 'react';

interface Prompt {
  id: string;
  title: string;
  template: string;
}

interface PromptSelectProps {
  onPromptSelected: (template: string) => void;
}

export function PromptSelect(props: PromptSelectProps) {
  // * state
  const [prompts, setPrompts] = useState<Prompt[] | null>(null);

  // * handler
  function handlePromptSelected(promptId: string) {
    const prompt = prompts?.find(prompt => prompt.id === promptId);

    if (!prompt) {
      return;
    }

    props.onPromptSelected(prompt.template);
  }

  // * effect
  useEffect(() => {
    api.get('/prompts').then(response => {
      setPrompts(response.data);
    });
  }, []);

  return (
    <Select onValueChange={handlePromptSelected}>
      <SelectTrigger>
        <SelectValue placeholder='Selecione um prompt...' />
      </SelectTrigger>

      <SelectContent>
        {prompts?.map(prompt => (
          <SelectItem key={prompt.id} value={prompt.id}>
            {prompt.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
