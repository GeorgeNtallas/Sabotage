import React from "react";

const CharacterImage = ({
  characterName,
  className = "max-w-40 mx-auto mb-2 ml-3 mr-3",
}) => {
  const name = characterName?.toLowerCase();

  switch (name) {
    case "knight":
      return (
        <div className={`relative ${className} bg-amber-900 overflow-hidden`}>
          <img
            src="/images/Knight/Knight-background.webp"
            alt="Knight"
            className="w-full h-full"
          />
          <img
            src="/images/Knight/Knight-body.webp"
            alt="Knight Torso"
            className="absolute inset-0 w-full h-full animate-breathe"
          />
          <img
            src="/images/Knight/Knight_head.webp"
            alt="Knight Head"
            className="absolute inset-0 w-full h-full animate-head"
          />
          <img
            src="/images/Knight/Knight-cape.webp"
            alt="Knight Cape"
            className="absolute inset-0 w-full h-full animate-cape"
          />
        </div>
      );

    case "thrall":
      return (
        <div className={`relative ${className} bg-green-900 overflow-hidden`}>
          <img
            src="/images/Thrall/Thrall-background.webp"
            alt="Thrall"
            className="w-full h-full"
          />
          <img
            src="/images/Thrall/Thrall-body.webp"
            alt="Thrall Body"
            className="absolute inset-0 w-full h-full animate-breathe"
          />
          <img
            src="/images/Thrall/Thrall-head.webp"
            alt="Thrall Head"
            className="absolute inset-0 w-full h-full animate-head"
          />
        </div>
      );

    case "draven":
      return (
        <div className={`relative ${className} bg-gray-900 overflow-hidden`}>
          <img
            src="/images/Draven/Draven-background.webp"
            alt="Draven"
            className="w-full h-full"
          />
          <img
            src="/images/Draven/Draven-body.webp"
            alt="Draven Body"
            className="absolute inset-0 w-full h-full animate-breathe"
          />
          <img
            src="/images/Draven/Draven-trees.webp"
            alt="Draven Trees"
            className="absolute inset-0 w-full h-full animate-trees"
          />
          <img
            src="/images/Draven/Draven-trees1.webp"
            alt="Draven Trees 1"
            className="absolute inset-0 w-full h-full animate-trees"
          />
          <img
            src="/images/Draven/Draven-plants.webp"
            alt="Draven Plants"
            className="absolute inset-0 w-full h-full animate-leaves"
          />
          <img
            src="/images/Draven/Draven-plants1.webp"
            alt="Draven Plants 1"
            className="absolute inset-0 w-full h-full animate-leaves"
            style={{ animationDelay: "0.5s" }}
          />
        </div>
      );

    case "guardian":
      return (
        <div className={`relative ${className} bg-zinc-900 overflow-hidden`}>
          <img
            src="/images/Guardian/Guardian-background.webp"
            alt="Guardian"
            className="w-full h-full block"
          />
          <img
            src="/images/Guardian/Guardian-body.webp"
            alt="Guardian Body"
            className="absolute inset-0 w-full h-full animate-breathe pointer-events-none"
          />
          <img
            src="/images/Guardian/Guardian-head.webp"
            alt="Guardian Head"
            className="absolute inset-0 w-full h-full animate-head pointer-events-none"
          />
          <img
            src="/images/Guardian/Guardian-arm.webp"
            alt="Guardian Arm"
            className="absolute inset-0 w-full h-full animate-arm pointer-events-none"
          />
          <img
            src="/images/Guardian/Guardian-light.webp"
            alt="Guardian Light"
            className="absolute inset-0 w-full h-full animate-candlelight pointer-events-none"
          />
        </div>
      );

    case "seraphina":
      return (
        <div
          className={`relative ${className} bg-red-900 overflow-hidden`}
          style={{ isolation: "isolate" }}
        >
          <img
            src="/images/Seraphina/Seraphina-background.webp"
            alt="Seraphina"
            className="w-full h-full block"
          />
          <img
            src="/images/Seraphina/Seraphina- body.webp"
            alt="Seraphina Body"
            className="absolute inset-0 w-full h-full animate-breathe pointer-events-none"
          />
          <img
            src="/images/Seraphina/Seraphina-head.webp"
            alt="Seraphina Head"
            className="absolute inset-0 w-full h-full animate-head pointer-events-none"
          />
          <img
            src="/images/Seraphina/Seraphina-light.webp"
            alt="Seraphina Light"
            className="absolute inset-0 w-full h-full animate-candlelight pointer-events-none"
          />
        </div>
      );

    case "shade":
      return (
        <div className={`relative ${className} bg-gray-900 overflow-hidden`}>
          <img
            src="/images/Shade/Shade-background.webp"
            alt="Shade"
            className="w-full h-full block"
          />
          <img
            src="/images/Shade/Shade-body.webp"
            alt="Shade Body"
            className="absolute inset-0 w-full h-full animate-breathe pointer-events-none"
          />
        </div>
      );

    case "seer":
      return (
        <div className={`relative ${className} bg-gray-900 overflow-hidden`}>
          <img
            src="/images/Seer/Seer-background.webp"
            alt="Seer"
            className="w-full h-full block"
          />
          <img
            src="/images/Seer/Seer-hand.webp"
            alt="Seer hand"
            className="absolute inset-0 w-full h-full animate-arm pointer-events-none"
          />
          <img
            src="/images/Seer/Seer-fog.webp"
            alt="Seer fog"
            className="absolute inset-0 w-full h-full animate-smoke pointer-events-none"
          />
          <img
            src="/images/Seer/Seer-head.webp"
            alt="Seer head"
            className="absolute inset-0 w-full h-full animate-head pointer-events-none"
          />
        </div>
      );

    default:
      return (
        <img
          src={`/images/${characterName?.toLowerCase().replace(/\s+/g, "_")}.png`}
          alt={characterName}
          className={className}
          onError={(e) => (e.target.src = "/images/default.jpg")}
        />
      );
  }
};

export default CharacterImage;
