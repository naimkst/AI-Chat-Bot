"use client"

import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'next/navigation';


export default function Page() {
  const { user }: any = useAuth();
  const params = useParams();
  const chatId = params?.id as string;


  return (
    <>
      <Chat
        id={chatId}
        // @ts-ignore
        initialMessages={[]}
        initialChatModel={"gpt-4o"}
        initialVisibilityType="private"
        isReadonly={false}
        session={user}
        autoResume={true}
      />
      <DataStreamHandler />
    </>
  );
}
