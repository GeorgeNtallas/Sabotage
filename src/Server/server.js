/**
 * Sabotage Game Server
 *
 * Real-time multiplayer game server using Socket.IO for WebSocket communication
 * and MongoDB for persistent game state storage.
 *
 * Key Features:
 * - Room-based game isolation with password protection
 * - Asymmetric player roles with visibility-based information hiding
 * - Real-time voting mechanisms for team selection and quest completion
 * - Automatic room cleanup with grace period for disconnected players
 * - Player reconnection support with session key persistence
 *
 * Architecture:
 * - Express.js HTTP server with Socket.IO for WebSocket upgrade
 * - MongoDB Mongoose models for Room persistence
 * - Winston logger for structured error logging with file/line tracking
 * - In-memory maps for socket-to-player routing (not persistent game state)
 *
 * Environment Variables (from .env):
 * - NODE_ENV: 'development' or 'production'
 * - PORT: Server port (default 4000)
 * - MONGODB_URI: MongoDB connection string
 *
 * Constants (from ./constants.js):
 * - SERVER_CONFIG: Port, NODE_ENV, CORS origins, socket methods
 * - ROOM_CONFIG: Password/key generation settings
 * - GAME_TIMERS: Timeouts for character assignment, game start, phase transitions
 * - ROOM_CLEANUP: Cleanup interval and empty room grace period
 * - MISSION_TEAM_SIZES: Team sizes for each phase per player count
 * - ROLE_BALANCE: Good vs evil character distribution per player count
 * - CHARACTERS: 8 character definitions with team and abilities
 * - GAME_PHASES: Game phase constants (max 5 phases)
 * - SOCKET_EVENTS: Event name constants for emit/listen operations
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const logger = require("./logger");

require("dotenv").config();
const { connectDB, Room } = require("./db");
const {
  SERVER_CONFIG,
  ROOM_CONFIG,
  GAME_TIMERS,
  ROOM_CLEANUP,
  MISSION_TEAM_SIZES,
  ROLE_BALANCE,
  CHARACTERS,
  GAME_PHASES,
  SOCKET_EVENTS,
} = require("./constants");

connectDB()
  .then(async () => {
    // Delete all rooms on startup (no players should be connected yet)
    try {
      const res = await Room.deleteMany({});
      logger.info("Deleted all rooms on startup");
    } catch (err) {
      logger.error("Failed to delete rooms on startup", {
        error: err.message,
        stack: err.stack,
      });
    }
  })

  .catch((err) => {
    logger.error("Failed to connect to DB", {
      error: err.message,
      stack: err.stack,
    });
  });

// Minimal in-memory maps for socket routing only (not game state)
const playerSocketByPlayerSessionKey = new Map(); // playerSessionKey -> socket.id
const socketToPlayer = new Map(); // socket.id -> { roomSessionKey, playerSessionKey }

//Loads a room from the database by its session key
async function loadRoom(roomSessionKey) {
  if (!roomSessionKey) return null;
  return await Room.findOne({ roomSessionKey }).lean();
}

//Saves or deletes a room in the database
async function saveRoomToDb(roomSessionKey, roomObj) {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  if (!roomObj) {
    try {
      await Room.deleteOne({ roomSessionKey });
      logger.info("Deleted room from DB", { roomSessionKey });
    } catch (err) {
      logger.error("Failed to delete room from DB", {
        error: err.message,
        stack: err.stack,
      });
    }

    return;
  }

  const doc = { ...roomObj, roomSessionKey };

  try {
    await Room.findOneAndUpdate({ roomSessionKey }, doc, { upsert: true });
    logger.info("Saved room to DB", { roomSessionKey });
  } catch (err) {
    logger.error("Failed to save room to DB", {
      error: err.message,
      stack: err.stack,
    });
  }
}

const app = express();
const server = http.createServer(app);

const allowedOrigins =
  SERVER_CONFIG.NODE_ENV === "production"
    ? SERVER_CONFIG.CORS_ORIGINS.production
    : SERVER_CONFIG.CORS_ORIGINS.development;

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: SERVER_CONFIG.SOCKET_METHODS,
    credentials: true,
  },
});

app.use(
  cors({
    origin: allowedOrigins,
    methods: SERVER_CONFIG.SOCKET_METHODS,
    credentials: true,
  }),
);

io.use(async (socket, next) => {
  const { roomSessionKey, playerSessionKey } = socket.handshake.auth;

  if (!roomSessionKey || !playerSessionKey) {
    return next();
  }

  socket.roomSessionKey = roomSessionKey;
  socket.playerSessionKey = playerSessionKey;

  try {
    const room = await loadRoom(roomSessionKey);
    if (!room || !room.players || !room.players[playerSessionKey]) {
      return next(new Error("Invalid room or player session keys"));
    }
    logger.info("Connected to room", { roomSessionKey, playerSessionKey });
    return next();
  } catch (err) {
    logger.error("Error during socket authentication", {
      error: err.message,
      stack: err.stack,
    });
    return next(err);
  }
});

// Checks if a room password is already in use
async function isroomPasswordUsed(id) {
  if (!id) return false;
  const doc = await Room.findOne({ roomPassword: id }).lean();
  return !!doc;
}

// Generates a unique room password (6-digit numeric string)
const generateRoomPassword = async () => {
  const length = ROOM_CONFIG.ROOM_PASSWORD_LENGTH;
  let id;
  do {
    let s = "";
    while (s.length < length) s += crypto.randomInt(0, 10).toString();
    id = s.slice(0, length);
  } while (await isroomPasswordUsed(id));
  return id;
};

// Generates a unique room session key (8-character alphanumeric string)
const generateRoomSessionKey = () => {
  const chars = ROOM_CONFIG.ROOM_SESSION_KEY_CHARS;
  return Array.from(
    { length: ROOM_CONFIG.ROOM_SESSION_KEY_LENGTH },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
};

// Calculates the visible role of a player based on their character and the target character
const calculateVisibleRole = (viewerCharacter, targetCharacter) => {
  if (!viewerCharacter || !targetCharacter) return "";
  const viewer = viewerCharacter.name;
  const target = targetCharacter.name;
  const targetTeam = targetCharacter.team;

  if (viewer === "Seer" && targetTeam === "evil" && target !== "Draven")
    return "evil";
  if (viewer === "Guardian" && (target === "Seer" || target === "Seraphina"))
    return "Seer/Seraphina";
  if (
    ["Seraphina", "Shade", "Thrall", "Draven"].includes(viewer) &&
    target !== "Kaelen" &&
    targetTeam === "evil"
  )
    return "evil";
  if (viewer === "Kaelen" && targetTeam === "good") return "good";
  return "";
};

// Finds a room session key by its password
async function findRoomSessionKeyByroomPassword(roomPassword) {
  const doc = await Room.findOne({ roomPassword }).lean();
  return doc ? doc.roomSessionKey : null;
}

// Initializes a new room object with default values
const initializeRoom = (roomSessionKey) => ({
  roomPassword: null,
  players: {},
  ready: [],
  characters: {},
  gameStarted: false,
  roundLeader: null,
  round: 1,
  phase: 1,
  usedLeaders: [],
  voting: null,
  questVoting: null,
  votedPlayers: [],
  final_result: {
    1: { votes: { success: 0, fail: 0 }, result: [] },
    2: { votes: { success: 0, fail: 0 }, result: [] },
    3: { votes: { success: 0, fail: 0 }, result: [] },
    4: { votes: { success: 0, fail: 0 }, result: [] },
    5: { votes: { success: 0, fail: 0 }, result: [] },
  },
  transitioning: false,
  roomSessionKey,
});

io.on("connection", (socket) => {
  (async () => {
    const { roomSessionKey, playerSessionKey } = socket.handshake.auth;

    // Rejoin
    if (roomSessionKey && playerSessionKey) {
      const room = await loadRoom(roomSessionKey);
      if (room && room.players && room.players[playerSessionKey]) {
        const player = room.players[playerSessionKey];
        player.id = socket.id;
        // persist the player id for presence (optional)
        await saveRoomToDb(roomSessionKey, room);

        playerSocketByPlayerSessionKey.set(playerSessionKey, socket.id);
        socketToPlayer.set(socket.id, { roomSessionKey, playerSessionKey });

        socket.join(roomSessionKey);

        // broadcast current room player list so UIs refresh names/online flags
        const playerListForRoomUpdate = Object.values(room.players || {}).map(
          (p) => ({
            name: p.name,
            playerSessionKey: p.playerSessionKey,
            online: !!p.id,
          }),
        );
        io.to(roomSessionKey).emit("room_update", {
          playerList: playerListForRoomUpdate,
        });

        if (
          room.waitingForReconnect &&
          room.waitingForReconnect.playerSessionKey === playerSessionKey
        ) {
          delete room.waitingForReconnect;

          try {
            await saveRoomToDb(roomSessionKey, room).catch(console.error);
            logger.info("Deleted waitingForReconnect for player", {
              playerSessionKey,
            });
          } catch (err) {
            logger.error("Failed to delete waitingForReconnect", {
              error: err.message,
              stack: err.stack,
            });
          }

          io.to(roomSessionKey).emit("player_reconnected");

          // broadcast updated round/phase after reconnect so clients resume consistent state
          io.to(roomSessionKey).emit("round_update", {
            source: "rejoin_broadcast",
            roundLeader: room.roundLeader,
            round: room.round,
            phase: room.phase,
            missionTeamSizes:
              MISSION_TEAM_SIZES[Object.keys(room.players).length][
                room.phase - 1
              ],
            totalTeamSize: MISSION_TEAM_SIZES[Object.keys(room.players).length],
            gameStarted: room.gameStarted,
          });
        }

        // build players list with visibility relative to this rejoining player's character (if available)
        const viewerChar = room.characters
          ? room.characters[playerSessionKey]
          : null;
        const playersWithRoles = Object.values(room.players || {}).map((p) => ({
          name: p.name,
          playerSessionKey: p.playerSessionKey,
          visibleRole:
            viewerChar && room.characters && room.characters[p.playerSessionKey]
              ? calculateVisibleRole(
                  viewerChar,
                  room.characters[p.playerSessionKey],
                )
              : "",
        }));

        socket.emit("character_assigned", {
          character: room.characters ? room.characters[playerSessionKey] : null,
          players: playersWithRoles,
          gameCharacters: room.characters ? Object.values(room.characters) : [],
        });

        socket.emit("round_update", {
          source: "rejoin_individual",
          roundLeader: room.roundLeader,
          round: room.round,
          phase: room.phase,
          missionTeamSizes:
            MISSION_TEAM_SIZES[Object.keys(room.players).length][
              room.phase - 1
            ],
          totalTeamSize: MISSION_TEAM_SIZES[Object.keys(room.players).length],
          gameStarted: room.gameStarted,
        });
      }
    }

    /**
     * Socket: create-room
     * Creates a new room with a generated session key
     * Emits: room-created
     */
    socket.on("create-room", () => {
      try {
        const createdroomSessionKey = generateRoomSessionKey();
        socket.emit("room-created", createdroomSessionKey);
        logger.info("Created room", { roomSessionKey: createdroomSessionKey });
      } catch (err) {
        logger.error("Failed to create room", {
          error: err.message,
          stack: err.stack,
        });
      }
    });

    /**
     * Socket: check-room
     * Validates if a room exists and player isn't already in it
     * Emits: room-exists or join-error
     */
    socket.on("check-room", async (roomSessionKey) => {
      try {
        const room = await loadRoom(roomSessionKey);
        if (!room) {
          socket.emit("join-error", { message: "Room does not exist" });
        } else if (
          Object.values(room.players || {}).some((p) => p.id === socket.id)
        ) {
          socket.emit("join-error", { message: "Already in room" });
        } else {
          socket.emit("room-exists", true);
        }
        logger.info("Checked room", { roomSessionKey });
      } catch (err) {
        logger.error("Failed to check room", {
          error: err.message,
          stack: err.stack,
        });
      }
    });

    // Gets all available character definitions
    const getAllCharacters = () => CHARACTERS;

    // Shuffles an array in-place using Fisher-Yates algorithm
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    // Build game characters list for the room based on role balance and selections
    const buildGameCharacters = (selectedRoles, playerCount, allCharacters) => {
      const gameCharacters = [];
      const balance = ROLE_BALANCE[playerCount];

      if (selectedRoles && Array.isArray(selectedRoles)) {
        selectedRoles.forEach((role) => {
          if (allCharacters[role]) gameCharacters.push(allCharacters[role]);
        });
      }

      const currentGood = gameCharacters.filter(
        (c) => c.team === "good",
      ).length;
      const currentEvil = gameCharacters.filter(
        (c) => c.team === "evil",
      ).length;
      const neededGood = Math.max(0, balance.good - currentGood);
      const neededEvil = Math.max(0, balance.evil - currentEvil);

      for (let i = 0; i < neededEvil; i++)
        gameCharacters.push(allCharacters["Thrall"]);
      for (let i = 0; i < neededGood; i++)
        gameCharacters.push(allCharacters["Knight"]);

      return shuffleArray(gameCharacters);
    };

    // Assigne Roles to players
    const assignCharactersToPlayers = async (
      playerList,
      gameCharacters,
      room,
      roomSessionKey,
    ) => {
      playerList.forEach((player, index) => {
        const character = gameCharacters[index];
        room.characters[player.playerSessionKey] = character;

        setTimeout(() => {
          const playersWithRoles = playerList.map((p) => ({
            name: p.name,
            playerSessionKey: p.playerSessionKey,
            visibleRole: calculateVisibleRole(
              character,
              room.characters[p.playerSessionKey],
            ),
          }));

          io.to(player.id).emit("character_assigned", {
            character,
            players: playersWithRoles,
            gameCharacters: gameCharacters,
          });
        }, GAME_TIMERS.CHARACTER_ASSIGNMENT_DELAY);
      });
      // always persist after assigning characters
      try {
        await saveRoomToDb(roomSessionKey, room);
        logger.info("Saved room to DB", { roomSessionKey });
      } catch (err) {
        logger.info("Failed to save room to DB", {
          roomSessionKey,
          error: err.message,
        });
      }
    };

    // Initialaze the room parameters
    const initializeGameState = (room, playerList, roomSessionKey) => {
      const randomIndex = Math.floor(Math.random() * playerList.length);
      room.roundLeader = playerList[randomIndex].playerSessionKey;
      room.usedLeaders = [room.roundLeader];
      room.gameStarted = true;
      room.round = 1;
      room.phase = 1;

      io.to(roomSessionKey).emit("game_started");

      setTimeout(() => {
        io.to(roomSessionKey).emit("round_update", {
          source: "game_start_broadcast",
          roundLeader: room.roundLeader,
          round: room.round,
          phase: room.phase,
          missionTeamSizes: MISSION_TEAM_SIZES[playerList.length][0],
          totalTeamSize: MISSION_TEAM_SIZES[playerList.length],
          gameStarted: room.gameStarted,
        });
      }, GAME_TIMERS.GAME_START_BROADCAST_DELAY);
      return room;
    };

    /**
     * Socket: create_room
     * Creates a room as the first player (room leader)
     * Params: name (string) - Player's display name
     * Callback: {roomPassword, roomSessionKey, playerSessionKey, isLeader}
     */
    socket.on("create_room", async (name, callback) => {
      try {
      } catch (err) {}
      if (!name?.trim()) return callback({ error: "Name is required" });

      const roomSessionKey = crypto.randomUUID();
      const playerSessionKey = crypto.randomUUID();
      const roomPassword = await generateRoomPassword();

      const roomObj = initializeRoom(roomSessionKey);
      roomObj.roomPassword = roomPassword;
      roomObj.leader = playerSessionKey;
      roomObj.players[playerSessionKey] = {
        id: socket.id,
        playerSessionKey,
        name,
      };

      try {
        await saveRoomToDb(roomSessionKey, roomObj).catch(console.error);
        logger.info("Saved new room", { roomSessionKey, playerSessionKey });
      } catch (err) {
        logger.error("Failed to save new room", {
          roomSessionKey,
          playerSessionKey,
          error: err.message,
        });
      }

      playerSocketByPlayerSessionKey.set(playerSessionKey, socket.id);
      socketToPlayer.set(socket.id, { roomSessionKey, playerSessionKey });
      socket.join(roomSessionKey);

      callback({
        roomPassword,
        roomSessionKey,
        playerSessionKey,
        isLeader: true,
      });
    });

    /**
     * Socket: join_room
     * Joins an existing room or reclaims an offline player session
     * Params: {name, roomPassword}
     * Callback: {roomSessionKey, playerSessionKey, isLeader, gameStarted}
     */
    socket.on("join_room", async ({ name, roomPassword }, callback) => {
      try {
        if (!name?.trim()) return callback({ error: "Name is required" });
        const roomSessionKey =
          await findRoomSessionKeyByroomPassword(roomPassword);
        const room = await loadRoom(roomSessionKey);

        if (!room) return callback({ error: "Room not found" });
        if (room.roomPassword !== roomPassword)
          return callback({ error: "Invalid room roomPassword" });

        // Try to find an existing player with the same name (case-insensitive)
        const playerEntry = Object.entries(room.players || {}).find(
          ([, p]) => p.name && p.name.toLowerCase() === name.toLowerCase(),
        );

        // If game already started and this is not a reclaim of an offline player, block join
        if (room.gameStarted && (!playerEntry || playerEntry[1].id)) {
          return callback({ error: "Game has already started" });
        }

        let playerSessionKey;
        if (playerEntry) {
          const [psk, playerObj] = playerEntry;
          // If the player is currently online, the name is taken
          if (playerObj.id) {
            return callback({ error: "Name already taken in this room" });
          }
          // Reclaim offline player's session
          playerSessionKey = psk;
          room.players[playerSessionKey].id = socket.id;
        } else {
          // New player joining
          playerSessionKey = crypto.randomUUID();
          room.players[playerSessionKey] = {
            id: socket.id,
            playerSessionKey,
            name,
          };
        }

        try {
          await saveRoomToDb(roomSessionKey, room);
          logger.info("Saved room to DB", { roomSessionKey });
        } catch (err) {
          logger.info("Failed to save room to DB", {
            roomSessionKey,
            error: err.message,
          });
        }

        playerSocketByPlayerSessionKey.set(playerSessionKey, socket.id);
        socketToPlayer.set(socket.id, { roomSessionKey, playerSessionKey });
        socket.join(roomSessionKey);

        // if this was a reclaim of an offline session, clear waiting flag and notify everyone
        if (
          room.waitingForReconnect &&
          room.waitingForReconnect.playerSessionKey === playerSessionKey
        ) {
          delete room.waitingForReconnect;

          try {
            await saveRoomToDb(roomSessionKey, room).catch(console.error);
            logger.info("Saved room to DB", { roomSessionKey });
          } catch (err) {
            logger.info("Failed to save room to DB", {
              roomSessionKey,
              error: err.message,
            });
          }

          io.to(roomSessionKey).emit("player_reconnected");
          io.to(roomSessionKey).emit("round_update", {
            source: "join_reconnect",
            roundLeader: room.roundLeader,
            round: room.round,
            phase: room.phase,
            missionTeamSizes:
              MISSION_TEAM_SIZES[Object.keys(room.players).length][
                (room.phase || 1) - 1
              ],
            totalTeamSize: MISSION_TEAM_SIZES[Object.keys(room.players).length],
            gameStarted: room.gameStarted,
          });
        }

        const isLeader = room.leader === playerSessionKey;
        callback({
          roomSessionKey,
          playerSessionKey,
          isLeader,
          gameStarted: room.gameStarted,
        });

        // Broadcast updated player list to all players in the room (for lobby refresh)
        const playerList = Object.values(room.players || {}).map((p) => ({
          name: p.name,
          playerSessionKey: p.playerSessionKey,
          online: !!p.id,
        }));
        io.to(roomSessionKey).emit("room_update", { playerList });

        // Send game state if game is active and player has character
        if (
          room.gameStarted &&
          room.characters &&
          room.characters[playerSessionKey]
        ) {
          const viewerChar = room.characters[playerSessionKey];
          const playersWithRoles = Object.values(room.players || {}).map(
            (p) => ({
              name: p.name,
              playerSessionKey: p.playerSessionKey,
              visibleRole:
                viewerChar && room.characters[p.playerSessionKey]
                  ? calculateVisibleRole(
                      viewerChar,
                      room.characters[p.playerSessionKey],
                    )
                  : "",
            }),
          );

          // Add delay to ensure client has set up socket listeners
          setTimeout(() => {
            const allResults = Object.values(room.final_result)
              .map((p) => p.result)
              .flat();
            const goodWins = allResults.filter((r) => r === "success").length;
            const evilWins = allResults.filter((r) => r === "fail").length;

            socket.emit("character_assigned", {
              character: room.characters[playerSessionKey],
              players: playersWithRoles,
              gameCharacters: Object.values(room.characters),
            });

            socket.emit("round_update", {
              source: "next_round",
              roundLeader: room.roundLeader,
              round: room.round,
              phase: room.phase,
              missionTeamSizes:
                MISSION_TEAM_SIZES[Object.keys(room.players).length][
                  (room.phase || 1) - 1
                ],
              totalTeamSize:
                MISSION_TEAM_SIZES[Object.keys(room.players).length],
              gameStarted: room.gameStarted,
            });
          }, 500);
        }
        logger.info("Joined room", { roomSessionKey, playerSessionKey });
      } catch (err) {
        logger.info("Error joining room", { error: err.message });
      }
    });

    /**
     * Socket: getRoomPlayers
     * Retrieves current list of players and ready status in a room
     * Params: {roomSessionKey}
     * Callback: {roomPlayers, roomLeader, readyList}
     */
    socket.on("getRoomPlayers", async ({ roomSessionKey }, callback) => {
      try {
        const room = await loadRoom(roomSessionKey);
        if (!room) return;
        const playerList = Object.values(room.players || {}).map((player) => ({
          name: player.name,
          playerSessionKey: player.playerSessionKey,
        }));
        const readyList = room.ready;
        callback({
          roomPlayers: playerList,
          roomLeader: room.leader,
          readyList: readyList,
        });
        logger.info("Got room players", { roomSessionKey });
      } catch (err) {
        logger.info("Error getting room players", { error: err.message });
      }
    });

    /**
     * Socket: player_pressReady
     * Marks a player as ready to start the game
     * Params: playerSessionKey, roomSessionKey
     * Emits: player_informReady
     */
    socket.on("player_pressReady", async (playerSessionKey, roomSessionKey) => {
      try {
        const room = await loadRoom(roomSessionKey);
        if (!room || !room.players[playerSessionKey]) return;
        room.ready = room.ready || [];
        if (!room.ready.includes(playerSessionKey)) {
          room.ready.push(playerSessionKey);
          io.to(roomSessionKey).emit("player_informReady", playerSessionKey);

          try {
            await saveRoomToDb(roomSessionKey, room);
            logger.info("Saved room to DB", { roomSessionKey });
          } catch (err) {
            logger.info("Failed to save room to DB", {
              roomSessionKey,
              error: err.message,
            });
          }
        }
        logger.info("Player pressed ready", {
          playerSessionKey,
          roomSessionKey,
        });
      } catch (err) {
        logger.info("Error getting room players", { error: err.message });
      }
    });

    /**
     * Socket: start_game
     * Starts the game - only room leader can initiate
     * Assigns characters to players with visibility rules
     * Params: {roomSessionKey, selectedRoles}
     * Emits: game_started, round_update, character_assigned
     */
    socket.on("start_game", async ({ roomSessionKey, selectedRoles }) => {
      try {
        const room = await loadRoom(roomSessionKey);
        if (!room) return;

        // Check if current player is the leader
        const currentPlayer = Object.values(room.players).find(
          (p) => p.id === socket.id,
        );
        if (!currentPlayer || currentPlayer.playerSessionKey !== room.leader)
          return;

        if ((room.ready || []).length >= 1) {
          const allCharacters = getAllCharacters();
          const playerList = shuffleArray(Object.values(room.players));
          const gameCharacters = buildGameCharacters(
            selectedRoles,
            playerList.length,
            allCharacters,
          );

          await assignCharactersToPlayers(
            playerList,
            gameCharacters,
            room,
            roomSessionKey,
          );
          const roomFinal = initializeGameState(
            room,
            playerList,
            roomSessionKey,
          );
          // persist full game start state
          try {
            await saveRoomToDb(roomSessionKey, roomFinal);
            logger.info("Saved room to DB", { roomSessionKey });
          } catch (err) {
            logger.info("Failed to save room to DB", {
              roomSessionKey,
              error: err.message,
            });
          }
        }
        logger.info("Game started", { roomSessionKey });
      } catch (err) {
        logger.info("Error getting room players", { error: err.message });
      }
    });

    /**
     * Socket: vote_team
     * Records team voting from a player - selects highest voted players for quest
     * When all players vote, determines the quest team based on vote counts
     * Params: {roomSessionKey, playerSessionKey, selectedPlayers}
     * Emits: team_voted
     */
    socket.on(
      "vote_team",
      async ({ roomSessionKey, playerSessionKey, selectedPlayers }) => {
        try {
          const room = await loadRoom(roomSessionKey);
          if (!room) return;

          room.voting = room.voting || { playerVotes: {}, votersWhoVoted: [] };

          selectedPlayers.forEach((psk) => {
            room.voting.playerVotes[psk] =
              (room.voting.playerVotes[psk] || 0) + 1;
          });

          if (!room.voting.votersWhoVoted.includes(playerSessionKey))
            room.voting.votersWhoVoted.push(playerSessionKey);

          const totalPlayers = Object.keys(room.players).length;
          const votedCount = room.voting.votersWhoVoted.length;

          if (votedCount === totalPlayers) {
            const sortedVotes = Object.entries(room.voting.playerVotes).sort(
              ([, a], [, b]) => b - a,
            );
            const voteSize =
              MISSION_TEAM_SIZES[totalPlayers][(room.phase || 1) - 1];
            const questTeam = sortedVotes
              .slice(0, voteSize)
              .map(([psk]) => psk);

            io.to(roomSessionKey).emit("team_voted", {
              success: true,
              team: questTeam,
              votes: room.voting.playerVotes,
            });

            room.voting = null;

            try {
              await saveRoomToDb(roomSessionKey, room);
              logger.info("Saved room to DB", { roomSessionKey });
            } catch (err) {
              logger.info("Failed to save room to DB", {
                roomSessionKey,
                error: err.message,
              });
            }
          } else {
            try {
              await saveRoomToDb(roomSessionKey, room);
              logger.info("Saved room to DB", { roomSessionKey });
            } catch (err) {
              logger.info("Failed to save room to DB", {
                roomSessionKey,
                error: err.message,
              });
            }
          }
          logger.info("Team voted", {
            roomSessionKey,
            playerSessionKey,
            selectedPlayers,
          });
        } catch (err) {
          logger.info("Error getting room players", { error: err.message });
        }
      },
    );

    /**
     * Socket: leader_vote
     * Records the round leader's team selection (must be leader to call)
     * Params: {roomSessionKey, playerSessionKey, selectedPlayers}
     * Emits: leader_selection_update, leader_voted
     */
    socket.on(
      "leader_vote",
      async ({ roomSessionKey, playerSessionKey, selectedPlayers }) => {
        try {
          const room = await loadRoom(roomSessionKey);
          if (!room || !room.players[playerSessionKey]) return;
          if (!room.gameStarted || playerSessionKey !== room.roundLeader)
            return;

          room.lastLeaderSelection = selectedPlayers;

          try {
            await saveRoomToDb(roomSessionKey, room);
            logger.info("Saved room to DB", { roomSessionKey });
          } catch (err) {
            logger.info("Failed to save room to DB", {
              roomSessionKey,
              error: err.message,
            });
          }

          io.to(roomSessionKey).emit("leader_selection_update", {
            selectedPlayers,
            leaderId: playerSessionKey,
          });
          io.to(roomSessionKey).emit("leader_voted", {
            votedPlayers: selectedPlayers,
          });
          logger.info("Leader voted", {
            roomSessionKey,
            playerSessionKey,
            selectedPlayers,
          });
        } catch (err) {
          logger.info("Error getting room players", { error: err.message });
        }
      },
    );

    /**
     * Socket: vote_quest
     * Records a player's success/fail vote on the quest
     * When all quest team members vote, determines if quest succeeds
     * Params: {roomSessionKey, playerSessionKey, vote, leaderVotedPlayers}
     * Emits: quest_voted, inform_players_to_vote or game_over
     */
    socket.on(
      "vote_quest",
      async ({
        roomSessionKey,
        playerSessionKey,
        vote,
        leaderVotedPlayers,
      }) => {
        try {
          const room = await loadRoom(roomSessionKey);
          if (!room || !room.players[playerSessionKey]) return;

          room.questVoting = room.questVoting || {
            votes: { success: 0, fail: 0 },
            voters: [],
          };
          room.votedPlayers = room.votedPlayers || [];

          if (vote === "success") room.questVoting.votes.success++;
          else room.questVoting.votes.fail++;

          if (!room.questVoting.voters.includes(playerSessionKey))
            room.questVoting.voters.push(playerSessionKey);

          const totalPlayers = Object.keys(room.players).length;
          const votedCount = room.questVoting.voters.length;

          if (votedCount === totalPlayers) {
            const questResult =
              room.questVoting.votes.success > room.questVoting.votes.fail
                ? "success"
                : "fail";

            if (Array.isArray(leaderVotedPlayers)) {
              leaderVotedPlayers.forEach((psk) => {
                if (!room.votedPlayers.includes(psk))
                  room.votedPlayers.push(psk);
              });
            } else if (!room.votedPlayers.includes(leaderVotedPlayers)) {
              room.votedPlayers.push(leaderVotedPlayers);
            }

            io.to(roomSessionKey).emit("quest_voted", {
              result: questResult,
              votes: room.questVoting.votes,
            });

            const playerIds = Object.keys(room.players);
            const waitPlayers = playerIds.filter(
              (num) => !leaderVotedPlayers.includes(num),
            );

            if (questResult === "success") {
              io.to(roomSessionKey).emit("inform_players_to_vote", {
                votedPlayers: leaderVotedPlayers,
                result: questResult,
                waitPlayers,
              });
            } else {
              if (room.round >= 5) {
                io.to(roomSessionKey).emit("game_over", {
                  result: "evil",
                  goodWins: null,
                  evilWins: null,
                });
              }
            }

            room.questVoting = null;

            try {
              await saveRoomToDb(roomSessionKey, room);
              logger.info("Saved room to DB", { roomSessionKey });
            } catch (err) {
              logger.info("Failed to save room to DB", {
                roomSessionKey,
                error: err.message,
              });
            }
          } else {
            try {
              await saveRoomToDb(roomSessionKey, room);
              logger.info("Saved room to DB", { roomSessionKey });
            } catch (err) {
              logger.info("Failed to save room to DB", {
                roomSessionKey,
                error: err.message,
              });
            }
          }
          logger.info("Quest voted", {
            roomSessionKey,
            playerSessionKey,
            vote,
          });
        } catch (err) {
          logger.info("Error getting room players", { error: err.message });
        }
      },
    );

    /**
     * Socket: result_votes
     * Records a player's vote on the quest result visibility
     * When all players vote, broadcasts the result and may trigger game_over
     * Params: {roomSessionKey, playerSessionKey, vote, phase}
     * Emits: inform_result
     */
    socket.on(
      "result_votes",
      async ({ roomSessionKey, playerSessionKey, vote, phase }) => {
        try {
          const room = await loadRoom(roomSessionKey);
          if (!room || !room.players[playerSessionKey]) return;

          if (vote === "success") room.final_result[room.phase].votes.success++;
          else room.final_result[room.phase].votes.fail++;

          const votesSum =
            room.final_result[room.phase].votes.success +
            room.final_result[room.phase].votes.fail;
          const totalPlayers = Object.keys(room.players).length;

          if (
            votesSum === MISSION_TEAM_SIZES[totalPlayers][(room.phase || 1) - 1]
          ) {
            if (totalPlayers >= 7 && totalPlayers <= 10 && phase === 4) {
              if (room.final_result[room.phase].votes.fail >= 2) {
                room.final_result[room.phase].result.push("fail");
                setTimeout(async () => {
                  io.to(roomSessionKey).emit("inform_result", {
                    result: "fail",
                    success: room.final_result[room.phase].votes.success,
                    fail: room.final_result[room.phase].votes.fail,
                  });
                }, 2000);
              } else {
                room.final_result[room.phase].result.push("success");
                setTimeout(async () => {
                  io.to(roomSessionKey).emit("inform_result", {
                    result: "success",
                    success: room.final_result[room.phase].votes.success,
                    fail: room.final_result[room.phase].votes.fail,
                  });
                }, 2000);
              }
            } else {
              if (room.final_result[room.phase].votes.fail >= 1) {
                room.final_result[room.phase].result.push("fail");
                setTimeout(async () => {
                  io.to(roomSessionKey).emit("inform_result", {
                    result: "fail",
                    success: room.final_result[room.phase].votes.success,
                    fail: room.final_result[room.phase].votes.fail,
                  });
                }, 2000);
              } else {
                room.final_result[room.phase].result.push("success");
                setTimeout(async () => {
                  io.to(roomSessionKey).emit("inform_result", {
                    result: "success",
                    success: room.final_result[room.phase].votes.success,
                    fail: room.final_result[room.phase].votes.fail,
                  });
                }, 2000);
              }
            }
          }
          try {
            await saveRoomToDb(roomSessionKey, room);
            logger.info("Saved room to DB", { roomSessionKey });
          } catch (err) {
            logger.info("Failed to save room to DB", {
              roomSessionKey,
              error: err.message,
            });
          }
        } catch (err) {
          logger.info("Error getting room players", { error: err.message });
        }
      },
    );

    /**
     * Socket: next_round
     * Advances to the next round after a failed quest
     * Selects a new leader and resets round state
     * Params: {roomSessionKey, playerSessionKey}
     * Emits: round_update
     */
    socket.on("next_round", async ({ roomSessionKey, playerSessionKey }) => {
      try {
        const room = await loadRoom(roomSessionKey);
        if (!room || !room.players[playerSessionKey] || room.transitioning)
          return;

        room.transitioning = true;

        const playerList = Object.values(room.players);
        const availablePlayers = playerList.filter(
          (p) => !room.usedLeaders.includes(p.playerSessionKey),
        );

        if (availablePlayers.length === 0) {
          room.usedLeaders = [];
          const randomIndex = Math.floor(Math.random() * playerList.length);
          room.roundLeader = playerList[randomIndex].playerSessionKey;
        } else {
          const randomIndex = Math.floor(
            Math.random() * availablePlayers.length,
          );
          room.roundLeader = availablePlayers[randomIndex].playerSessionKey;
        }

        room.usedLeaders.push(room.roundLeader);
        room.round = (room.round || 0) + 1;
        try {
          await saveRoomToDb(roomSessionKey, room);
          logger.info("Saved room to DB", { roomSessionKey });
        } catch (err) {
          logger.info("Failed to save room to DB", {
            roomSessionKey,
            error: err.message,
          });
        }

        io.to(roomSessionKey).emit("round_update", {
          source: "next_round",
          roundLeader: room.roundLeader,
          round: room.round,
          phase: room.phase || 1,
          missionTeamSizes:
            MISSION_TEAM_SIZES[playerList.length][(room.phase || 1) - 1],
          totalTeamSize: MISSION_TEAM_SIZES[playerList.length],
          gameStarted: room.gameStarted,
        });

        setTimeout(async () => {
          room.transitioning = false;
          try {
            await saveRoomToDb(roomSessionKey, room);
            logger.info("Saved room to DB", { roomSessionKey });
          } catch (err) {
            logger.info("Failed to save room to DB", {
              roomSessionKey,
              error: err.message,
            });
          }
        }, 1000);
        logger.info("Moved to next round", { roomSessionKey });
      } catch (err) {
        logger.info("Error getting room players", { error: err.message });
      }
    });

    /**
     * Socket: next_phase
     * Advances to the next phase after a successful quest
     * Checks for game-over conditions (3 wins for either team)
     * Params: {roomSessionKey, playerSessionKey}
     * Emits: round_update or game_over
     */
    socket.on("next_phase", async ({ roomSessionKey, playerSessionKey }) => {
      try {
        const room = await loadRoom(roomSessionKey);
        if (!room || !room.players[playerSessionKey] || room.transitioning)
          return;

        room.transitioning = true;
        room.phase = (room.phase || 1) + 1;
        room.round = 1;

        const allResults = Object.values(room.final_result)
          .map((p) => p.result)
          .flat();
        const goodWins = allResults.filter((r) => r === "success").length;
        const evilWins = allResults.filter((r) => r === "fail").length;

        if (goodWins >= 3 || evilWins >= 3) {
          io.to(roomSessionKey).emit("game_over", {
            result: goodWins >= 3 ? "good" : "evil",
            goodWins,
            evilWins,
          });
          return;
        }

        const playerList = Object.values(room.players);
        const availablePlayers = playerList.filter(
          (p) => !room.usedLeaders.includes(p.playerSessionKey),
        );
        if (availablePlayers.length === 0) {
          room.usedLeaders = [];
          const randomIndex = Math.floor(Math.random() * playerList.length);
          room.roundLeader = playerList[randomIndex].playerSessionKey;
        } else {
          const randomIndex = Math.floor(
            Math.random() * availablePlayers.length,
          );
          room.roundLeader = availablePlayers[randomIndex].playerSessionKey;
        }

        room.usedLeaders.push(room.roundLeader);
        try {
          await saveRoomToDb(roomSessionKey, room);
          logger.info("Saved room to DB", { roomSessionKey });
        } catch (err) {
          logger.info("Failed to save room to DB", {
            roomSessionKey,
            error: err.message,
          });
        }

        io.to(roomSessionKey).emit("round_update", {
          source: "next_phase",
          roundLeader: room.roundLeader,
          round: room.round,
          phase: room.phase,
          missionTeamSizes:
            MISSION_TEAM_SIZES[playerList.length][(room.phase || 1) - 1],
          totalTeamSize: MISSION_TEAM_SIZES[playerList.length],
          gameStarted: room.gameStarted,
        });

        setTimeout(async () => {
          room.transitioning = false;
          try {
            await saveRoomToDb(roomSessionKey, room);
            logger.info("Saved room to DB", { roomSessionKey });
          } catch (err) {
            logger.info("Failed to save room to DB", {
              roomSessionKey,
              error: err.message,
            });
          }
        }, 1000);
        logger.info("Moved to next phase", { roomSessionKey });
      } catch (err) {
        logger.info("Error getting room players", { error: err.message });
      }
    });

    /**
     * Socket: exit_game
     * Player exits game - marks room for cleanup if empty
     * Params: {roomSessionKey}
     * Emits: exit_to_home
     */
    socket.on("exit_game", async ({ roomSessionKey }) => {
      try {
        const room = await loadRoom(roomSessionKey);
        if (!room) return;
        io.to(roomSessionKey).emit("exit_to_home");
        if (!room.players || Object.keys(room.players).length === 0) {
          try {
            await saveRoomToDb(roomSessionKey, room);
            logger.info("Saved room to DB", { roomSessionKey });
          } catch (err) {
            logger.info("Failed to save room to DB", {
              roomSessionKey,
              error: err.message,
            });
          }
        }
        logger.info("Exited game", { roomSessionKey });
      } catch (err) {
        logger.info("Error getting room players", { error: err.message });
      }
    });

    /**
     * Socket: exit
     * Player exits while game is active - allows rejoin
     * Marks player offline but keeps session for reconnection
     * Params: {roomSessionKey, playerSessionKey}
     * Emits: player_logged_off, room_update
     */
    socket.on("exit", async ({ roomSessionKey, playerSessionKey }) => {
      try {
        const room = await loadRoom(roomSessionKey);
        if (!room || !room.players || !room.players[playerSessionKey]) return;

        // Mark offline but keep the player entry for reconnect
        const leavingPlayer = room.players[playerSessionKey];
        leavingPlayer.id = null;

        // track waiting for reconnect
        room.waitingForReconnect = {
          playerSessionKey,
          name: leavingPlayer.name,
          since: Date.now(),
        };

        // cleanup mappings
        const sid = playerSocketByPlayerSessionKey.get(playerSessionKey);
        if (sid) {
          playerSocketByPlayerSessionKey.delete(playerSessionKey);
          socketToPlayer.delete(sid);
        }

        try {
          await saveRoomToDb(roomSessionKey, room);
          logger.info("Saved room to DB", { roomSessionKey });
        } catch (err) {
          logger.info("Failed to save room to DB", {
            roomSessionKey,
            error: err.message,
          });
        }

        // notify others to show waiting overlay and refresh roster
        io.to(roomSessionKey).emit("player_logged_off", {
          name: leavingPlayer.name,
        });

        const playerList = Object.values(room.players || {}).map((p) => ({
          name: p.name,
          playerSessionKey: p.playerSessionKey,
          online: !!p.id,
        }));
        io.to(roomSessionKey).emit("room_update", { playerList });

        logger.info("Player exited", { roomSessionKey, playerSessionKey });
      } catch (err) {
        logger.info("Error during player exit", { error: err.message });
      }
    });

    /**
     * Socket: disconnect
     * Handles unexpected socket disconnections
     * Marks player offline and notifies other players
     * Emits: player_logged_off, room_update
     */
    socket.on("disconnect", async () => {
      try {
        const mapping = socketToPlayer.get(socket.id);
        if (!mapping) return;
        const { roomSessionKey, playerSessionKey } = mapping;

        const room = await loadRoom(roomSessionKey);
        // cleanup mappings even if room no longer exists
        playerSocketByPlayerSessionKey.delete(playerSessionKey);
        socketToPlayer.delete(socket.id);
        if (!room) return;

        if (room.players && room.players[playerSessionKey]) {
          const offlinePlayer = room.players[playerSessionKey];
          offlinePlayer.id = null;

          // mark room waiting for this player's reconnect and reset the round to 1 (keep phase)
          room.waitingForReconnect = {
            playerSessionKey,
            name: offlinePlayer.name,
            since: Date.now(),
          };

          try {
            await saveRoomToDb(roomSessionKey, room);
            logger.info("Saved room to DB", { roomSessionKey });
          } catch (err) {
            logger.info("Failed to save room to DB", {
              roomSessionKey,
              error: err.message,
            });
          }

          // notify other clients to show a waiting popup
          io.to(roomSessionKey).emit("player_logged_off", {
            name: offlinePlayer.name,
          });

          // continue with existing room_update broadcasting for player list
          const playerList = Object.values(room.players || {}).map((p) => ({
            name: p.name,
            playerSessionKey: p.playerSessionKey,
            online: !!p.id,
          }));
          io.to(roomSessionKey).emit("room_update", { playerList });
        }
        logger.info("Player disconnected", {
          roomSessionKey,
          playerSessionKey,
        });
      } catch (err) {
        logger.info("Error during disconnect", { error: err.message });
      }
    });
  })();
});

const ROOM_CLEANUP_INTERVAL_MS = ROOM_CLEANUP.CHECK_INTERVAL_MS;
const ROOM_EMPTY_GRACE_MS = ROOM_CLEANUP.EMPTY_GRACE_PERIOD_MS;

// Clean up empty rooms
async function cleanEmptyRooms() {
  if (mongoose.connection.readyState !== 1) return;
  const now = Date.now();

  let rooms = [];
  try {
    rooms = await Room.find({}).lean();
    logger.info(`Cleaning up rooms`, { count: rooms.length });
  } catch (err) {
    logger.info("Failed to find rooms", { error: err.message });
    return;
  }

  for (const r of rooms) {
    const playersObj = r.players || {};
    const playerEntries = Object.entries(playersObj);

    // delete immediately if no players at all
    if (playerEntries.length === 0) {
      try {
        await Room.deleteOne({ roomSessionKey: r.roomSessionKey });
        logger.info(`Deleted empty room`, { roomSessionKey: r.roomSessionKey });
      } catch (err) {
        logger.info("Failed to delete empty room", { error: err.message });
      }
      continue;
    }

    // check if everybody is offline (no truthy id)
    const allOffline = playerEntries.every(([, p]) => !p || !p.id);
    if (!allOffline) {
      // someone is online -> clear any empty timestamp
      try {
        await Room.updateOne(
          { roomSessionKey: r.roomSessionKey },
          { $unset: { emptySince: "" } },
        );
        logger.info(`Cleared emptySince from room`, {
          roomSessionKey: r.roomSessionKey,
        });
      } catch (err) {
        logger.info("Failed to update room", { error: err.message });
      }
      continue;
    }

    // all players offline -> set emptySince if not present, or delete if passed grace
    if (!r.emptySince) {
      try {
        await Room.updateOne(
          { roomSessionKey: r.roomSessionKey },
          { $set: { emptySince: now } },
        );
        logger.info(`Set emptySince on room`, {
          roomSessionKey: r.roomSessionKey,
        });
      } catch (err) {
        logger.info("Failed to update room", { error: err.message });
      }
    } else if (now - r.emptySince >= ROOM_EMPTY_GRACE_MS) {
      try {
        await Room.deleteOne({ roomSessionKey: r.roomSessionKey });
        logger.info(`Deleted empty room`, { roomSessionKey: r.roomSessionKey });
      } catch (err) {
        logger.info("Failed to delete empty room", { error: err.message });
      }
    }
  }
}

setInterval(cleanEmptyRooms, ROOM_CLEANUP.CHECK_INTERVAL_MS);
const PORT = SERVER_CONFIG.PORT;
server.listen(PORT, "0.0.0.0", () => {});
