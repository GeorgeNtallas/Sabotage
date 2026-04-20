/**
 * Client Configuration & Constants
 */

// API & Socket Configuration
export const API_CONFIG = {
  SOCKET_URL:
    `http://${window.location.hostname}:4000` ||
    process.env.REACT_APP_SERVER_URL,
  SOCKET_TRANSPORTS: ["websocket"],
};

// Game Timings (milliseconds)
export const GAME_TIMERS = {
  PHASE_TRANSITION_DELAY: 1000,
  RESULT_DISPLAY_DELAY: 2000,
};

// Game Rules - Mission Team Sizes by player count
export const MISSION_TEAM_SIZES = {
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

export const ROLE_BALANCE = {
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

// Socket Events (for client -> server and listening)
export const SOCKET_EVENTS = {
  // Client -> Server
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
  CHECK_ROOM: "check-room",
  GET_ROOM_PLAYERS: "getRoomPlayers",
  PLAYER_PRESS_READY: "player_pressReady",
  START_GAME: "start_game",
  VOTE_TEAM: "vote_team",
  LEADER_VOTE: "leader_vote",
  VOTE_QUEST: "vote_quest",
  RESULT_VOTES: "result_votes",
  NEXT_ROUND: "next_round",
  NEXT_PHASE: "next_phase",
  EXIT: "exit",
  EXIT_GAME: "exit_game",

  // Server -> Client (listening)
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

// Game Phases & Results
export const GAME_PHASES = {
  MAX_PHASES: 5,
  WIN_THRESHOLD: 3, // First to 3 wins
  SPECIAL_PHASE: 4, // Phase 4 requires 2 fails for large games
  LARGE_GAME_MIN_PLAYERS: 7,
  LARGE_GAME_MAX_PLAYERS: 10,
};

// Character Definitions
export const CHARACTERS = {
  Seer: {
    name: "Seer",
    team: "good",
    description: "Knows who the evil players are",
    icon: "/images/SeerIcon.png",
    minPlayers: 5,
  },
  Guardian: {
    name: "Guardian",
    team: "good",
    description: "Knows who Seer and Seraphina are",
    icon: "/images/GuardianIcon.png",
    minPlayers: 6,
  },
  Knight: {
    name: "Knight",
    team: "good",
    description: "A Loyal Knight",
    icon: "/images/KnightIcon.png",
    minPlayers: 5,
  },
  Seraphina: {
    name: "Seraphina",
    team: "evil",
    description: "Appears as Seer to Guardian",
    icon: "/images/SeraphinaIcon.png",
    minPlayers: 6,
  },
  Shade: {
    name: "Shade",
    team: "evil",
    description: "Can kill Seer at the end",
    icon: "/images/ShadeIcon.png",
    minPlayers: 5,
  },
  Thrall: {
    name: "Thrall",
    team: "evil",
    description: "A Dark Knight",
    icon: "/images/ThrallIcon.png",
    minPlayers: 5,
  },
  Draven: {
    name: "Draven",
    team: "evil",
    description: "Unknown for Seer",
    icon: "/images/DravenIcon.png",
    minPlayers: 7,
  },
  Kaelen: {
    name: "Kaelen",
    team: "evil",
    description: "Unknown to evil. Does not know Evil",
    icon: "/images/KaelenIcon.png",
    minPlayers: 8,
  },
  Zealot: {
    name: "Zealot",
    team: "good",
    description: "Must vote two times, otherwise evil wins",
    icon: "/images/ZealotIcon.png",
    minPlayers: 7,
  },
  Illusionist: {
    name: "Illusionist",
    team: "evil",
    description: "Appears as good to seer and seraphina",
    icon: "/images/IllusionistIcon.png",
    minPlayers: 7,
  },
};

export default {
  API_CONFIG,
  GAME_TIMERS,
  MISSION_TEAM_SIZES,
  SOCKET_EVENTS,
  GAME_PHASES,
  CHARACTERS,
  ROLE_BALANCE,
};
