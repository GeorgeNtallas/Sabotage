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
      <div className="bg-black/95 backdrop-blur-lg border-2 border-amber-600/50 rounded-xl shadow-[0_0_30px_rgba(200,100,50,0.3)] p-6 w-[600px] min-w-[320px] max-h-[500px] text-white relative">
        {/* Corner decorations - amber style */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-500"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-500"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-500"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-500"></div>

        <div className="flex justify-between items-center mb-4">
          <div></div>
          <h2
            className="text-xl font-bold text-amber-500"
            style={medievalFontStyle}
          >
            Available Rooms
          </h2>
          <button
            onClick={onClose}
            className="text-amber-500 hover:text-red-400 text-2xl font-bold transition"
          >
            x
          </button>
        </div>

        <div className="overflow-y-auto h-[320px]">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-amber-100/60">Loading rooms...</div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-amber-100/60">No rooms available</div>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <div
                  key={room.roomSessionKey}
                  className="bg-stone-900/60 border border-amber-800/30 rounded-lg p-4 hover:border-amber-600/50 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h3
                        className="font-bold text-amber-400"
                        style={medievalFontStyle}
                      >
                        {room.roomName || `Room ${room.roomPassword}`}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-900/50 text-amber-300 border border-amber-700/30">
                        {room.isPublic ? "Public" : "Private"}
                      </span>
                      {!room.isPublic && (
                        <span className="text-amber-500">🔒</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          room.joinable
                            ? "bg-green-900/50 text-green-300 border border-green-700/30"
                            : "bg-red-900/50 text-red-300 border border-red-700/30"
                        }`}
                      >
                        {room.joinable ? "Joinable" : "In Game"}
                      </span>
                      {room.joinable && (
                        <button
                          onClick={() => handleJoinRoom(room)}
                          className="px-3 py-1 bg-gradient-to-r from-red-900 via-red-800 to-amber-900 hover:from-red-800 hover:via-red-700 hover:to-amber-800 rounded text-xs font-bold text-amber-100 border border-amber-700/50 transition"
                          style={medievalFontStyle}
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-amber-100/80">
                    <span className="font-semibold text-amber-400">
                      Players ({room.playerCount}):
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {room.players.map((player, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs ${
                            player.online
                              ? "bg-green-900/30 text-green-300 border border-green-700/20"
                              : "bg-stone-800/30 text-stone-500 border border-stone-700/20"
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
            className="px-4 py-2 bg-gradient-to-r from-red-900 via-red-800 to-amber-900 hover:from-red-800 hover:via-red-700 hover:to-amber-800 rounded font-bold text-amber-100 border border-amber-700/50 transition"
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
