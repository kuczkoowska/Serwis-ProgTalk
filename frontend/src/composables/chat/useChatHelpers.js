export const useChatHelpers = () => {
  const truncateMessage = (msg, maxLength = 40) => {
    return msg.length > maxLength ? msg.substring(0, maxLength) + "..." : msg;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    truncateMessage,
    formatTime,
    formatDate,
  };
};
