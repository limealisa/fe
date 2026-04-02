/* eslint-disable @next/next/no-img-element */
"use client";
import gameService from "@/api/services/game.service";
import MarqueeDesktop from "@/components/MarqueeDesktop";
import { useUser } from "@/context/useUserContext";
import useLaunchGameDevice from "@/hooks/useLaunchGameDevice";
import isSafari from "@/utils/isSafari";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./casino.module.css";
import Image from "next/image";
import ProviderID from "@/config/ProviderID";
import GameType from "@/config/GameType";
import Partner from "@/config/Partner";
import gameName from "@/constant/gameName";
import { usePlayGame } from "@/hooks/usePlayGame";
import { findGameConfigBySupplier } from "@/config/GameConfig";

/**
 * Helper: Extract supplier name from link
 * Example: /games/CasinoGame/wm -> wm
 */
const extractSupplierFromLink = (link: string): string | null => {
  if (!link) return null;
  
  // Extract game name from link patterns like /games/CasinoGame/wm
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

const defaultListCasino = [
  {
    id: 0,
    link: `/games/CasinoGame/${gameName.WM}`,
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/casino/wm.png",
    name: "WM Casino", // BC88BET
    gameId: "WM", // BC88BET
    codeGame: "WM0001", // BC88BET
  },
  {
    id: 1,
    link: `/games/CasinoGame/${gameName.DG}`,
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/casino/dg.png",
    name: "DG Casino", // BC88BET
    gameId: "DG", // BC88BET
    codeGame: "DG0013", // BC88BET
  },
  {
    id: 2,
    link: `/games/CasinoGame/${gameName.SE}`,
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/casino/se.png",
    name: "SEX Casino", // BC88BET
    gameId: "SEX", // BC88BET
    codeGame: "SEX001", // BC88BET
  },
  {
    id: 3,
    // link: `/games/CasinoGame/${gameName.MT}`,
    link: `/games/CasinoGame/${gameName.AG}`,
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/casino/mt.png",
    name: "AG Casino", // BC88BET
    gameId: "AG", // BC88BET
    codeGame: "A00070", // BC88BET
  },
  {
    id: 4,
    link: `/games/CasinoGame/${gameName.AG}`,
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/casino/ag.png",
    name: "AG Casino", // BC88BET
    gameId: "AG", // BC88BET
    codeGame: "A00070", // BC88BET
  },
  {
    id: 5,
//    link: `/games/CasinoGame/${gameName.EVO}`,
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/casino/evo.png",
    name: "EVO Casino", // BC88BET
    gameId: "EG5", // BC88BET: EVO sử dụng gameId="SA"
    codeGame: "EG5001", // BC88BET
  },
  {
    id: 6,
    // link: `/games/CasinoGame/${gameName.SA}`,
    link: `/games/CasinoGame/${gameName.SA}`,
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/casino/sa.png",
    name: "SA Casino", // BC88BET
    gameId: "SA", // BC88BET
    codeGame: "SA001", // BC88BET
  },
  
  {
    id: 7,
    link: `/games/CasinoGame/${gameName.DB}`,
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/casino/bg.png",
  },
  {
    id: 8,
    // link: `/games/CasinoGame/${gameName.TP}`,
    link: `/games/CasinoGame/${gameName.TP}`,

    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/casino/top.png",
  },
  {
    id: 9,
    link: `/games/CasinoGame/${gameName.ON}`,
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/casino/on.png",
  },
  {
    id: 10,
    link: `/games/CasinoGame/${gameName.ON}`,
    icon: "https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/casino/astar.png",
  },
];

export default function CockFighting() {
  const [selectedData, setSelectedData] = useState(0);
  const { playGame } = usePlayGame();

  const handlePlay = async (item: any) => {
    // Ưu tiên 1: Nếu có codeGame và gameId trực tiếp từ item, dùng chúng
    if (item.codeGame && item.gameId) {
      await playGame({
        code: item.codeGame, // codeGame cụ thể (ví dụ: "EG5001")
        id: item.gameId, // gameId (mã nhà cung cấp, ví dụ: "EG5")
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
    <div className="w-full h-auto flex flex-col items-center justify-center font-roHe">
      <MarqueeDesktop />

      <div
        className={`bg-[url('/images/casino/back_ground.png')] bg-no-repeat bg-cover bg-center w-full h-[480px]`}>
        <div className="w-full relative">
          <div className="absolute right-[180px] top-[120px] text-center">
            <Image
              width={0}
              height={0}
              sizes="100vw"
              className="w-[340px] h-[176px]"
              src={defaultListCasino[selectedData].icon}
              alt=""
            />
            <p className="text-[22px] leading-[1.64] text-white w-[400px] my-5">
              Nhà cung cấp baccarat thời gian thực, Trực tiếp từ Sòng Bạc
            </p>
            <button
              onClick={() => handlePlay(defaultListCasino[selectedData])}
              className={styles.btn}>
              Cược Ngay
            </button>
          </div>
        </div>
      </div>

      <div className="w-[1200px] grid grid-cols-6 pt-[30px] pb-[50px]">
        {defaultListCasino.map((item, index) => (
          <div
            onClick={() => setSelectedData(item.id)}
            className={`${styles.itemGame} ${selectedData === item.id && styles.active}`}
            key={index}>
            <Image
              width={174}
              height={86}
              className={styles.image}
              src={item.icon}
              alt=""
            />
          </div>
        ))}{" "}
      </div>
    </div>
  );
}
