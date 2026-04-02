/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import {
  getValueFishGame,
  useGetGameAvalibleNewV2ByGameName,
} from "@/hooks/useGetGameByGameName";
import useSupplierLogo from "@/hooks/useSupplierLogo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input, Spin } from "antd";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import styles from "@/styles/casino.module.css";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import HotTheGame from "@/components/HotTheGame";
import { LoadingOutlined } from "@ant-design/icons";
import IntroducingGame from "@/components/IntroducingGame";
import GameType from "@/config/GameType";
import NavigationGameComponent from "@/components/NavigationGame";
import { getListGameFish, getListGame } from "@/api/services/game.service";
import gameService from "@/api/services/game.service";
import { mapGameNameToProductType, normalizeGames, normalizeGamesTo789BET } from "@/utils/gameApiHelper";

interface IGameOption {
  value: string;
  title: string;
  typeRank: number;
  typeGame?: string;
}

export default function SportGame() {
  const [searchValue, setSearchValue] = useState("");
  const [propSearchValue, setPropSearchValue] = useState("");
  const { gameName } = useParams<{ gameName: string }>();
  const { banner, logo, bgInput, bgItem, colorTitle, bgTitle, navigatorBg, pagnigatorBg } =
    useSupplierLogo(gameName);
  const { listGameOption, gpIds, GameType: fishGameType } = getValueFishGame(gameName) as any;

  const [activeItem, setActiveItem] = useState<IGameOption>(listGameOption[0]);
  const [queryValue, setQueryValue] = useState({
    typeRank: listGameOption[0]?.typeRank,
    typeGame: listGameOption[0]?.typeGame || "fish",
  });

  const tabSearch =
    (listGameOption && listGameOption.find((item: any) => item?.value === "all")) ||
    listGameOption.find((item: any) => item?.value === "fish");

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      setActiveItem(tabSearch);
      setPropSearchValue(searchValue);
    }
  };

  // BC88BET style: Lấy danh sách game bắn cá từ API
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [allGames, setAllGames] = useState<any[]>([]); // Cache tất cả games

  // Map gameName sang productType và gameType
  const productType = mapGameNameToProductType(gameName || "");
  const gameType = "FISH"; // Fish games dùng FISH
  const providerId = gpIds && gpIds.length > 0 ? gpIds[0] : null;

  // Fetch data một lần khi gameName thay đổi
  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      setIsFetching(true);
      
      try {
        // BC88BET: Lấy game bắn cá theo nhà cung cấp
        // Thử nhiều cách để lấy games FC
        let rawGames: any[] = [];
        
        // Cách 1: Thử gọi API trực tiếp: /api/product/FC/FISH
        if (productType) {
          try {
            const directRes = await getListGame(productType, gameType);
            const directGames = normalizeGames(directRes?.data || directRes);
            if (directGames.length > 0) {
              rawGames = directGames;
              console.log(`✓ Direct API /api/product/${productType}/${gameType} returned ${directGames.length} games`);
            }
          } catch (directError) {
            console.log(`✗ Direct API /api/product/${productType}/${gameType} failed:`, directError);
          }
        }
        
        // Cách 2: Nếu không có kết quả, thử dùng GameAvalibleNewV2 với gpIds và gameTypes
        let useLegacyAPI = false;
        if (rawGames.length === 0 && gpIds && gpIds.length > 0 && fishGameType) {
          try {
            const legacyRes = await gameService.GameAvalibleNewV2({
              gpIds: gpIds,
              gameTypes: [`${fishGameType}`],
              rankType: "rank",
              pn: "FE",
              limit: 999,
              page: 1,
            });
            if (legacyRes && Array.isArray(legacyRes) && legacyRes.length > 0) {
              rawGames = legacyRes;
              useLegacyAPI = true; // Đánh dấu đã dùng legacy API, không cần filter
              console.log(`✓ GameAvalibleNewV2 API returned ${legacyRes.length} games for gpIds: ${gpIds}, gameType: ${fishGameType}`);
            }
          } catch (legacyError: any) {
            console.log(`✗ GameAvalibleNewV2 API failed:`, legacyError?.response?.status || legacyError);
          }
        }
        
        // Cách 3: Nếu vẫn không có kết quả, dùng getListGameFish và filter
        if (rawGames.length === 0) {
          const res = await getListGameFish();
          rawGames = normalizeGames(res?.data || res);
          console.log(`✓ getListGameFish returned ${rawGames.length} games (will filter)`);
        }
        
        // Debug: Log để kiểm tra dữ liệu
        if (process.env.NODE_ENV === "development") {
          console.log("=== FC Fish Games Debug ===");
          console.log("gameName:", gameName);
          console.log("productType:", productType);
          console.log("providerId:", providerId);
          console.log("useLegacyAPI:", useLegacyAPI);
          console.log("rawGames count:", rawGames.length);
          if (rawGames.length > 0) {
            console.log("Sample game:", rawGames[0]);
          }
        }
        
        // BC88BET: Filter theo gameType field (productType) và providerId nếu có
        // Nếu dùng legacy API, không cần filter vì đã được filter theo gpIds và gameTypes
        let games: any[] = [];
        if (useLegacyAPI) {
          // Legacy API đã filter, chỉ cần normalize
          games = normalizeGamesTo789BET(rawGames);
        } else if (rawGames.length > 0 && (productType || providerId)) {
          // Filter theo nhiều điều kiện: productType, providerId, và các field khác
          const filtered = rawGames.filter((item: any) => {
            // Kiểm tra theo productType (nhiều field khác nhau)
            const matchProductType = productType ? (
              String(item.gameType) === String(productType) ||
              String(item.gameType)?.toUpperCase() === String(productType)?.toUpperCase() ||
              item.product_code === productType ||
              item.productCode === productType ||
              item.product_type === productType ||
              item.productType === productType ||
              String(item.product_code)?.toUpperCase() === String(productType)?.toUpperCase() ||
              String(item.productCode)?.toUpperCase() === String(productType)?.toUpperCase()
            ) : true;
            
            // Kiểm tra theo providerId (nhiều field khác nhau)
            const matchProviderId = providerId ? (
              String(item.providerId) === String(providerId) ||
              String(item.provider_id) === String(providerId) ||
              String(item.gpid) === String(providerId) ||
              String(item.gpId) === String(providerId) ||
              String(item.providerId) === String(providerId) ||
              item.providerId === Number(providerId) ||
              item.provider_id === Number(providerId) ||
              item.gpid === Number(providerId) ||
              item.gpId === Number(providerId)
            ) : true;
            
            // Nếu có cả productType và providerId, match một trong hai là đủ (OR)
            // Điều này linh hoạt hơn vì có thể API trả về với field này hoặc field kia
            if (productType && providerId) {
              return matchProductType || matchProviderId;
            } else if (productType) {
              return matchProductType;
            } else if (providerId) {
              return matchProviderId;
            }
            
            return false;
          });
          
          if (process.env.NODE_ENV === "development") {
            console.log("Filtered games count:", filtered.length);
            if (filtered.length > 0) {
              console.log("Sample filtered game:", filtered[0]);
            } else {
              console.log("No games matched filter. Checking first few games:");
              rawGames.slice(0, 3).forEach((game: any, idx: number) => {
                console.log(`Game ${idx}:`, {
                  gameType: game.gameType,
                  product_code: game.product_code,
                  productCode: game.productCode,
                  product_type: game.product_type,
                  providerId: game.providerId,
                  provider_id: game.provider_id,
                  gpid: game.gpid,
                  gpId: game.gpId,
                });
              });
            }
          }
          
          games = normalizeGamesTo789BET(filtered);
        } else {
          // Nếu không có điều kiện filter, trả về tất cả (đã normalize ở trên)
          games = normalizeGamesTo789BET(rawGames);
        }
        
        setAllGames(games);
      } catch (error) {
        console.error("Error fetching fish games:", error);
        setAllGames([]);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };

    if (gameName) {
      fetchGames();
    }
  }, [gameName, productType, providerId]); // Chỉ fetch khi gameName/productType/providerId thay đổi

  // Filter games client-side khi activeItem thay đổi (không fetch lại)
  // Sử dụng useMemo để tối ưu performance
  const ListGame = useMemo(() => {
    return allGames;
  }, [allGames]);

  return (
    <NavigationGameComponent>
      <div
        className={`w-full flex flex-col items-center border-solid border-[1px] pb-[30px]  bg-white min-h-screen`}
        style={
          {
            // backgroundImage: bgUrl && `url(${bgUrl})`,
          }
        }
      >
        <div className="w-[850px] h-[80px] flex justify-between items-center">
          <div className="logo ">
            {logo && (
              <img
                loading="lazy"
                src={logo}
                alt=""
              />
            )}
          </div>

          <div
            className="flex rounded p-1 items-center gap-1"
            style={{
              background: bgInput,
            }}
          >
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.customeInputSearch}
              placeholder="Vui lòng nhập tên trò chơi."
            />
            <FontAwesomeIcon
              icon={faSearch}
              fontSize={20}
              color="#fff"
              onClick={() => {
                setActiveItem(tabSearch);
                setPropSearchValue(searchValue);
              }}
              className="mx-2 text-white cursor-pointer"
            />
          </div>
        </div>
        <div
          className="mb-[20px] w-full flex justify-center content-center"
          style={{
            background: bgTitle,
          }}
        >
          <div className="w-[850px] flex items-center flex-wrap py-[10px] gap-4 font-roHe">
            {listGameOption.length > 0 &&
              listGameOption.map((item: any, index: number) => {
                return (
                  <p
                    onClick={() => {
                      setActiveItem(item);
                      setQueryValue({
                        typeRank: item.typeRank,
                        typeGame: item.typeGame || "fish",
                      });
                      setSearchValue("");
                      setPropSearchValue("");
                    }}
                    className={`text-white ${
                      activeItem?.value !== item.value
                        ? `${styles[`${gameName}`]}`
                        : `${styles[`${gameName}Hover`]}`
                    } text-[15px] h-[30px]  px-4 py-2 flex justify-center items-center rounded-full cursor-pointer`}
                    key={index}
                  >
                    {item?.title}
                  </p>
                );
              })}
          </div>
        </div>

        {banner && (
          <img
            className="mb-4"
            src={banner}
            alt=""
          />
        )}

        <div className={`${activeItem?.value === "hot" ? "block" : "hidden"}`}>
          <IntroducingGame
            gamename={gameName}
            type={[GameType.FH, GameType.FISHING]}
            linkRecommend="/games/FishGame/RecommendGame"
            key={"fish-intro"}
          />
        </div>

        {ListGame.length && activeItem?.value === "hot" && (
          <div
            className={styles.gameHeadLine}
            style={{
              borderColor: bgTitle,
            }}
          >
            <span
              className="font-roHe"
              style={{
                backgroundColor: `${colorTitle || bgTitle}`,
              }}
            >
              Trò Chơi Hot Nhất
            </span>
          </div>
        )}
        {ListGame.length && (
          <HotTheGame
            listGame={ListGame}
            searchValue={propSearchValue}
            key="hotgame"
            gamename={gameName}
          />
        )}

        {(isLoading || isFetching) && (
          <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-[999]">
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
      </div>
    </NavigationGameComponent>
  );
}
