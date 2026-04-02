/* eslint-disable @next/next/no-img-element */
"use client";
import gameService from "@/api/services/game.service";
import MarqueeDesktop from "@/components/MarqueeDesktop";
import { useUser } from "@/context/useUserContext";
import useLaunchGameDevice from "@/hooks/useLaunchGameDevice";
import isSafari from "@/utils/isSafari";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./sport.module.css";
import ProviderID from "@/config/ProviderID";
import GameType from "@/config/GameType";
import Partner from "@/config/Partner";
import gameName from "@/constant/gameName";
import { usePlayGame } from "@/hooks/usePlayGame";
import { findGameConfigBySupplier } from "@/config/GameConfig";

/**
 * Helper: Extract supplier name from link
 * Example: /games/SportGame/saba -> saba
 */
const extractSupplierFromLink = (link: string): string | null => {
  if (!link) return null;
  
  // Extract game name from link patterns like /games/SportGame/saba
  const match = link.match(/\/([^/]+)$/);
  if (match) {
    const gameNameValue = match[1];
    // Find supplier from gameName constant
    const supplier = Object.entries(gameName).find(
      ([_, value]) => value === gameNameValue
    )?.[1];
    return supplier || gameNameValue;
  }
  return null;
};

const defaultGameSport = [
  {
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/sport/sport1.png",
    link: `/games/SportGame/${gameName.SABA}`,
    name: "SABA Thể Thao", // BC88BET
    hot: true,
    gameId: "SB", // BC88BET
    codeGame: "SB0001", // BC88BET
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/sport/sport2.png",
    link: `/games/SportGame/${gameName.IM}`,
    name: "IM Thể Thao", // BC88BET
    gameId: "IM", // BC88BET
    codeGame: "IM001", // BC88BET
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/sport/sport3.png",
    link: `/games/SportGame/${gameName.CMD}`,
    name: "CMD Thể Thao", // BC88BET
    gameId: "CMD", // BC88BET
    codeGame: "CMD001", // BC88BET
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/sport/sport4.png",
    link: `/games/SportGame/${gameName.SBO}`,
    name: "SBO Thể Thao", // BC88BET
    gameId: "SBO", // BC88BET
    codeGame: "SBO041", // BC88BET
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/sport/sport5.png",
    link: `/games/SportGame/${gameName.UG}`,
    name: "UG Thể Thao", // BC88BET
    gameId: "UG", // BC88BET
    codeGame: "UG0001", // BC88BET
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/sport/sport6.png",
    link: `/games/SportGame/${gameName.CR}`,
    name: "CMD Thể Thao", // BC88BET
    gameId: "CMD", // BC88BET
    codeGame: "CMD001", // BC88BET
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/sport/load.png",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/sport/load.png",
  },
];

export default function Sport() {
  const deviceC = useLaunchGameDevice();
  const router = useRouter();
  const { playGame } = usePlayGame();

  const { user, setLoadingGame } = useUser();
  const username = user?.username;

  const handlePlay = async (item: any) => {
    // Ưu tiên 1: Nếu có codeGame và gameId trực tiếp từ item, dùng chúng
    if (item.codeGame && item.gameId) {
      await playGame({
        code: item.codeGame, // codeGame cụ thể (ví dụ: "SB0001")
        id: item.gameId, // gameId (mã nhà cung cấp, ví dụ: "SB")
        gameId: item.gameId,
        gpid: 0,
        supplier: "",
        type: 0,
        lang: "en",
      });
      return;
    }

    // Ưu tiên 2: Nếu có link, extract supplier từ link
    if (item.link) {
      const supplier = extractSupplierFromLink(item.link);
      if (supplier) {
        const gameConfig = findGameConfigBySupplier(supplier);
        if (gameConfig) {
          // Sử dụng playGame với gameConfig
          await playGame({
            code: gameConfig.code,
            id: gameConfig.code, // Sử dụng code làm id (BC88BET style)
            gameId: 0,
            gpid: gameConfig.gpid || 0,
            supplier: supplier,
            type: gameConfig.type || 0,
            lang: "en",
          });
          return;
        }
      }

      // Fallback: Nếu không tìm thấy config, mở link trực tiếp
      window.open(item.link, "_blank");
      return;
    }

    // Nếu không có cả codeGame/gameId và link, hiển thị lỗi
    console.error("Item không có codeGame/gameId hoặc link:", item);
  };

  return (
    <div className="w-full h-auto flex flex-col items-center justify-center ">
      <div className="h-[280px] mb-[-30px] w-full">
        <Image
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-full"
          loading="lazy"
          src="https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/sport/banner.jpg"
          alt=""
        />
      </div>
      <MarqueeDesktop />

      <div className={styles.bg}>
        <div
          className={` max-w-[1200px] h-auto pt-[30px] px-5 pb-10 grid grid-cols-1 md:grid-cols-4 gap-3`}>
          {defaultGameSport.map((item, index) => {
            return (
              <div
                className={styles.itemGame}
                key={`sport-${index}-${item.icon}`}
                onClick={() => handlePlay(item)}>
                <Image
                  height={0}
                  width={0}
                  sizes="100vw"
                  className="w-full h-full"
                  src={item.icon}
                  alt=""
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
