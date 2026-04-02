/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { getValueSlotGame } from "@/hooks/useGetGameByGameName";
import useSupplierLogo from "@/hooks/useSupplierLogo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input, Spin } from "antd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/styles/casino.module.css";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import HotTheGame from "@/components/HotTheGame";
import { LoadingOutlined } from "@ant-design/icons";
import IntroducingGame from "@/components/IntroducingGame";
import GameType from "@/config/GameType";
import NavigationGameComponent from "@/components/NavigationGame";
import { getListGame, getGameHot } from "@/api/services/game.service";
import { mapGameNameToProductType, normalizeGamesTo789BET } from "@/utils/gameApiHelper";
import { IItemGame } from "@/interface/game.interface";

interface IGameOption {
  value: string;
  title: string;
  typeRank: number;
  typeGame?: string;
}

export default function GameListPage() {
  const [searchValue, setSearchValue] = useState("");
  const [propSearchValue, setPropSearchValue] = useState("");
  const { gameName } = useParams<{ gameName: string }>();
  const { banner, logo, bgInput, bgItem, colorTitle, bgTitle, navigatorBg, pagnigatorBg } =
    useSupplierLogo(gameName);
  const { listGameOption } = getValueSlotGame(gameName) as any;
  const [ListGame, setListGame] = useState<IItemGame[]>([]);

  const [activeItem, setActiveItem] = useState<IGameOption | null>(null);
  const [queryValue, setQueryValue] = useState({
    typeRank: 0,
    typeGame: "slot",
  });

  const tabSearch =
    (listGameOption && listGameOption.find((item: any) => item?.value === "all")) ||
    listGameOption?.find((item: any) => item?.value === "new");

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter" && tabSearch) {
      setActiveItem(tabSearch);
      setPropSearchValue(searchValue);
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const productType = mapGameNameToProductType(gameName || "");
        if (!productType) {
          console.error("Product type not found for gameName:", gameName);
          return;
        }

        // Fetch game list from BC88BET API
        const listResponse = await getListGame(productType, "slot");

        // Normalize games
        const normalizedList = normalizeGamesTo789BET(listResponse?.data || []);

        setListGame(normalizedList);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    if (gameName) {
      fetchGames();
    }
  }, [gameName]);

  useEffect(() => {
    if (listGameOption && listGameOption.length > 0) {
      const firstOption = listGameOption[0];
      if (!activeItem || activeItem.value !== firstOption.value) {
        setActiveItem(firstOption);
        setQueryValue({
          typeRank: firstOption?.typeRank,
          typeGame: firstOption?.typeGame || "slot",
        });
      }
    }
  }, [gameName]); // Chỉ chạy khi gameName thay đổi

  const filteredGames = ListGame.filter((game) => {
    if (propSearchValue) {
      return game.gameName?.toLowerCase().includes(propSearchValue.toLowerCase());
    }
    return true;
  });

  return (
    <NavigationGameComponent>
      <div className={styles.bgCasino} style={{ backgroundImage: `url(${banner})` }}>
        <div className={styles.container}>
          <div className={styles.header}>
            {logo && <img src={logo} alt="" className={styles.logo} />}
            <div className={styles.searchContainer}>
              <Input
                className={styles.searchInput}
                style={{ backgroundImage: `url(${bgInput})` }}
                placeholder="Vui lòng nhập tên trò chơi."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                suffix={
                  <FontAwesomeIcon
                    icon={faSearch}
                    style={{ color: "#999", cursor: "pointer" }}
                    onClick={() => {
                      if (tabSearch) {
                        setActiveItem(tabSearch);
                        setPropSearchValue(searchValue);
                      }
                    }}
                  />
                }
              />
            </div>
          </div>

          <div className={styles.tabs}>
            {listGameOption?.map((item: IGameOption, index: number) => (
              <div
                key={index}
                className={`${styles.tab} ${activeItem?.value === item.value ? styles.active : ""}`}
                style={{
                  backgroundColor:
                    activeItem?.value === item.value ? bgTitle : navigatorBg,
                  color: activeItem?.value === item.value ? colorTitle : "#fff",
                }}
                onClick={() => {
                  setActiveItem(item);
                  setQueryValue({
                    typeRank: item.typeRank,
                    typeGame: item.typeGame || "slot",
                  });
                  setPropSearchValue("");
                  setSearchValue("");
                }}>
                {item.title}
              </div>
            ))}
          </div>

          {filteredGames.length > 0 ? (
            <IntroducingGame
              gamename={gameName || ""}
              type={[GameType.SLOT, GameType.SL]}
              linkRecommend={`/lobby/game/${gameName}`}
            />
          ) : (
            <div className="flex justify-center items-center py-20">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </div>
          )}
        </div>
      </div>
    </NavigationGameComponent>
  );
}

