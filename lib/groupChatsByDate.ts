// lib/utils/groupChatsByDate.ts
export function groupChatsByDate(chats: any[]) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);

  return {
    today: chats.filter((chat) =>
      isSameDay(new Date(chat.createdAt), today)
    ),
    yesterday: chats.filter((chat) =>
      isSameDay(new Date(chat.createdAt), yesterday)
    ),
    lastWeek: chats.filter(
      (chat) =>
        new Date(chat.createdAt) > lastWeek &&
        !isSameDay(new Date(chat.createdAt), today) &&
        !isSameDay(new Date(chat.createdAt), yesterday)
    ),
    lastMonth: chats.filter(
      (chat) =>
        new Date(chat.createdAt) > lastMonth &&
        new Date(chat.createdAt) <= lastWeek
    ),
    older: chats.filter((chat) => new Date(chat.createdAt) < lastMonth),
  };
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}