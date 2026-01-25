const ACTION_TYPES = {
  // Blokady globalne (Admin)
  USER_BLOCK_GLOBAL: "USER_BLOCK_GLOBAL",
  USER_UNBLOCK_GLOBAL: "USER_UNBLOCK_GLOBAL",

  // Blokady w tematach (Moderator)
  USER_BLOCK_TOPIC: "USER_BLOCK_TOPIC",
  USER_UNBLOCK_TOPIC: "USER_UNBLOCK_TOPIC",

  // Zarządzanie tematami
  CREATE_TOPIC: "CREATE_TOPIC",
  TOPIC_CLOSE: "TOPIC_CLOSE",
  TOPIC_HIDE: "TOPIC_HIDE",

  // Administracja użytkownikami
  USER_APPROVE: "USER_APPROVE",

  // Bezpieczeństwo
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
};

module.exports = {
  ACTION_TYPES,
};
