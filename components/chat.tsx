'use client';

import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import type { Attachment, ChatMessage } from '@/lib/types';

// ...all your imports remain the same...

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();
  const [dataStream, setDataStream] = useState<string>('');

  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<any>('ready');

  // Manual streaming send function (replacement for SDK)
  async function sendMessage(message: any) {
    setStatus('streaming');
    setDataStream('');
    let streamed = '';

    // ✅ Add user's message with text and image parts
    setMessages((msgs) => [
      ...msgs,
      {
        id: `${Date.now().toString()}-user`,
        role: 'user',
        parts: message.parts,
      },
    ]);

    // ✅ Add a placeholder for assistant message
    const assistantId = `${Date.now().toString()}-assistant`;
    setMessages((msgs) => [
      ...msgs,
      {
        id: assistantId,
        role: 'assistant',
        parts: [{ type: 'text', text: '' }],
      },
    ]);

    try {
      const formattedMessage = {
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'user',
            content: message.parts.map((part: any) =>
              part.type === 'file'
                ? {
                    type: 'image_url',
                    image_url: { url: part.url },
                  }
                : {
                    type: 'text',
                    text: part.text,
                  },
            ),
          },
        ],
        max_tokens: 300,
      };

      const resp = await fetch('/api/chat/chatGPT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: formattedMessage }),
      });

      if (!resp.body) return setStatus('idle');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;
        const chunk = decoder.decode(value || new Uint8Array());

        chunk.split('\n').forEach((line) => {
          if (line.startsWith('data: ')) {
            try {
              const obj = JSON.parse(line.slice(6));
              const token = obj.choices?.[0]?.delta?.content;
              if (token) {
                streamed += token;
                setDataStream((ds) => ds + token);

                // ✅ Update assistant message in-place
                setMessages((msgs) =>
                  msgs.map((msg) =>
                    msg.id === assistantId
                      ? {
                          ...msg,
                          parts: [{ type: 'text', text: streamed }],
                        }
                      : msg,
                  ),
                );
              }
            } catch (e) {
              console.error('JSON parse error:', e);
            }
          }
        });
      }

      setStatus('idle');
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    } catch (err: any) {
      setStatus('error');
      toast({
        type: 'error',
        description: err?.message || 'Unknown streaming error',
      });
    }
  }

  // You can leave these as no-ops or implement if needed:
  const stop = async () => {};
  const regenerate = async () => {};
  const resumeStream = async () => {};

  // Everything else in your component stays the same!

  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: query }],
        id: generateUUID(),
      });
      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
    // eslint-disable-next-line
  }, [query, sendMessage, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  // (Optional) For debug:
  // console.log("=============dataStream", dataStream);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={initialChatModel}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
          session={session}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          regenerate={regenerate}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              sendMessage={sendMessage}
              selectedVisibilityType={visibilityType}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
      />
    </>
  );
}
