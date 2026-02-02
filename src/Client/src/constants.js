/**
 * Client Configuration & Constants
 */

// API & Socket Configuration
export const API_CONFIG = {
  SOCKET_URL: process.env.REACT_APP_SERVER_URL || "http://localhost:4000",
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

export default {
  API_CONFIG,
  GAME_TIMERS,
  MISSION_TEAM_SIZES,
  SOCKET_EVENTS,
};
