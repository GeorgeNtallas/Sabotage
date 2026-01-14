const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config();
const { connectDB, Room } = require("./db");

connectDB()
  .then(async () => {
    // Delete all rooms on startup (no players should be connected yet)
    try {
      const res = await Room.deleteMany({});
    } catch (err) {}
  })
  .catch((err) => {});

// Minimal in-memory maps for socket routing only (not game state)
const playerSocketByPlayerSessionKey = new Map(); // playerSessionKey -> socket.id
const socketToPlayer = new Map(); // socket.id -> { roomSessionKey, playerSessionKey }

async function loadRoom(roomSessionKey) {
  if (!roomSessionKey) return null;
  return await Room.findOne({ roomSessionKey }).lean();
}

async function saveRoomToDb(roomSessionKey, roomObj) {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  if (!roomObj) {
    await Room.deleteOne({ roomSessionKey }).catch(() => {});
    return;
  }

  const doc = { ...roomObj, roomSessionKey };
  await Room.findOneAndUpdate({ roomSessionKey }, doc, { upsert: true }).catch(
    (err) => {}
  );
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", // local dev
      "https://68a3ab16b7a9ba00081ecd66--thesabotage.netlify.app", // production Netlify
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://68a3ab16b7a9ba00081ecd66--thesabotage.netlify.app"]
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://192.168.1.85:3000",
      ];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
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
    return next();
  } catch (err) {
    return next(err);
  }
});

async function isPasswordUsed(id) {
  if (!id) return false;
  const doc = await Room.findOne({ password: id }).lean();
  return !!doc;
}

const generatePassword = async () => {
  const length = 6;
  let id;
  do {
    let s = "";
    while (s.length < length) s += crypto.randomInt(0, 10).toString();
    id = s.slice(0, length);
  } while (await isPasswordUsed(id));
  return id;
};

const generateroomSessionKey = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const missionTeamSizes = {
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

const getRoleBalance = () => ({
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
});

// Helper: what role a viewer can see for a target
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

async function findRoomSessionKeyByPassword(password) {
  const doc = await Room.findOne({ password }).lean();
  return doc ? doc.roomSessionKey : null;
}

const initializeRoom = (roomSessionKey) => ({
  password: null,
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

    //TODO: When a player quit the game and rejoin, the game resets and starts from the beginning
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
          })
        );
        io.to(roomSessionKey).emit("room_update", {
          playerList: playerListForRoomUpdate,
        });

        if (
          room.waitingForReconnect &&
          room.waitingForReconnect.playerSessionKey === playerSessionKey
        ) {
          delete room.waitingForReconnect;
          await saveRoomToDb(roomSessionKey, room).catch(console.error);
          io.to(roomSessionKey).emit("player_reconnected");

          // broadcast updated round/phase after reconnect so clients resume consistent state
          io.to(roomSessionKey).emit("round_update", {
            roundLeader: room.roundLeader,
            round: room.round,
            phase: room.phase,
            missionTeamSizes:
              missionTeamSizes[Object.keys(room.players).length][
                room.phase - 1
              ],
            totalTeamSize: missionTeamSizes[Object.keys(room.players).length],
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
                  room.characters[p.playerSessionKey]
                )
              : "",
        }));

        socket.emit("character_assigned", {
          character: room.characters ? room.characters[playerSessionKey] : null,
          players: playersWithRoles,
          gameCharacters: room.characters ? Object.values(room.characters) : [],
        });

        socket.emit("round_update", {
          roundLeader: room.roundLeader,
          round: room.round,
          phase: room.phase,
          missionTeamSizes:
            missionTeamSizes[Object.keys(room.players).length][room.phase - 1],
          totalTeamSize: missionTeamSizes[Object.keys(room.players).length],
          gameStarted: room.gameStarted,
        });
      }
    }

    // Handle room creation (short key)
    socket.on("create-room", () => {
      const createdroomSessionKey = generateroomSessionKey(); // e.g. short UUID
      socket.emit("room-created", createdroomSessionKey);
    });

    socket.on("check-room", async (roomSessionKey) => {
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
    });

    // Helper functions for game creation
    const getAllCharacters = () => ({
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
    });

    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    const buildGameCharacters = (selectedRoles, playerCount, allCharacters) => {
      const gameCharacters = [];
      const balance = getRoleBalance()[playerCount];

      if (selectedRoles && Array.isArray(selectedRoles)) {
        selectedRoles.forEach((role) => {
          if (allCharacters[role]) gameCharacters.push(allCharacters[role]);
        });
      }

      const currentGood = gameCharacters.filter(
        (c) => c.team === "good"
      ).length;
      const currentEvil = gameCharacters.filter(
        (c) => c.team === "evil"
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
    const assignCharactersToPlayers = (
      playerList,
      gameCharacters,
      room,
      roomSessionKey
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
              room.characters[p.playerSessionKey]
            ),
          }));

          io.to(player.id).emit("character_assigned", {
            character,
            players: playersWithRoles,
            gameCharacters: gameCharacters,
          });
        }, 4000);
      });
      // persist once after assigning characters
      if (roomSessionKey)
        saveRoomToDb(roomSessionKey, room).catch(console.error);
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
          roundLeader: room.roundLeader,
          round: room.round,
          phase: room.phase,
          missionTeamSizes: missionTeamSizes[playerList.length][0],
          totalTeamSize: missionTeamSizes[playerList.length],
          gameStarted: room.gameStarted,
        });
      }, 2000);
      return room;
    };

    // Create Room
    socket.on("create_room", async (name, callback) => {
      if (!name?.trim()) return callback({ error: "Name is required" });

      const roomSessionKey = crypto.randomUUID();
      const playerSessionKey = crypto.randomUUID();
      const password = await generatePassword();

      const roomObj = initializeRoom(roomSessionKey);
      roomObj.password = password;
      roomObj.leader = playerSessionKey;
      roomObj.players[playerSessionKey] = {
        id: socket.id,
        playerSessionKey,
        name,
      };

      await saveRoomToDb(roomSessionKey, roomObj).catch(console.error);

      playerSocketByPlayerSessionKey.set(playerSessionKey, socket.id);
      socketToPlayer.set(socket.id, { roomSessionKey, playerSessionKey });
      socket.join(roomSessionKey);

      callback({ password, roomSessionKey, playerSessionKey, isLeader: true });
    });

    //TODO: Make the player join again to game using the password and a name
    socket.on("join_room", async ({ name, password }, callback) => {
      if (!name?.trim()) return callback({ error: "Name is required" });
      const roomSessionKey = await findRoomSessionKeyByPassword(password);
      const room = await loadRoom(roomSessionKey);

      if (!room) return callback({ error: "Room not found" });
      if (room.password !== password)
        return callback({ error: "Invalid room password" });

      // Try to find an existing player with the same name (case-insensitive)
      const playerEntry = Object.entries(room.players || {}).find(
        ([, p]) => p.name && p.name.toLowerCase() === name.toLowerCase()
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

      await saveRoomToDb(roomSessionKey, room).catch(console.error);

      playerSocketByPlayerSessionKey.set(playerSessionKey, socket.id);
      socketToPlayer.set(socket.id, { roomSessionKey, playerSessionKey });
      socket.join(roomSessionKey);

      // if this was a reclaim of an offline session, clear waiting flag and notify everyone
      if (
        room.waitingForReconnect &&
        room.waitingForReconnect.playerSessionKey === playerSessionKey
      ) {
        delete room.waitingForReconnect;
        await saveRoomToDb(roomSessionKey, room).catch(console.error);
        io.to(roomSessionKey).emit("player_reconnected");
        io.to(roomSessionKey).emit("round_update", {
          roundLeader: room.roundLeader,
          round: room.round,
          phase: room.phase,
          missionTeamSizes:
            missionTeamSizes[Object.keys(room.players).length][
              (room.phase || 1) - 1
            ],
          totalTeamSize: missionTeamSizes[Object.keys(room.players).length],
          gameStarted: room.gameStarted,
        });
      }

      const isLeader = room.leader === playerSessionKey; /*  */
      callback({
        roomSessionKey,
        playerSessionKey,
        isLeader,
        gameStarted: room.gameStarted,
      });

      // Send game state if game is active and player has character
      if (
        room.gameStarted &&
        room.characters &&
        room.characters[playerSessionKey]
      ) {
        const viewerChar = room.characters[playerSessionKey];
        const playersWithRoles = Object.values(room.players || {}).map((p) => ({
          name: p.name,
          playerSessionKey: p.playerSessionKey,
          visibleRole:
            viewerChar && room.characters[p.playerSessionKey]
              ? calculateVisibleRole(
                  viewerChar,
                  room.characters[p.playerSessionKey]
                )
              : "",
        }));

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
            roundLeader: room.roundLeader,
            round: room.round,
            phase: room.phase,
            missionTeamSizes:
              missionTeamSizes[Object.keys(room.players).length][
                (room.phase || 1) - 1
              ],
            totalTeamSize: missionTeamSizes[Object.keys(room.players).length],
            gameStarted: room.gameStarted,
          });
        }, 500);

        // Notify other players that someone rejoined
        const playerList = Object.values(room.players || {}).map((p) => ({
          name: p.name,
          playerSessionKey: p.playerSessionKey,
          online: !!p.id,
        }));
        io.to(roomSessionKey).emit("room_update", { playerList });
      }
    });

    socket.on("getRoomPlayers", async ({ roomSessionKey }, callback) => {
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
    });

    // Show the players who are ready
    socket.on("player_pressReady", async (playerSessionKey, roomSessionKey) => {
      const room = await loadRoom(roomSessionKey);
      if (!room || !room.players[playerSessionKey]) return;
      room.ready = room.ready || [];
      if (!room.ready.includes(playerSessionKey)) {
        room.ready.push(playerSessionKey);
        io.to(roomSessionKey).emit("player_informReady", playerSessionKey);
        await saveRoomToDb(roomSessionKey, room).catch(console.error);
      }
    });

    // Handle game creation
    socket.on("start_game", async ({ roomSessionKey, selectedRoles }) => {
      const room = await loadRoom(roomSessionKey);
      if (!room) return;

      // Check if current player is the leader
      const currentPlayer = Object.values(room.players).find(
        (p) => p.id === socket.id
      );
      if (!currentPlayer || currentPlayer.playerSessionKey !== room.leader)
        return;

      if ((room.ready || []).length >= 1) {
        const allCharacters = getAllCharacters();
        const playerList = shuffleArray(Object.values(room.players));
        const gameCharacters = buildGameCharacters(
          selectedRoles,
          playerList.length,
          allCharacters
        );

        assignCharactersToPlayers(
          playerList,
          gameCharacters,
          room,
          roomSessionKey
        );
        const roomFinal = initializeGameState(room, playerList, roomSessionKey);
        // persist full game start state
        await saveRoomToDb(roomSessionKey, roomFinal).catch(console.error);
      }
    });

    // Handle team voting
    socket.on(
      "vote_team",
      async ({ roomSessionKey, playerSessionKey, selectedPlayers }) => {
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
            ([, a], [, b]) => b - a
          );
          const voteSize =
            missionTeamSizes[totalPlayers][(room.phase || 1) - 1];
          const questTeam = sortedVotes.slice(0, voteSize).map(([psk]) => psk);

          io.to(roomSessionKey).emit("team_voted", {
            success: true,
            team: questTeam,
            votes: room.voting.playerVotes,
          });

          room.voting = null;
          await saveRoomToDb(roomSessionKey, room).catch(console.error);
        } else {
          await saveRoomToDb(roomSessionKey, room).catch(console.error);
        }
      }
    );

    // Handle leaders votes
    socket.on(
      "leader_vote",
      async ({ roomSessionKey, playerSessionKey, selectedPlayers }) => {
        const room = await loadRoom(roomSessionKey);
        if (!room || !room.players[playerSessionKey]) return;
        if (!room.gameStarted || playerSessionKey !== room.roundLeader) return;

        room.lastLeaderSelection = selectedPlayers;
        await saveRoomToDb(roomSessionKey, room).catch(console.error);

        io.to(roomSessionKey).emit("leader_selection_update", {
          selectedPlayers,
          leaderId: playerSessionKey,
        });
        io.to(roomSessionKey).emit("leader_voted", {
          votedPlayers: selectedPlayers,
        });
      }
    );

    // Handle quest voting
    socket.on(
      "vote_quest",
      async ({
        roomSessionKey,
        playerSessionKey,
        vote,
        leaderVotedPlayers,
      }) => {
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
              if (!room.votedPlayers.includes(psk)) room.votedPlayers.push(psk);
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
            (num) => !leaderVotedPlayers.includes(num)
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
          await saveRoomToDb(roomSessionKey, room).catch(console.error);
        } else {
          await saveRoomToDb(roomSessionKey, room).catch(console.error);
        }
      }
    );

    socket.on(
      "result_votes",
      async ({ roomSessionKey, playerSessionKey, vote, phase }) => {
        const room = await loadRoom(roomSessionKey);
        if (!room || !room.players[playerSessionKey]) return;

        if (vote === "success") room.final_result[room.phase].votes.success++;
        else room.final_result[room.phase].votes.fail++;

        const votesSum =
          room.final_result[room.phase].votes.success +
          room.final_result[room.phase].votes.fail;
        const totalPlayers = Object.keys(room.players).length;

        if (
          votesSum === missionTeamSizes[totalPlayers][(room.phase || 1) - 1]
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
        await saveRoomToDb(roomSessionKey, room).catch(console.error);
      }
    );

    // Handle round transitions (failed quests)
    socket.on("next_round", async ({ roomSessionKey, playerSessionKey }) => {
      const room = await loadRoom(roomSessionKey);
      if (!room || !room.players[playerSessionKey] || room.transitioning)
        return;

      room.transitioning = true;

      const playerList = Object.values(room.players);
      const availablePlayers = playerList.filter(
        (p) => !room.usedLeaders.includes(p.playerSessionKey)
      );

      if (availablePlayers.length === 0) {
        room.usedLeaders = [];
        const randomIndex = Math.floor(Math.random() * playerList.length);
        room.roundLeader = playerList[randomIndex].playerSessionKey;
      } else {
        const randomIndex = Math.floor(Math.random() * availablePlayers.length);
        room.roundLeader = availablePlayers[randomIndex].playerSessionKey;
      }

      room.usedLeaders.push(room.roundLeader);
      room.round = (room.round || 0) + 1;
      await saveRoomToDb(roomSessionKey, room).catch(console.error);

      io.to(roomSessionKey).emit("round_update", {
        roundLeader: room.roundLeader,
        round: room.round,
        phase: room.phase || 1,
        missionTeamSizes:
          missionTeamSizes[playerList.length][(room.phase || 1) - 1],
        totalTeamSize: missionTeamSizes[playerList.length],
        gameStarted: room.gameStarted,
      });

      setTimeout(async () => {
        room.transitioning = false;
        await saveRoomToDb(roomSessionKey, room).catch(console.error);
      }, 1000);
    });

    // Handle phase transitions (successful quests)
    socket.on("next_phase", async ({ roomSessionKey, playerSessionKey }) => {
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
        (p) => !room.usedLeaders.includes(p.playerSessionKey)
      );
      if (availablePlayers.length === 0) {
        room.usedLeaders = [];
        const randomIndex = Math.floor(Math.random() * playerList.length);
        room.roundLeader = playerList[randomIndex].playerSessionKey;
      } else {
        const randomIndex = Math.floor(Math.random() * availablePlayers.length);
        room.roundLeader = availablePlayers[randomIndex].playerSessionKey;
      }

      room.usedLeaders.push(room.roundLeader);
      await saveRoomToDb(roomSessionKey, room).catch(console.error);

      io.to(roomSessionKey).emit("round_update", {
        roundLeader: room.roundLeader,
        round: room.round,
        phase: room.phase,
        missionTeamSizes:
          missionTeamSizes[playerList.length][(room.phase || 1) - 1],
        totalTeamSize: missionTeamSizes[playerList.length],
        gameStarted: room.gameStarted,
      });

      setTimeout(async () => {
        room.transitioning = false;
        await saveRoomToDb(roomSessionKey, room).catch(console.error);
      }, 1000);
    });

    socket.on("exit_game", async ({ roomSessionKey }) => {
      const room = await loadRoom(roomSessionKey);
      if (!room) return;
      io.to(roomSessionKey).emit("exit_to_home");
      if (!room.players || Object.keys(room.players).length === 0) {
        await saveRoomToDb(roomSessionKey, null).catch(console.error);
      }
    });

    // Treat in-app exit as a temporary disconnect to allow rejoin
    socket.on("exit", async ({ roomSessionKey, playerSessionKey }) => {
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

      await saveRoomToDb(roomSessionKey, room).catch(console.error);

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
    });

    // TODO: make the current round to be at the start for all players (vote players)
    // TODO: when the player for any reason leave the game, he has to be able to rejoin
    // TODO: when the player exit the game, the other players and the database is not informed
    socket.on("disconnect", async () => {
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

        await saveRoomToDb(roomSessionKey, room).catch(console.error);

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
    });
  })();
});

const ROOM_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const ROOM_EMPTY_GRACE_MS = 2 * 60 * 1000;

async function cleanEmptyRooms() {
  if (mongoose.connection.readyState !== 1) return;
  const now = Date.now();
  const rooms = await Room.find({})
    .lean()
    .catch(() => []);
  for (const r of rooms) {
    const playersObj = r.players || {};
    const playerEntries = Object.entries(playersObj);
    // delete immediately if no players at all
    if (playerEntries.length === 0) {
      await Room.deleteOne({ roomSessionKey: r.roomSessionKey }).catch(
        () => {}
      );
      continue;
    }
    // check if everybody is offline (no truthy id)
    const allOffline = playerEntries.every(([, p]) => !p || !p.id);
    if (!allOffline) {
      // someone is online -> clear any empty timestamp
      await Room.updateOne(
        { roomSessionKey: r.roomSessionKey },
        { $unset: { emptySince: "" } }
      ).catch(() => {});
      continue;
    }
    // all players offline -> set emptySince if not present, or delete if passed grace
    if (!r.emptySince) {
      await Room.updateOne(
        { roomSessionKey: r.roomSessionKey },
        { $set: { emptySince: now } }
      ).catch(() => {});
    } else if (now - r.emptySince >= ROOM_EMPTY_GRACE_MS) {
      await Room.deleteOne({ roomSessionKey: r.roomSessionKey }).catch(
        () => {}
      );
    }
  }
}

setInterval(cleanEmptyRooms, ROOM_CLEANUP_INTERVAL_MS);

const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {});
