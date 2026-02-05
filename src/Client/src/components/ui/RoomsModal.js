import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import socket from "../../socket";

function RoomsModal({ show, onClose, onJoinRoom }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const medievalFontStyle = {
    fontFamily: "MedievalSharp",
    fontWeight: 400,
  };

  useEffect(() => {
    if (show) {
      fetchRooms();
      const interval = setInterval(fetchRooms, 30000);
      return () => clearInterval(interval);
    }
  }, [show]);

  const fetchRooms = () => {
    setLoading(true);
    socket.emit("get_available_rooms", (response) => {
      if (response.rooms) {
        setRooms(response.rooms);
      }
      setLoading(false);
    });
  };

  const handleJoinRoom = (room) => {
    onJoinRoom(room);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-[600px] max-h-[500px] text-white">
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <h2
            className="text-xl font-bold text-white"
            style={medievalFontStyle}
          >
            Available Rooms
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 text-2xl font-bold"
          >
            x
          </button>
        </div>

        <div className="overflow-y-auto h-[320px]">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-white/60">Loading rooms...</div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-white/60">No rooms available</div>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <div
                  key={room.roomSessionKey}
                  className="bg-indigo-500/15 border border-white/20 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h3
                        className="font-bold text-white"
                        style={medievalFontStyle}
                      >
                        {room.roomName || `Room ${room.roomPassword}`}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-800/50 text-white">
                        {room.isPublic ? "Public" : "Private"}
                      </span>
                      {!room.isPublic && (
                        <span className="text-yellow-400">🔒</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          room.joinable
                            ? "bg-green-800/50 text-green-200"
                            : "bg-red-800/50 text-red-200"
                        }`}
                      >
                        {room.joinable ? "Joinable" : "In Game"}
                      </span>
                      {room.joinable && (
                        <button
                          onClick={() => handleJoinRoom(room)}
                          className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-xs font-bold transition"
                          style={medievalFontStyle}
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-white/80">
                    <span className="font-semibold">
                      Players ({room.playerCount}):
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {room.players.map((player, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs ${
                            player.online
                              ? "bg-green-800/30 text-green-200"
                              : "bg-gray-800/30 text-gray-400"
                          }`}
                        >
                          {player.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={fetchRooms}
            className="px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded font-bold transition"
            style={medievalFontStyle}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomsModal;
