import ChatRoom from "./ChatRoom";

export default async function StudentChatRoomPage({
  params,
}: {
  params: Promise<{ chatroomId: string }>;
}) {
  const { chatroomId } = await params;
  return <ChatRoom chatroomId={chatroomId} />;
}
