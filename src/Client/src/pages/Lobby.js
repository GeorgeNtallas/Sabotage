import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import socket from "../socket";
import Settings from "../components/ui/Settings";
import Chat from "../components/ui/Chat";

function Lobby() {
  const [players, setPlayers] = useState([]);
  const [readyPlayers, setReadyPlayers] = useState([]);
  const [lobbyLeaderId, setLobbyLeaderId] = useState(null);
  const [pressedButton, setPressedButton] = useState(null);
  const navigate = useNavigate();
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [showChat, setShowChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { t } = useTranslation();
  // Loc, roomId
  const location = useLocation();
  const { name, isLeader, roomPassword, newRoomName, isPublic } =
    location.state || {};

  const playerSessionKey = sessionStorage.getItem("playerSessionKey");
  const roomSessionKey = sessionStorage.getItem("roomSessionKey");

  console.log(newRoomName, isPublic);

  const toggleRole = (role) => {
    setSelectedRoles((prev) => {
      const newSet = new Set(prev);
      newSet.has(role) ? newSet.delete(role) : newSet.add(role);
      return newSet;
    });
  };

  // Handle browser/tab close or back navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // best-effort notify server; browser may still close
      socket.emit("exit", { roomSessionKey, playerSessionKey });
      sessionStorage.removeItem("roomSessionKey");
      // show native confirmation (message ignored by modern browsers)
      e.preventDefault();
      e.returnValue = "";
    };

    const handlePopState = () => {
      const leave = window.confirm(
        "Leave the room? This will remove you from the game.",
      );
      if (leave) {
        socket.emit("exit", { roomSessionKey, playerSessionKey });
        sessionStorage.removeItem("roomSessionKey");
        navigate("/", { replace: true });
      } else {
        // user cancelled — restore router location including state to prevent losing `location.state`
        navigate(location.pathname + location.search, {
          replace: true,
          state: location.state,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // ensure a history entry exists so popstate fires when back pressed
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [roomSessionKey, playerSessionKey]);

  useEffect(() => {
    const handleChatMessage = () => {
      if (!showChat) {
        setUnreadMessages((prev) => prev + 1);
      }
    };

    socket.on("chat_message", handleChatMessage);
    return () => socket.off("chat_message", handleChatMessage);
  }, [showChat]);

  const handleChatOpen = () => {
    setShowChat(true);
    setUnreadMessages(0);
  };

  useEffect(() => {
    // Fetch players immediately on mount
    const fetchPlayers = () => {
      socket.emit(
        "getRoomPlayers",
        { roomSessionKey },
        ({ roomPlayers, roomLeader, readyList }) => {
          setPlayers(roomPlayers);
          setLobbyLeaderId(roomLeader);
          setReadyPlayers(readyList || []);
        },
      );
    };

    if (roomSessionKey) {
      fetchPlayers();
    }

    // Listen for instant updates when someone marks ready
    const handleReady = (playerSessionKeyReady) => {
      setReadyPlayers((prev) => {
        if (!prev.includes(playerSessionKeyReady)) {
          return [...prev, playerSessionKeyReady];
        }
        return prev;
      });
    };

    const handleRoomUpdate = ({ playerList, roomLeader }) => {
      if (playerList) {
        setPlayers(playerList);
      }
      if (roomLeader !== undefined) {
        setLobbyLeaderId(roomLeader);
      }
    };

    socket.on("player_informReady", handleReady);
    socket.on("room_update", handleRoomUpdate);

    return () => {
      socket.off("player_informReady", handleReady);
      socket.off("room_update", handleRoomUpdate);
    };
  }, [roomSessionKey]); // Only re-run when roomSessionKey changes

  useEffect(() => {
    // Update ready players list
    socket.on("ready_update", (readyList) => {
      setReadyPlayers(readyList);
      setTimeout(() => {
        socket.emit("start_game", {
          roomSessionKey,
          selectedRoles: Array.from(selectedRoles),
        });
      }, 2000);
    });
    return () => {
      socket.off("ready_update");
    };
  }, [roomSessionKey, selectedRoles]);

  useEffect(() => {
    socket.on("game_started", () => {
      navigate(`/game?${roomSessionKey}`, { state: { name } });
    });

    return () => {
      socket.off("game_started");
    };
  }, [name, navigate, playerSessionKey]);

  // If we rejoin an already-started game, server will emit character_assigned.
  // Cache it and navigate directly to Game to resume.
  useEffect(() => {
    const onRound = (payload) => {
      if (payload?.gameStarted) {
        navigate(`/game?${roomSessionKey}`, { state: { name } });
      }
    };
    socket.on("round_update", onRound);
    return () => socket.off("round_update", onRound);
  }, [navigate, roomSessionKey, name]);

  const handleReadyClick = () => {
    if (!readyPlayers.includes(playerSessionKey)) {
      socket.emit("player_pressReady", playerSessionKey, roomSessionKey);
    }
  };

  const handleExitClick = () => {
    socket.emit("exit", { roomSessionKey, playerSessionKey });
    sessionStorage.removeItem("roomSessionKey");
    navigate(`/`);
  };

  const isCurrentLeader = lobbyLeaderId === playerSessionKey;
  const canStart = readyPlayers.length >= 1;
  // --------------------------------------
  // 👇 Lobby UI
  return (
    <div
      className="relative flex flex-col items-center justify-center h-screen bg-gray-900 text-white"
      style={{
        backgroundImage: "url(/images/wp7007763-dark-castle-wallpapers.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div className="mb-10 bg-black/60 backdrop-blur-md border border-black rounded-xl shadow-2xl p-4 w-[350px] h-[600px] text-white">
        <h2 className="text-3xl font-extrabold text-center mb-8">
          {t("lobby.welcome")} &nbsp;
          <span className="text-indigo-300 text-shadow">{name}</span>
        </h2>
        <div className="flex items-center justify-center mb-2">
          <p className="mb-5 text-xl font-extrabold text-center text-slate-300 italic">
            {t("lobby.room")}:{" "}
            {newRoomName?.trim() && (
              <span className="font-mono text-indigo-300">{newRoomName}</span>
            )}
          </p>
          <img
            src={isPublic ? "/images/public.png" : "/images/private.png"}
            alt={isPublic ? "Public" : "Private"}
            className={isPublic ? "w-5 h-5 mb-5 ml-2" : "w-7 h-7 mb-5 ml-5"}
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />
          {!isPublic && (
            <p className="mb-5 text-md font-extrabold text-center text-slate-300 italic">
              <span className="font-mono text-indigo-300">{roomPassword}</span>
            </p>
          )}
        </div>

        <div className="bg-black/1 rounded-2xl p-6">
          <div className="w-full mb-4 p-3 rounded-md bg-indigo-500/15 border border-white/20 text-white">
            <h3 className="font-semibold mb-2 text-lg">
              {t("lobby.players")}:
            </h3>
            <ul className="list-disc ml-5 text-sm">
              {players.map((player) => (
                <li key={player.playerSessionKey}>
                  {player.name}{" "}
                  {player.playerSessionKey === lobbyLeaderId &&
                    t("lobby.leader")}
                  {readyPlayers.includes(player.playerSessionKey) && (
                    <span className="text-green-600 ml-2">
                      ✓ {t("lobby.ready")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div
            className={
              isCurrentLeader
                ? "flex gap-4"
                : "flex flex-col items-center gap-2"
            }
          >
            {/* Left Column - Buttons */}
            <div
              className={`flex flex-col gap-2 ${isCurrentLeader ? "flex-1" : ""}`}
            >
              {!(
                isCurrentLeader && readyPlayers.includes(playerSessionKey)
              ) && (
                <button
                  onClick={handleReadyClick}
                  onMouseDown={() => setPressedButton("ready")}
                  onMouseUp={() => setPressedButton(null)}
                  onMouseLeave={() => setPressedButton(null)}
                  onTouchStart={() => setPressedButton("ready")}
                  onTouchEnd={() => setPressedButton(null)}
                  disabled={readyPlayers.includes(playerSessionKey)}
                  className={`text-md px-5 py-3 rounded-md font-bold transition ${
                    readyPlayers.includes(playerSessionKey)
                      ? "bg-red-600 cursor-not-allowed"
                      : `bg-gradient-to-r bg-green-700 hover:from-green-800 hover:via-green-700 hover:to-green-800 transition rounded-md font-bold border border-green-950 text-white ${
                          pressedButton === "ready"
                            ? "scale-95 brightness-75"
                            : ""
                        }`
                  }`}
                >
                  {readyPlayers.includes(playerSessionKey)
                    ? t("lobby.waiting")
                    : t("lobby.ready")}
                </button>
              )}
              <button
                onClick={handleChatOpen}
                onMouseDown={() => setPressedButton("chat")}
                onMouseUp={() => setPressedButton(null)}
                onMouseLeave={() => setPressedButton(null)}
                onTouchStart={() => setPressedButton("chat")}
                onTouchEnd={() => setPressedButton(null)}
                className={`relative text-md px-5 py-3 bg-gradient-to-r bg-indigo-700 hover:bg-indigo-800 hover:via-indigo-700 hover:to-indigo-800 transition rounded-md font-bold border border-indigo-900 text-white ${
                  pressedButton === "chat" ? "scale-95 brightness-75" : ""
                }`}
              >
                {t("lobby.chat") || "Chat"}
                {unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>
              <button
                onClick={handleExitClick}
                onMouseDown={() => setPressedButton("exit")}
                onMouseUp={() => setPressedButton(null)}
                onMouseLeave={() => setPressedButton(null)}
                onTouchStart={() => setPressedButton("exit")}
                onTouchEnd={() => setPressedButton(null)}
                className={`text-md px-5 py-3 bg-gradient-to-r bg-red-700 hover:bg-red-800 hover:via-red-700 hover:to-red-800 transition rounded-md font-bold border border-red-900 text-white ${
                  pressedButton === "exit" ? "scale-95 brightness-75" : ""
                }`}
              >
                {t("lobby.exit")}
              </button>
              {isCurrentLeader && (
                <button
                  className={`text-md px-3 py-4 rounded-md ${
                    canStart
                      ? `bg-gradient-to-r bg-green-600 to-green-700 hover:bg-green-700 transition ${
                          pressedButton === "start"
                            ? "scale-95 brightness-75"
                            : ""
                        }`
                      : "bg-green-500/10 backdrop-blur-md border-green-400/20 cursor-not-allowed"
                  } text-black font-semibold`}
                  disabled={!canStart}
                  onMouseDown={() => setPressedButton("start")}
                  onMouseUp={() => setPressedButton(null)}
                  onMouseLeave={() => setPressedButton(null)}
                  onTouchStart={() => setPressedButton("start")}
                  onTouchEnd={() => setPressedButton(null)}
                  onClick={() => {
                    socket.emit("start_game", {
                      roomSessionKey,
                      selectedRoles: Array.from(selectedRoles),
                    });
                  }}
                >
                  {t("lobby.startGame")}
                </button>
              )}
            </div>
            {/* Right Column - Settings */}
            {isCurrentLeader && (
              <div className="flex-1">
                <Settings
                  isLeader={isCurrentLeader}
                  readyPlayers={readyPlayers}
                  selectedRoles={selectedRoles}
                  toggleRole={toggleRole}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <Chat
        show={showChat}
        onClose={() => setShowChat(false)}
        character={{ team: "good" }}
        playerSessionKey={playerSessionKey}
        roomSessionKey={roomSessionKey}
      />
    </div>
  );
}

export default Lobby;
