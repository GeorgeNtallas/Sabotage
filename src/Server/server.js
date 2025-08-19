const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");

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

const rooms = {};

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

function findRoomSessionKeyByPassword(password) {
  for (const [roomSessionKey, room] of Object.entries(rooms)) {
    if (room.password === password) {
      return roomSessionKey;
    }
  }
  return null; // not found
}

const initializeRoom = (roomSessionKey) => {
  if (!rooms[roomSessionKey]) {
    rooms[roomSessionKey] = {
      password: null,
      players: {},
      ready: [],
      characters: {},
      gameStarted: false,
      roundLeader: null,
      round: 0,
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
    };
  }
  return rooms[roomSessionKey];
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle room creation
  socket.on("create-room", () => {
    const createdroomSessionKey = generateroomSessionKey(); // e.g. short UUID

    socket.emit("room-created", createdroomSessionKey);
  });

  socket.on("check-room", (roomSessionKey) => {
    const room = rooms[roomSessionKey];
    if (!room) {
      socket.emit("join-error", { message: "Room does not exist" });
    } else if (room.players[socket.id]) {
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

    const currentGood = gameCharacters.filter((c) => c.team === "good").length;
    const currentEvil = gameCharacters.filter((c) => c.team === "evil").length;
    const neededGood = Math.max(0, balance.good - currentGood);
    const neededEvil = Math.max(0, balance.evil - currentEvil);

    for (let i = 0; i < neededEvil; i++)
      gameCharacters.push(allCharacters["Thrall"]);
    for (let i = 0; i < neededGood; i++)
      gameCharacters.push(allCharacters["Knight"]);

    return shuffleArray(gameCharacters);
  };

  const calculateVisibleRole = (viewerCharacter, targetCharacter) => {
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

  // Assigne Roles to players
  const assignCharactersToPlayers = (playerList, gameCharacters, room) => {
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
  };

  // Initialaze the room parameters
  const initializeGameState = (room, playerList, roomSessionKey) => {
    const randomIndex = Math.floor(Math.random() * playerList.length);
    room.roundLeader = playerList[randomIndex].playerSessionKey;
    room.usedLeaders = [room.roundLeader, room.roundLeader];
    room.gameStarted = true;
    room.round = 1;
    room.phase = 1;

    console.log("Round Leader:", room.roundLeader);
    console.log(
      "Round missionTeamSizes:",
      missionTeamSizes[playerList.length][0]
    );
    io.to(roomSessionKey).emit("game_started");

    setTimeout(() => {
      io.to(roomSessionKey).emit("round_update", {
        roundLeader: room.roundLeader,
        round: room.round,
        phase: room.phase,
        missionTeamSizes: missionTeamSizes[playerList.length][0],
        totalTeamSize: missionTeamSizes[playerList.length],
      });
    }, 2000);
    return room;
  };

  // Create Room
  socket.on("create_room", (name, callback) => {
    if (!name?.trim()) {
      return callback({ error: "Name is required" });
    }

    const roomSessionKey = crypto.randomUUID();
    const playerSessionKey = crypto.randomUUID();
    const password = generateroomSessionKey();
    initializeRoom(roomSessionKey);

    rooms[roomSessionKey].password = password;
    rooms[roomSessionKey].leader = playerSessionKey;

    if (!rooms[roomSessionKey].players) {
      rooms[roomSessionKey] = { players: {} };
    }

    rooms[roomSessionKey].players[playerSessionKey] = {
      id: socket.id,
      playerSessionKey: playerSessionKey,
      name: name,
    };

    socket.join(roomSessionKey);

    callback({
      password: password,
      roomSessionKey: roomSessionKey,
      playerSessionKey: playerSessionKey,
      isLeader: true,
    });
  });

  socket.on("join_room", ({ name, password }, callback) => {
    if (!name?.trim()) {
      return callback({ error: "Name is required" });
    }
    const roomSessionKey = findRoomSessionKeyByPassword(password);
    const playerSessionKey = crypto.randomUUID();
    const room = rooms[roomSessionKey];

    if (!room) {
      return callback({ error: "Room not found" });
    }

    if (room.password !== password) {
      return callback({ error: "Invalid room password" });
    }

    if (room.players) {
      if (
        Object.values(room.players).some(
          (p) => p.name.toLowerCase() === name.toLowerCase()
        )
      ) {
        return callback({ error: "Name already taken in this room" });
      }
    }

    rooms[roomSessionKey].players[playerSessionKey] = {
      id: socket.id,
      playerSessionKey: playerSessionKey,
      name: name,
    };

    socket.join(roomSessionKey);

    callback({
      roomSessionKey: roomSessionKey,
      playerSessionKey: playerSessionKey,
      isLeader: false,
    });
  });

  /*
  socket.on("joinRoom", ({ password, name }, callback) => {
    if (!name?.trim()) {
      return callback({ error: "Name is required" });
    }

    const roomSessionKey = findRoomSessionKeyByPassword(password);
    const playerSessionKey = crypto.randomUUID();
    const room = rooms[roomSessionKey];

    if (!room) {
      return callback({ error: "Room not found" });
    }

    if (room.password !== password) {
      return callback({ error: "Invalid room password" });
    }
    if (room.players) {
      if (
        Object.values(room.players).some(
          (p) => p.name.toLowerCase() === name.toLowerCase()
        )
      ) {
        return callback({ error: "Name already taken in this room" });
      }
    } else {
      rooms[roomSessionKey] = { lobbyleader: playerSessionKey };
    }

    if (!rooms[roomSessionKey].players) {
      rooms[roomSessionKey] = { players: {} };
    }
    rooms[roomSessionKey].players[playerSessionKey] = {
      id: socket.id,
      playerSessionKey: playerSessionKey,
      name: name,
    };

    socket.join(roomSessionKey);

    // Send full updated list
    const playerList = Object.values(rooms[roomSessionKey].players).map(
      (player) => ({
        name: player.name,
        playerSessionKey: player.playerSessionKey,
      })
    );

    io.to(roomSessionKey).emit("password_update", {
      roomPlayers: playerList,
      roomLeader: rooms[roomSessionKey].lobbyleader,
    });

    console.log(`User ${name} joined room ${password}`);
    if (!rooms[roomSessionKey].ready) {
      rooms[roomSessionKey].ready = [];
    }
    socket.emit("ready_update", rooms[roomSessionKey].ready);

    console.log(
      "Sending to client:",
      playerSessionKey,
      typeof playerSessionKey
    );
    callback(playerSessionKey, roomSessionKey);
  });
  */

  socket.on("getRoomPlayers", ({ roomSessionKey }, callback) => {
    const room = rooms[roomSessionKey];
    if (!room) return;

    const playerList = Object.values(room.players).map((player) => ({
      name: player.name,
      playerSessionKey: player.playerSessionKey,
    }));

    callback({ roomPlayers: playerList, roomLeader: room.leader });
  });

  // Show the players who are ready
  socket.on("player_pressReady", (playerSessionKey, roomSessionKey) => {
    const room = rooms[roomSessionKey];
    console.log("Player ready:", playerSessionKey, roomSessionKey);
    if (!room || !room.players[playerSessionKey]) return;

    if (
      roomSessionKey &&
      !rooms[roomSessionKey].ready.includes(playerSessionKey)
    ) {
      rooms[roomSessionKey].ready.push(playerSessionKey);
      io.to(roomSessionKey).emit("player_informReady", playerSessionKey);

      //io.to(roomSessionKey).emit("ready_update", rooms[roomSessionKey].ready);
    }
  });

  /* Join room
  socket.on("join_room1", ({ name, roomSessionKey, sessionKey }) => {
    if (!name || !roomSessionKey) {
      socket.emit("join-error", { message: "Name and room ID are required" });
      return;
    }

    const newSessionKey = crypto.randomUUID();

    // Initialize room if it doesn't exist
    if (!rooms[roomSessionKey]) {
      rooms[roomSessionKey] = { players: {}, ready: [] };
    }

    // Check for duplicate names in THIS room only (excluding current socket)
    const existingNames = Object.values(rooms[roomSessionKey].players)
      .filter((p) => p.socketId !== socket.id)
      .map((p) => p.name);
    if (existingNames.includes(name)) {
      socket.emit("join-error", { message: "Name already taken in this room" });
      return;
    }

    // Add or update player
    rooms[roomSessionKey].players[socket.id] = {
      name,
      sessionKey: sessionKey || newSessionKey,
      socketId: socket.id,
    };

    socket.join(roomSessionKey);
    socket.emit("room_joined", {
      sessionKey: rooms[roomSessionKey].players[socket.id].sessionKey,
    });

    // Send full updated list
    const playerList = Object.values(rooms[roomSessionKey].players).map(
      (player) => ({
        name: player.name,
        socketId: player.socketId,
      })
    );
    io.to(roomSessionKey).emit("room_update", playerList);

    const lobbyLeaderId = playerList[0]?.socketId || null;
    io.to(roomSessionKey).emit("password_update", {
      players: playerList,
      lobbyLeaderId,
    });

    console.log(`User ${socket.id} joined room ${roomSessionKey}`);
    socket.emit("ready_update", rooms[roomSessionKey].ready);
  });
  */
  // Handle game creation
  socket.on("start_game", ({ roomSessionKey, selectedRoles }) => {
    console.log("Received selectedRoles:", selectedRoles, typeof selectedRoles);
    const room = rooms[roomSessionKey];
    if (!room) return;

    // Check if current player is the leader
    const currentPlayer = Object.values(room.players).find(
      (p) => p.id === socket.id
    );
    if (!currentPlayer || currentPlayer.playerSessionKey !== room.leader)
      return;

    if (room.ready.length >= 1) {
      const allCharacters = getAllCharacters();
      const playerList = shuffleArray(Object.values(room.players));
      const gameCharacters = buildGameCharacters(
        selectedRoles,
        playerList.length,
        allCharacters
      );

      assignCharactersToPlayers(playerList, gameCharacters, room);
      const roomFinal = initializeGameState(room, playerList, roomSessionKey);
      rooms[roomSessionKey] = roomFinal;
    }
  });

  // Handle team voting
  socket.on(
    "vote_team",
    ({ roomSessionKey, playerSessionKey, selectedPlayers }) => {
      const room = rooms[roomSessionKey];
      if (!room) return;

      // Initialize voting if not exists
      if (!room.voting) {
        room.voting = {
          playerVotes: {}, // votes for each player
          votersWhoVoted: [], // track who has voted
        };
      }

      // Record this player's votes for selected players
      selectedPlayers.forEach((playerSessionKey) => {
        if (!room.voting.playerVotes[playerSessionKey]) {
          room.voting.playerVotes[playerSessionKey] = 0;
        }
        room.voting.playerVotes[playerSessionKey]++;
      });

      // Mark this player as having voted
      if (!room.voting.votersWhoVoted.includes(playerSessionKey)) {
        room.voting.votersWhoVoted.push(playerSessionKey);
      }

      // Check if all players have voted
      const totalPlayers = Object.keys(room.players).length;
      const votedCount = room.voting.votersWhoVoted.length;

      if (votedCount === totalPlayers) {
        // Find players with most votes
        const sortedVotes = Object.entries(room.voting.playerVotes).sort(
          ([, a], [, b]) => b - a
        );

        const voteSize = missionTeamSizes[totalPlayers][room.phase - 1];
        const questTeam = sortedVotes
          .slice(0, voteSize)
          .map(([playerSessionKey]) => playerSessionKey);

        io.to(roomSessionKey).emit("team_voted", {
          success: true,
          team: questTeam,
          votes: room.voting.playerVotes,
        });

        // Reset voting
        room.voting = null;
      }
    }
  );

  // Handle leaders votes
  socket.on(
    "leader_vote",
    ({ roomSessionKey, playerSessionKey, selectedPlayers }) => {
      const room = rooms[roomSessionKey];
      if (!room || !room.players[playerSessionKey]) return;
      if (!room.gameStarted || playerSessionKey !== room.roundLeader) return;

      console.log("Leader selected players:", selectedPlayers);

      // Broadcast leader selection to all players
      io.to(roomSessionKey).emit("leader_selection_update", {
        selectedPlayers: selectedPlayers,
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
    ({ roomSessionKey, playerSessionKey, vote, leaderVotedPlayers }) => {
      const room = rooms[roomSessionKey];
      if (!room || !room.players[playerSessionKey]) return;

      if (!room.questVoting) {
        room.questVoting = { votes: { success: 0, fail: 0 }, voters: [] };
      }

      if (!room.votedPlayers) {
        room.votedPlayers = [];
      }

      if (vote === "success") {
        room.questVoting.votes.success++;
      } else {
        room.questVoting.votes.fail++;
      }

      if (!room.questVoting.voters.includes(playerSessionKey)) {
        room.questVoting.voters.push(playerSessionKey);
      }

      const totalPlayers = Object.keys(room.players).length;
      const votedCount = room.questVoting.voters.length;

      if (votedCount === totalPlayers) {
        const questResult =
          room.questVoting.votes.success > room.questVoting.votes.fail
            ? "success"
            : "fail";

        if (!room.votedPlayers.includes(leaderVotedPlayers)) {
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
            waitPlayers: waitPlayers,
          });
        }

        room.questVoting = null;
      }
    }
  );

  socket.on(
    "result_votes",
    ({ roomSessionKey, playerSessionKey, vote, phase }) => {
      const room = rooms[roomSessionKey];

      if (!room || !room.players[playerSessionKey]) return;

      if (vote === "success") {
        room.final_result[room.phase].votes.success++;
      } else {
        room.final_result[room.phase].votes.fail++;
      }

      const votesSum =
        room.final_result[room.phase].votes.success +
        room.final_result[room.phase].votes.fail;

      const totalPlayers = Object.keys(room.players).length;

      setTimeout(() => {
        if (votesSum === missionTeamSizes[totalPlayers][room.phase - 1]) {
          if (totalPlayers >= 7 && totalPlayers <= 10 && phase === 4) {
            if (room.final_result[room.phase].votes.fail >= 2) {
              room.final_result[room.phase].result.push("fail");
              io.to(roomSessionKey).emit("inform_result", {
                result: "fail",
                success: room.final_result[room.phase].votes.success,
                fail: room.final_result[room.phase].votes.fail,
              });
            } else {
              room.final_result[room.phase].result.push("success");
              io.to(roomSessionKey).emit("inform_result", {
                result: "success",
                success: room.final_result[room.phase].votes.success,
                fail: room.final_result[room.phase].votes.fail,
              });
            }
          } else {
            if (room.final_result[room.phase].votes.fail >= 1) {
              room.final_result[room.phase].result.push("fail");
              io.to(roomSessionKey).emit("inform_result", {
                result: "fail",
                success: room.final_result[room.phase].votes.success,
                fail: room.final_result[room.phase].votes.fail,
              });
            } else {
              room.final_result[room.phase].result.push("success");
              io.to(roomSessionKey).emit("inform_result", {
                result: "success",
                success: room.final_result[room.phase].votes.success,
                fail: room.final_result[room.phase].votes.fail,
              });
            }
          }
        }
      }, 2000);
    }
  );

  // Handle round transitions (failed quests)
  socket.on("next_round", ({ roomSessionKey, playerSessionKey }) => {
    const room = rooms[roomSessionKey];
    if (!room || !room.players[playerSessionKey] || room.transitioning) return;

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
    room.round++;

    io.to(roomSessionKey).emit("round_update", {
      roundLeader: room.roundLeader,
      round: room.round,
      phase: room.phase || 1,
      missionTeamSizes: missionTeamSizes[playerList.length][room.phase - 1],
      totalTeamSize: missionTeamSizes[playerList.length],
    });

    setTimeout(() => {
      room.transitioning = false;
    }, 1000);
  });

  // Handle phase transitions (successful quests)
  socket.on("next_phase", ({ roomSessionKey, playerSessionKey }) => {
    const room = rooms[roomSessionKey];
    if (!room || !room.players[playerSessionKey] || room.transitioning) return;

    room.transitioning = true;
    room.phase = (room.phase || 1) + 1;
    room.round = 1;

    const allResults = Object.values(room.final_result)
      .map((phase) => phase.result)
      .flat();
    const goodWins = allResults.filter((r) => r === "success").length;
    const evilWins = allResults.filter((r) => r === "fail").length;

    console.log(
      "Phase",
      room.phase - 1,
      "goodWins = ",
      goodWins,
      "evilWins = ",
      evilWins
    );
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

    io.to(roomSessionKey).emit("round_update", {
      roundLeader: room.roundLeader,
      round: room.round,
      phase: room.phase,
      missionTeamSizes: missionTeamSizes[playerList.length][room.phase - 1],
      totalTeamSize: missionTeamSizes[playerList.length],
    });

    setTimeout(() => {
      room.transitioning = false;
    }, 1000);
  });

  socket.on("exit_game", ({ roomSessionKey }) => {
    const room = rooms[roomSessionKey];
    if (!room) return;

    io.to(roomSessionKey).emit("exit_to_home");
    // Clean up empty room
    if (Object.keys(rooms[roomSessionKey].players).length === 0) {
      delete rooms[roomSessionKey];
    }
  });

  socket.on("exit", ({ roomSessionKey, playerSessionKey }) => {
    // If the player is in a room, remove from that room
    console.log(`Player ${playerSessionKey} exiting room ${roomSessionKey}`);
    delete rooms[roomSessionKey].players[playerSessionKey];
    rooms[roomSessionKey].ready = rooms[roomSessionKey].ready.filter(
      (id) => id !== playerSessionKey
    );

    // Send updated list to the room the player actually left
    const playerList = Object.values(rooms[roomSessionKey].players).map(
      (player) => ({
        name: player.name,
        playerSessionKey: player.playerSessionKey,
      })
    );
    io.to(roomSessionKey).emit("room_update", playerList);

    // Clean up empty room
    if (Object.keys(rooms[roomSessionKey].players).length === 0) {
      delete rooms[roomSessionKey];
    }
  });

  socket.on("disconnect", () => {
    for (const roomSessionKey in rooms) {
      const { players, ready } = rooms[roomSessionKey];

      // Remove the player with the disconnected socket
      if (players[socket.id]) {
        delete players[socket.id];
      }

      //rooms[roomSessionKey].ready = ready.filter((id) => id !== socket.id);

      // Send updated info
      const playerList = Object.values(players).map((player) => ({
        name: player.name,
        playerSessionKey: player.playerSessionKey,
      }));

      io.to(roomSessionKey).emit("room_update", playerList);
      io.to(roomSessionKey).emit("ready_update", rooms[roomSessionKey].ready);

      if (Object.keys(players).length === 0) {
        delete rooms[roomSessionKey];
      }
    }

    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
