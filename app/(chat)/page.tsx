'use client';


import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { redirect, useSearchParams } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default function Page() {

  const [messages, setMessages] = useState([]);

  //get id from url query
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const chatId = "";
  const { loading, authenticated, user } = useAuth();
  

  console.log("user?.email========", id);


useEffect(() => {
  async function fetchMessages() {
    const res = await fetch('/api/conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    if (data.success) {
      setMessages(data.data);
    }
  }

  if (id) fetchMessages();
}, [id]);


  console.log("messages========", messages);

  return (
    <>
      <ClientOnly>
      <Chat
        key={id? id : chatId}
        id={id? id : chatId} 
        initialMessages={messages}
        initialChatModel={DEFAULT_CHAT_MODEL}
        initialVisibilityType="private"
        isReadonly={false}
        session={user}
        autoResume={false}
      />
      <DataStreamHandler />
      </ClientOnly>
      </>
  );
}
