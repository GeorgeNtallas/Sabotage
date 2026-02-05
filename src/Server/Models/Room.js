const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    // Identity / access
    roomSessionKey: { type: String, required: true, unique: true },
    // Unique 6-digit join code; allow multiple nulls (sparse)
    roomPassword: { type: String, index: { unique: true, sparse: true } },

    // Lobby / membership
    leader: { type: String, default: null }, // playerSessionKey of the leader
    players: { type: Object, default: {} }, // { [playerSessionKey]: { id, playerSessionKey, name } }
    ready: { type: [String], default: [] },
    isPublic: { type: Boolean, default: true },
    roomName: { type: String, default: null },

    // Game setup
    characters: { type: Object, default: {} }, // { [playerSessionKey]: { name, team, ... } }
    gameStarted: { type: Boolean, default: false },

    // Game progression
    roundLeader: { type: String, default: null }, // playerSessionKey
    round: { type: Number, default: 0 },
    phase: { type: Number, default: 1 },
    usedLeaders: { type: [String], default: [] },

    // Voting state
    voting: { type: mongoose.Schema.Types.Mixed, default: null },
    questVoting: { type: mongoose.Schema.Types.Mixed, default: null },
    lastLeaderSelection: { type: [String], default: null }, // array of playerSessionKeys

    // Quest results and helpers
    votedPlayers: { type: [String], default: [] },
    final_result: { type: mongoose.Schema.Types.Mixed, default: {} },

    // UX / flow control
    transitioning: { type: Boolean, default: false },

    // Reconnect handling
    waitingForReconnect: {
      type: new mongoose.Schema(
        {
          playerSessionKey: { type: String, default: null },
          name: { type: String, default: null },
          since: { type: Number, default: null }, // timestamp (ms)
        },
        { _id: false },
      ),
      default: null,
    },

    // Room lifecycle maintenance
    emptySince: { type: Number, default: null }, // timestamp (ms) when room became empty
  },
  { timestamps: true },
);

module.exports = mongoose.model("Room", RoomSchema);
