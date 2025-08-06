const getUniquePasswordAsync = () => {
  return new Promise((resolve) => {
    const tryGenerate = () => {
      const password = generateRandomPassword();
      socket.emit("check-password", password, (exists) => {
        if (exists) {
          tryGenerate();
        } else {
          resolve(password);
        }
      });
    };
    tryGenerate();
  });
};

const generateRandomPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const getOrCreateSessionToken = () => {
  let token = localStorage.getItem("avalon-session");
  if (!token) {
    token = crypto.randomUUID(); // Or use uuidv4() if preferred
    localStorage.setItem("avalon-session", token);
  }
  return token;
};

const handleJoin = () => {
  debugger;
  if (name && password) {
    debugger;
    socket.emit("check-name", name, password, (exists, reason) => {
      debugger;
      if (!exists) {
        debugger;
        const session = getOrCreateSessionToken();
        navigate(`/lobby?name=${name}&password=${password}&session=${session}`);
      } else if (reason === "password_not_found") {
        alert("Password does not exist. Please create a new game.");
      } else alert("Name already exists. Please choose a different name.");
    });
  } else {
    alert("Please enter your name and password.");
  }
};

const handleCreate = async () => {
  if (!name) {
    alert("Please enter your name.");
    return;
  }

  const password = await getUniquePasswordAsync();
  const session = getOrCreateSessionToken();
  socket.on("get-gameSession", (gameSession) => {
    navigate(
      `/lobby?name=${name}&password=${password}&session=${session}&gameSession=${gameSession}`
    );
  });
};

socket.on("check-name", (name, password, callback) => {
  if (passwords[password]) {
    const passw = Object.values(passwords[password].players).some(
      (p) => p.name === name
    );
    console.log(passw);
    if (passw) callback(true, null);
    else callback(false, null);
  } else callback(true, "password_not_found");
});

socket.on("check-password", (password, callback) => {
  console.log("check-password received:", password);
  if (passwords[password]) callback(true);
  else callback(false);
});

<VoteMedal
  socket={socket}
  roomId={roomId}
  setSelectedPlayers={setSelectedPlayers}
  selectedPlayers={selectedPlayers}
  setShowLeaderVoteModal={setShowLeaderVoteModal}
  setShowVoteButton={setShowVoteButton}
  setShowQuestVoteButton={setShowQuestVoteButton}
  setShowQuestVoteModal={setShowQuestVoteModal}
  players={players}
  type="vote"
/>;
