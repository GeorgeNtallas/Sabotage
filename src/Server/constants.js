/**
 * Server Configuration & Game Constants
 */

// Server & CORS Configuration
const SERVER_CONFIG = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGINS: {
    production: ["https://68a3ab16b7a9ba00081ecd66--thesabotage.netlify.app"],
    development: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.1.85:3000",
    ],
  },
  SOCKET_METHODS: ["GET", "POST"],
};

// Room & Session Configuration
const ROOM_CONFIG = {
  ROOM_PASSWORD_LENGTH: 6,
  ROOM_SESSION_KEY_LENGTH: 8,
  ROOM_SESSION_KEY_CHARS:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
};

// Game Timing (milliseconds)
const GAME_TIMERS = {
  CHARACTER_ASSIGNMENT_DELAY: 4000,
  GAME_START_BROADCAST_DELAY: 2000,
  PHASE_TRANSITION_DELAY: 1000,
};

// Room Cleanup Configuration
const ROOM_CLEANUP = {
  CHECK_INTERVAL_MS: 10 * 60 * 1000, // 10 minutes
  EMPTY_GRACE_PERIOD_MS: 20 * 60 * 1000, // 20 minutes
};

// Game Rules - Mission Team Sizes by player count
const MISSION_TEAM_SIZES = {
  1: [1, 1, 1, 1, 1],
  2: [2, 2, 2, 2, 2],
  3: [2, 2, 2, 2, 2],
  4: [2, 2, 2, 2, 2],
  5: [2, 3, 2, 3, 3],
  6: [2, 3, 4, 3, 4],
  7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5],
  9: [3, 4, 4, 5, 5],
  10: [3, 4, 4, 5, 5],
};

// Game Rules - Role Balance by player count
const ROLE_BALANCE = {
  1: { good: 1, evil: 0 },
  2: { good: 1, evil: 1 },
  3: { good: 2, evil: 1 },
  4: { good: 2, evil: 2 },
  5: { good: 3, evil: 2 },
  6: { good: 4, evil: 2 },
  7: { good: 4, evil: 3 },
  8: { good: 5, evil: 3 },
  9: { good: 6, evil: 3 },
  10: { good: 6, evil: 4 },
};

// Character Definitions
const CHARACTERS = {
  Seer: {
    name: "Seer",
    team: "good",
    description: "Knows who the evil players are",
  },
  Guardian: {
    name: "Guardian",
    team: "good",
    description: "Knows who Seer and Seraphina are",
  },
  Knight: {
    name: "Knight",
    team: "good",
    description: "A Loyal Knight",
  },
  Seraphina: {
    name: "Seraphina",
    team: "evil",
    description: "Appears as Seer to Guardian",
  },
  Shade: {
    name: "Shade",
    team: "evil",
    description: "Can kill Seer at the end",
  },
  Thrall: {
    name: "Thrall",
    team: "evil",
    description: "A Dark Knight",
  },
  Draven: {
    name: "Draven",
    team: "evil",
    description: "Unknown for Seer",
  },
  Kaelen: {
    name: "Kaelen",
    team: "evil",
    description: "Unknown to evil. Does not know Evil",
  },
};

// Game Phases & Results
const GAME_PHASES = {
  MAX_PHASES: 5,
  WIN_THRESHOLD: 3, // First to 3 wins
  SPECIAL_PHASE: 4, // Phase 4 requires 2 fails for large games
  LARGE_GAME_MIN_PLAYERS: 7,
  LARGE_GAME_MAX_PLAYERS: 10,
};

// Socket Events
const SOCKET_EVENTS = {
  // Room Management
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
  CHECK_ROOM: "check-room",
  GET_ROOM_PLAYERS: "getRoomPlayers",
  EXIT: "exit",
  EXIT_GAME: "exit_game",

  // Game Flow
  START_GAME: "start_game",
  NEXT_ROUND: "next_round",
  NEXT_PHASE: "next_phase",

  // Voting
  PLAYER_PRESS_READY: "player_pressReady",
  VOTE_TEAM: "vote_team",
  LEADER_VOTE: "leader_vote",
  VOTE_QUEST: "vote_quest",
  RESULT_VOTES: "result_votes",

  // Server Broadcasts
  GAME_STARTED: "game_started",
  GAME_OVER: "game_over",
  CHARACTER_ASSIGNED: "character_assigned",
  ROUND_UPDATE: "round_update",
  TEAM_VOTED: "team_voted",
  QUEST_VOTED: "quest_voted",
  INFORM_RESULT: "inform_result",
  INFORM_PLAYERS_TO_VOTE: "inform_players_to_vote",
  LEADER_SELECTION_UPDATE: "leader_selection_update",
  LEADER_VOTED: "leader_voted",
  PLAYER_INFORMREADY: "player_informReady",
  PLAYER_RECONNECTED: "player_reconnected",
  PLAYER_LOGGED_OFF: "player_logged_off",
  ROOM_UPDATE: "room_update",
};

module.exports = {
  SERVER_CONFIG,
  ROOM_CONFIG,
  GAME_TIMERS,
  ROOM_CLEANUP,
  MISSION_TEAM_SIZES,
  ROLE_BALANCE,
  CHARACTERS,
  GAME_PHASES,
  SOCKET_EVENTS,
};
