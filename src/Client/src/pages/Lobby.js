import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import socket from "../socket";
import Chat from "../components/ui/Chat";
import DesktopLobbyView from "../components/res_design/DesktopLobbyView";
import MobileLobbyView from "../components/res_design/MobileLobbyView";

function Lobby() {
  const [players, setPlayers] = useState([]);
  const [readyPlayers, setReadyPlayers] = useState([]);
  const [lobbyLeaderId, setLobbyLeaderId] = useState(null);
  const [pressedButton, setPressedButton] = useState(null);
  const navigate = useNavigate();
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [showChat, setShowChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
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

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setShowChat(true);
    }
  }, [isDesktop]);

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
      if (!showChat && !isDesktop) {
        setUnreadMessages((prev) => prev + 1);
      }
    };

    socket.on("chat_message", handleChatMessage);
    return () => socket.off("chat_message", handleChatMessage);
  }, [showChat, isDesktop]);

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

  const handleStartGame = () => {
    socket.emit("start_game", {
      roomSessionKey,
      selectedRoles: Array.from(selectedRoles),
    });
  };

  const isCurrentLeader = lobbyLeaderId === playerSessionKey;
  const canStart = readyPlayers.length >= 1;

  return (
    <>
      {isDesktop ? (
        <DesktopLobbyView
          name={name}
          newRoomName={newRoomName}
          isPublic={isPublic}
          roomPassword={roomPassword}
          players={players}
          lobbyLeaderId={lobbyLeaderId}
          readyPlayers={readyPlayers}
          playerSessionKey={playerSessionKey}
          isCurrentLeader={isCurrentLeader}
          canStart={canStart}
          pressedButton={pressedButton}
          setPressedButton={setPressedButton}
          handleReadyClick={handleReadyClick}
          handleExitClick={handleExitClick}
          handleStartGame={handleStartGame}
          showChat={showChat}
          selectedRoles={selectedRoles}
          toggleRole={toggleRole}
        />
      ) : (
        <MobileLobbyView
          name={name}
          newRoomName={newRoomName}
          isPublic={isPublic}
          roomPassword={roomPassword}
          players={players}
          lobbyLeaderId={lobbyLeaderId}
          readyPlayers={readyPlayers}
          playerSessionKey={playerSessionKey}
          isCurrentLeader={isCurrentLeader}
          canStart={canStart}
          pressedButton={pressedButton}
          setPressedButton={setPressedButton}
          handleReadyClick={handleReadyClick}
          handleChatOpen={handleChatOpen}
          handleExitClick={handleExitClick}
          handleStartGame={handleStartGame}
          unreadMessages={unreadMessages}
          selectedRoles={selectedRoles}
          toggleRole={toggleRole}
        />
      )}
      <Chat
        show={showChat}
        onClose={() => !isDesktop && setShowChat(false)}
        character={{ team: "good" }}
        playerSessionKey={playerSessionKey}
        roomSessionKey={roomSessionKey}
        isDesktop={isDesktop}
      />
    </>
  );
}

export default Lobby;
