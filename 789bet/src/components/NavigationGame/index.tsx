/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./NavigationGame.module.css";
import ListGameConfigNavigation from "./ListGameConfigNavigation";
import { useState } from "react";
import { popup } from "@/utils/popup";
import { Modal, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Image from "next/image";
import { usePlayGame } from "@/hooks/usePlayGame";
import { findGameConfigBySupplier } from "@/config/GameConfig";
import gameName from "@/constant/gameName";

/**
 * Helper: Extract supplier name from link
 * Example: /games/SlotCasino/pg -> pg
 */
const extractSupplierFromLink = (link: string): string | null => {
  if (!link) return null;
  
  // Extract game name from link patterns like /games/SlotCasino/pg
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

export default function NavigationGameComponent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { playGame } = usePlayGame();

  const [itemActive, setItemActive] = useState(ListGameConfigNavigation[0].id);
  const [listGame, setListGame] = useState(ListGameConfigNavigation[0].list);
  const [loadingGame, setLoadingGame] = useState(false);
  const [showGameNoteExits, setShowGameNoteExits] = useState(false);
  const [showNav, setShowNav] = useState(false);

  const showNavigator = searchParams.get("navigator");

  if (showNavigator === "no") {
    return children;
  }

  return (
    <div className="w-full h-full min-h-screen relative">
      <div
        onMouseLeave={() => setShowNav(false)}
        className={`w-full fixed ${showNav ? "top-0" : "top-[-345px]"} transition-all duration-500 ${styles.nav} z-[999]`}
      >
        <div
          className={styles.linkBG}
          onMouseEnter={() => setShowNav(true)}
        />
        <div className="w-full flex justify-center">
          <img
            className="w-[145px] h-[60px] mt-2"
            src="https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/logo.png"
            alt=""
          />
        </div>

        <div className={styles.navList}>
          <ul>
            {ListGameConfigNavigation.map((item, index) => {
              return (
                <li
                  className={`${itemActive === item.id ? styles.active : ""}`}
                  key={item.id}
                  onClick={() => {
                    setItemActive(item.id);
                    setListGame(item.list || []);
                  }}
                >
                  <div
                    className={``}
                    style={{
                      backgroundImage: `url(${item.icon})`,
                      display: "inline-block",
                      width: "28px",
                      height: "24px",
                      marginRight: "4px",
                      backgroundPosition: itemActive === item.id ? "center bottom" : "center top",
                    }}
                  ></div>
                  <span className="font-roHe text-sm uppercase">{item.name}</span>
                  {index < ListGameConfigNavigation.length - 1 && (
                    <div className={styles.divider} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className={styles.listGame}>
          <ul className={styles.entraceList}>
            {listGame &&
              listGame.map((item: any, index) => {
                const handleClick = async () => {
                  // BC88BET style: Ưu tiên sử dụng playGame nếu có codeGame và gameId
                  if (item.codeGame && item.gameId) {
                    await playGame({
                      code: item.codeGame,
                      id: item.gameId,
                      gameId: item.gameId,
                      gpid: 0,
                      supplier: "",
                      type: 0,
                      lang: "en",
                    });
                    return;
                  }

                  // Nếu có supplier trực tiếp, sử dụng playGame
                  if (item.supplier) {
                    const gameConfig = findGameConfigBySupplier(item.supplier);
                    if (gameConfig) {
                      await playGame({
                        code: gameConfig.code,
                        id: item.gameId || gameConfig.code,
                        gameId: item.gameId || 0,
                        gpid: gameConfig.gpid || 0,
                        supplier: item.supplier,
                        type: gameConfig.type,
                        lang: "en",
                      });
                      return;
                    }
                  }

                  // Nếu có link và link là /games/{gameType}/{gameName}, mở tab mới với link gốc
                  // Hỗ trợ: SlotCasino, FishGame, SportGame, CasinoGame, BoardGame, etc.
                  if (item.link) {
                    const gameLinkMatch = item.link.match(/\/games\/([^/]+)\/([^/]+)/);
                    if (gameLinkMatch && gameLinkMatch[2]) {
                      // Mở tab mới với link gốc (ví dụ: /games/SlotCasino/pg, /games/FishGame/fc, /games/SportGame/saba)
                      window.open(item.link, '_blank');
                      return;
                    }

                    // Thử extract supplier từ link
                    const supplier = extractSupplierFromLink(item.link);
                    if (supplier) {
                      const gameConfig = findGameConfigBySupplier(supplier);
                      if (gameConfig) {
                        // Sử dụng code làm id (BC88BET style: code và id có thể giống nhau)
                        await playGame({
                          code: gameConfig.code,
                          id: gameConfig.code, // Sử dụng code làm id
                          gameId: 0,
                          gpid: gameConfig.gpid || 0,
                          supplier: supplier,
                          type: gameConfig.type,
                          lang: "en",
                        });
                        return;
                      }
                    }
                  }

                  // Fallback: sử dụng link như cũ
                  if (!item?.link) {
                    setShowGameNoteExits(true);
                  } else {
                    router.push(item.link);
                  }
                };
                return (
                  <li
                    key={`${index}wew`}
                    onClick={handleClick}
                  >
                    {/* <div
                      className={styles.bgItem}
                      style={{
                        backgroundImage: `url(${item.icon})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: 'center center'
                     
                      }}
                    ></div> */}
                    <figure className="relative flex flex-col items-center w-full">
                      <img
                        style={{
                          height: 80,
                          width: 80,
                          objectFit: "contain",
                        }}
                        src={item.icon}
                        alt=""
                      />
                      <figcaption className="text-sm font-helvetica overflow-hidden text-ellipsis whitespace-nowrap w-full">
                        {item.name}
                      </figcaption>
                    </figure>

                    {item.hot && (
                      <div className="absolute top-[2px] left-[2px]">
                        <img
                          className="w-7 h-7"
                          src="https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/NavigationGame/3cd25c8cfc4d49cb9d99fb6ac5c2ead2.png"
                          alt=""
                        />
                      </div>
                    )}

                    {item.promotion && (
                      <div className="absolute top-[2px] right-[2px]">
                        <img
                          className="w-7 h-7"
                          src="https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/NavigationGame/d6708efb67a481d1546f992c0f5a8b7f.png"
                          alt=""
                        />
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
        {loadingGame && (
          <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-[99999]">
            <Spin
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 48, color: "#fff" }}
                  spin
                />
              }
            />
          </div>
        )}
        <Modal
          open={showGameNoteExits}
          onCancel={() => setShowGameNoteExits(false)}
          onOk={() => setShowGameNoteExits(false)}
          title="Thông báo"
          footer={null}
        >
          <div>Game đang bảo trì, vui lòng quay lại sau!</div>
        </Modal>
      </div>
      {children}
    </div>
  );
}
