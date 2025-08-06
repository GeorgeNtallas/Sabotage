const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://192.168.1.85:3000"],
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://192.168.1.85:3000"]
}));
app.get("/", (req, res) => res.send("Server running..."));

const rooms = {};
const generateRoomId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle room creation
  socket.on("create-room", () => {
    const createdRoomId = generateRoomId(); // e.g. short UUID

    socket.emit("room-created", createdRoomId);
  });

  socket.on("check-room", (roomId) => {
    const room = rooms[roomId];
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
    Merlin: {
      name: "Merlin",
      team: "good",
      description: "Knows who the evil players are",
    },
    Percival: {
      name: "Percival",
      team: "good",
      description: "Knows who Merlin and Morgana are",
    },
    Servant: {
      name: "Servant",
      team: "good",
      description: "A loyal servant of Arthur",
    },
    Morgana: {
      name: "Morgana",
      team: "evil",
      description: "Appears as Merlin to Percival",
    },
    Assassin: {
      name: "Assassin",
      team: "evil",
      description: "Can kill Merlin at the end",
    },
    Minion: { name: "Minion", team: "evil", description: "A servant of evil" },
    Mordred: {
      name: "Mordred",
      team: "evil",
      description: "Unknown for Merlin",
    },
    Oberon: {
      name: "Oberon",
      team: "evil",
      description: "Unknown to evil. Does not know Evil",
    },
  });

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
      gameCharacters.push(allCharacters["Minion"]);
    for (let i = 0; i < neededGood; i++)
      gameCharacters.push(allCharacters["Servant"]);

    return shuffleArray(gameCharacters);
  };

  const calculateVisibleRole = (viewerCharacter, targetCharacter) => {
    const viewer = viewerCharacter.name;
    const target = targetCharacter.name;
    const targetTeam = targetCharacter.team;

    if (viewer === "Merlin" && targetTeam === "evil" && target !== "Mordred")
      return "evil";
    if (viewer === "Percival" && (target === "Merlin" || target === "Morgana"))
      return "Merlin/Morgana";
    if (
      ["Morgana", "Assassin", "Minion", "Mordred"].includes(viewer) &&
      target !== "Oberon" &&
      targetTeam === "evil"
    )
      return "evil";
    if (viewer === "Oberon" && targetTeam === "good") return "good";
    return "";
  };

  const assignCharactersToPlayers = (playerList, gameCharacters, room) => {
    playerList.forEach((player, index) => {
      const character = gameCharacters[index];
      room.characters[player.socketId] = character;

      setTimeout(() => {
        const playersWithRoles = playerList.map((p) => ({
          name: p.name,
          socketId: p.socketId,
          visibleRole: calculateVisibleRole(
            character,
            room.characters[p.socketId]
          ),
        }));

        io.to(player.socketId).emit("character_assigned", {
          character,
          players: playersWithRoles,
        });
      }, 2000);
    });
  };

  const initializeGameState = (room, playerList, roomId) => {
    const randomIndex = Math.floor(Math.random() * playerList.length);
    room.roundLeader = playerList[randomIndex].socketId;
    room.usedLeaders = [room.roundLeader, room.roundLeader];
    room.gameStarted = true;
    room.round = 1;
    room.phase = 1;

    console.log("Round Leader:", room.roundLeader);
    io.to(roomId).emit("game_started");

    setTimeout(() => {
      io.to(roomId).emit("round_leader_update", {
        roundLeader: room.roundLeader,
        round: room.round,
        phase: room.phase,
      });
    }, 1000);
  };

  // Handle game creation
  socket.on("start_game", ({ roomId, selectedRoles }) => {
    console.log("Received selectedRoles:", selectedRoles, typeof selectedRoles);
    const room = rooms[roomId];
    if (!room || !room.players[socket.id]) return;

    const firstPlayer = Object.values(room.players)[0];
    const leaderId = firstPlayer?.socketId;

    if (socket.id === leaderId && room.ready.length >= 1) {
      const allCharacters = getAllCharacters();
      const playerList = shuffleArray(Object.values(room.players));
      const gameCharacters = buildGameCharacters(
        selectedRoles,
        playerList.length,
        allCharacters
      );

      assignCharactersToPlayers(playerList, gameCharacters, room);
      initializeGameState(room, playerList, roomId);
    }
  });

  // Handle leaders votes
  socket.on("leader_vote", ({ roomId, selectedPlayers }) => {
    const room = rooms[roomId];
    if (!room || !room.players[socket.id]) return;
    if (!room.gameStarted || socket.id !== room.roundLeader) return;

    console.log("Leader selected players:", selectedPlayers);

    // Broadcast leader selection to all players
    io.to(roomId).emit("leader_selection_update", {
      selectedPlayers: selectedPlayers,
      leaderId: socket.id,
    });

    io.to(roomId).emit("leader_voted", {
      votedPlayers: selectedPlayers,
    });
  });

  // Handle team voting
  socket.on("vote_team", ({ roomId, selectedPlayers }) => {
    const room = rooms[roomId];
    if (!room || !room.players[socket.id]) return;

    // Initialize voting if not exists
    if (!room.voting) {
      room.voting = {
        playerVotes: {}, // votes for each player
        votersWhoVoted: [], // track who has voted
      };
    }

    // Record this player's votes for selected players
    selectedPlayers.forEach((playerId) => {
      if (!room.voting.playerVotes[playerId]) {
        room.voting.playerVotes[playerId] = 0;
      }
      room.voting.playerVotes[playerId]++;
    });

    // Mark this player as having voted
    if (!room.voting.votersWhoVoted.includes(socket.id)) {
      room.voting.votersWhoVoted.push(socket.id);
    }

    // Check if all players have voted
    const totalPlayers = Object.keys(room.players).length;
    const votedCount = room.voting.votersWhoVoted.length;

    if (votedCount === totalPlayers) {
      // Find players with most votes
      const sortedVotes = Object.entries(room.voting.playerVotes).sort(
        ([, a], [, b]) => b - a
      );

      const questTeam = sortedVotes.slice(0, 3).map(([playerId]) => playerId); // Top 3 players

      io.to(roomId).emit("team_voted", {
        success: true,
        team: questTeam,
        votes: room.voting.playerVotes,
      });

      // Reset voting
      room.voting = null;
    }
  });

  /*
  socket.on("round_leader", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || !room.players[socket.id]) return;

    const playerList = Object.values(room.players);

    if (!room.roundLeader) {
      // Set initial round leader (random player)
      const randomIndex = Math.floor(Math.random() * playerList.length);
      room.roundLeader = playerList[randomIndex].socketId;
      room.usedLeaders = [room.roundLeader];
      room.gameStarted = true;

      room.usedLeaders.push(room.roundLeader);
      room.round++;

      console.log("Round Leader:", room.roundLeader);
      io.to(roomId).emit("round_leader_update", {
        roundLeaderId: room.roundLeader,
        round: room.round,
      });
    } else {
      // Select next round leader from unused players
      const playerList = Object.values(room.players);
      const availablePlayers = playerList.filter(
        (p) => !room.usedLeaders.includes(p.socketId)
      );

      if (availablePlayers.length === 0) {
        // Reset when all players have been leaders
        room.usedLeaders = [];
        const randomIndex = Math.floor(Math.random() * playerList.length);
        room.roundLeader = playerList[randomIndex].socketId;
      } else {
        // Select random from unused players
        const randomIndex = Math.floor(Math.random() * availablePlayers.length);
        room.roundLeader = availablePlayers[randomIndex].socketId;
      }

      room.usedLeaders.push(room.roundLeader);
      room.round++;

      io.to(roomId).emit("round_leader_update", {
        roundLeaderId: room.roundLeader,
        round: room.round,
      });
    }
  }); */

  // Handle quest voting
  socket.on("vote_quest", ({ roomId, vote }) => {
    const room = rooms[roomId];
    if (!room || !room.players[socket.id]) return;

    if (!room.questVoting) {
      room.questVoting = { votes: { success: 0, fail: 0 }, voters: [] };
    }

    if (vote === "success") {
      room.questVoting.votes.success++;
    } else {
      room.questVoting.votes.fail++;
    }

    if (!room.questVoting.voters.includes(socket.id)) {
      room.questVoting.voters.push(socket.id);
    }

    const totalPlayers = Object.keys(room.players).length;
    const votedCount = room.questVoting.voters.length;

    if (votedCount === totalPlayers) {
      const questResult =
        room.questVoting.votes.success > room.questVoting.votes.fail
          ? "success"
          : "fail";

      io.to(roomId).emit("quest_voted", {
        result: questResult,
        votes: room.questVoting.votes,
      });

      room.questVoting = null;
    }
  });

  // Handle round transitions (failed quests)
  socket.on("next_round", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || !room.players[socket.id] || room.transitioning) return;

    room.transitioning = true;

    const playerList = Object.values(room.players);
    const availablePlayers = playerList.filter(
      (p) => !room.usedLeaders.includes(p.socketId)
    );

    if (availablePlayers.length === 0) {
      room.usedLeaders = [];
      const randomIndex = Math.floor(Math.random() * playerList.length);
      room.roundLeader = playerList[randomIndex].socketId;
    } else {
      const randomIndex = Math.floor(Math.random() * availablePlayers.length);
      room.roundLeader = availablePlayers[randomIndex].socketId;
    }

    room.usedLeaders.push(room.roundLeader);
    room.round++;

    io.to(roomId).emit("round_leader_update", {
      roundLeader: room.roundLeader,
      round: room.round,
      phase: room.phase || 1,
    });

    setTimeout(() => {
      room.transitioning = false;
    }, 1000);
  });

  // Handle phase transitions (successful quests)
  socket.on("next_phase", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || !room.players[socket.id] || room.transitioning) return;

    room.transitioning = true;

    room.phase = (room.phase || 1) + 1;
    room.round = 1;
    room.usedLeaders = [];

    const playerList = Object.values(room.players);
    const randomIndex = Math.floor(Math.random() * playerList.length);
    room.roundLeader = playerList[randomIndex].socketId;
    room.usedLeaders.push(room.roundLeader);

    io.to(roomId).emit("round_leader_update", {
      roundLeader: room.roundLeader,
      round: room.round,
      phase: room.phase,
    });

    setTimeout(() => {
      room.transitioning = false;
    }, 1000);
  });

  // Join room
  socket.on("join-room", ({ name, roomId, sessionKey }) => {
    if (!name || !roomId) {
      socket.emit("join-error", { message: "Name and room ID are required" });
      return;
    }

    const newSessionKey = crypto.randomUUID();

    // Initialize room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: {},
        ready: [],
        characters: {},
        gameStarted: false,
        roundLeader: null,
        round: 0,
        phase: 1,
        usedLeaders: [],
      };
    }

    // Check for duplicate names in THIS room only (excluding current socket)
    const existingNames = Object.values(rooms[roomId].players)
      .filter((p) => p.socketId !== socket.id)
      .map((p) => p.name);
    if (existingNames.includes(name)) {
      socket.emit("join-error", { message: "Name already taken in this room" });
      return;
    }

    // Add or update player
    rooms[roomId].players[socket.id] = {
      name,
      sessionKey: sessionKey || newSessionKey,
      socketId: socket.id,
    };

    socket.join(roomId);
    socket.emit("room-joined", {
      sessionKey: rooms[roomId].players[socket.id].sessionKey,
    });
    socket.emit("your_id", socket.id);

    // Send full updated list
    const playerList = Object.values(rooms[roomId].players).map((player) => ({
      name: player.name,
      socketId: player.socketId,
    }));
    io.to(roomId).emit("room_update", playerList);

    const lobbyLeaderId = playerList[0]?.socketId || null;
    io.to(roomId).emit("password_update", {
      players: playerList,
      lobbyLeaderId,
    });

    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.emit("ready_update", rooms[roomId].ready);
  });

  socket.on("player_ready", (id) => {
    const playerRoom = Object.keys(rooms).find(
      (roomId) => rooms[roomId].players[socket.id]
    );

    if (playerRoom && !rooms[playerRoom].ready.includes(socket.id)) {
      rooms[playerRoom].ready.push(socket.id);
      io.to(playerRoom).emit("player_ready", socket.id);
      io.to(playerRoom).emit("ready_update", rooms[playerRoom].ready);
    }
  });

  socket.on("exit", ({ roomId }) => {
    const playerRoom = Object.keys(rooms).find(
      (rid) => rooms[rid].players[socket.id]
    );

    // If the player is in a room, remove from that room
    if (playerRoom) {
      console.log(`Player ${socket.id} exiting room ${playerRoom}`);
      delete rooms[playerRoom].players[socket.id];
      rooms[playerRoom].ready = rooms[playerRoom].ready.filter(
        (id) => id !== socket.id
      );

      // Send updated list to the room the player actually left
      const playerList = Object.values(rooms[playerRoom].players).map(
        (player) => ({
          name: player.name,
          socketId: player.socketId,
        })
      );
      io.to(playerRoom).emit("room_update", playerList);

      // Clean up empty room
      if (Object.keys(rooms[playerRoom].players).length === 0) {
        delete rooms[playerRoom];
      }
    }
  });

  /*
  socket.on("get_character", ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.characters[socket.id]) {
      const character = room.characters[socket.id];
      const playerList = Object.values(room.players).map((p) => ({
        name: p.name,
        socketId: p.socketId,
      }));
      socket.emit("character_assigned", {
        character,
        players: playerList,
      });
    }
  });
  */

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const { players, ready } = rooms[roomId];

      // Remove the player with the disconnected socket
      if (players[socket.id]) {
        delete players[socket.id];
      }

      rooms[roomId].ready = ready.filter((id) => id !== socket.id);

      // Send updated info
      const playerList = Object.values(players).map((player) => ({
        name: player.name,
        socketId: player.socketId,
      }));

      io.to(roomId).emit("room_update", playerList);
      io.to(roomId).emit("ready_update", rooms[roomId].ready);

      if (Object.keys(players).length === 0) {
        delete rooms[roomId];
      }
    }

    console.log("User disconnected:", socket.id);
  });
});

// ✅ Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access from network: http://192.168.1.85:${PORT}`);
});
