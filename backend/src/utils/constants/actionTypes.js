const ACTION_TYPES = {
  // Blokady globalne (Admin)
  USER_BLOCK_GLOBAL: "USER_BLOCK_GLOBAL",
  USER_UNBLOCK_GLOBAL: "USER_UNBLOCK_GLOBAL",

  // Blokady w tematach (Moderator)
  USER_BLOCK_TOPIC: "USER_BLOCK_TOPIC",
  USER_UNBLOCK_TOPIC: "USER_UNBLOCK_TOPIC",

  // Zarządzanie tematami
  TOPIC_CREATE: "TOPIC_CREATE",
  TOPIC_CLOSE: "TOPIC_CLOSE",
  TOPIC_OPEN: "TOPIC_OPEN",
  TOPIC_HIDE: "TOPIC_HIDE",
  TOPIC_UNHIDE: "TOPIC_UNHIDE",

  // Zarządzanie moderatorami
  MODERATOR_ADD: "MODERATOR_ADD",
  MODERATOR_REMOVE: "MODERATOR_REMOVE",

  // Administracja użytkownikami
  USER_APPROVE: "USER_APPROVE",
  USER_REJECT: "USER_REJECT",
  TOPIC_OWNER_TRANSFER: "TOPIC_OWNER_TRANSFER",
  TOPIC_TAKEOVER: "TOPIC_TAKEOVER",

  // Bezpieczeństwo
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  EMAIL_VERIFIED: "EMAIL_VERIFIED",
};

const ACTION_LABELS = {
  USER_BLOCK_GLOBAL: "Globalna blokada użytkownika",
  USER_UNBLOCK_GLOBAL: "Odblokowanie użytkownika (globalnie)",
  USER_BLOCK_TOPIC: "Blokada użytkownika w temacie",
  USER_UNBLOCK_TOPIC: "Odblokowanie użytkownika w temacie",
  TOPIC_CREATE: "Utworzenie tematu",
  TOPIC_CLOSE: "Zamknięcie tematu",
  TOPIC_OPEN: "Otwarcie tematu",
  TOPIC_HIDE: "Ukrycie tematu",
  TOPIC_UNHIDE: "Odkrycie tematu",
  MODERATOR_ADD: "Dodanie moderatora",
  MODERATOR_REMOVE: "Usunięcie moderatora",
  USER_APPROVE: "Zatwierdzenie użytkownika",
  USER_REJECT: "Odrzucenie użytkownika",
  TOPIC_OWNER_TRANSFER: "Przeniesienie własności tematu",
  TOPIC_TAKEOVER: "Przejęcie tematu",
  LOGIN_FAILED: "Nieudane logowanie",
  LOGIN_SUCCESS: "Udane logowanie",
};

module.exports = {
  ACTION_TYPES,
  ACTION_LABELS,
};
