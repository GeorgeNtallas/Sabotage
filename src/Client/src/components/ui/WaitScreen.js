import React from "react";
import { useTranslation } from "react-i18next";

const WaitScreen = ({
  roomSessionKey,
  leaderVotedPlayers,
  setShowWaitScreen,
}) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black font-extrabold bg-opacity-50 flex items-center justify-center z-50">
      <h2>{t("waitScreen.waitingForPlayers")}</h2>
    </div>
  );
};

export default WaitScreen;
