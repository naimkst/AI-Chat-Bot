"use client"

import { notFound } from 'next/navigation';

import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { convertToUIMessages } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { prisma } from '@/lib/prisma';
import { useParams } from 'next/navigation';


export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { user }: any = useAuth();
  const params = useParams();
  const chatId = params?.id as string;


  console.log("chatId========", chatId)
  

  

  // if (!conversation) {
  //   notFound();
  // }


  return (
    <>
      <Chat
        id={chatId}
        initialMessages={[]}
        initialChatModel={DEFAULT_CHAT_MODEL}
        initialVisibilityType="private"
        isReadonly={false}
        session={user}
        autoResume={true}
      />
      <DataStreamHandler />
    </>
  );
}
