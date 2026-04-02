/* eslint-disable @next/next/no-img-element */
"use client";

import apiClient from "@/api/apiClient";
import gameService from "@/api/services/game.service";

import { useUser } from "@/context/useUserContext";
import useLaunchGameDevice from "@/hooks/useLaunchGameDevice";
import useSupplierLogo from "@/hooks/useSupplierLogo";
import { usePlayGame } from "@/hooks/usePlayGame";
import { IItemGame } from "@/interface/game.interface";
import isSafari from "@/utils/isSafari";
import { popup } from "@/utils/popup";
import { HeartFilled, HeartOutlined, LoadingOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function IntroItem({
  dataGame,
  titleSu,
  gamename,
}: {
  dataGame: IItemGame;
  titleSu?: string | null;
  gamename: string;
}) {
  const { user, setLoadingGame } = useUser();
  const router = useRouter();
  const deviceC = useLaunchGameDevice();
  const username = user?.username;
  const { playGame } = usePlayGame();
  const [isFavorite, setIsFavorite] = useState(dataGame.isFavorite ?? false);
  const params = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const {
    banner,
    logo,
    bgInput,
    bgItem,
    bgTitle,
    navigatorBg,
    pagnigatorBg,
    bgBtn,
    colorTitleBtn,
  } = useSupplierLogo(gamename);

  const handleClick = async () => {
    // BC88BET style: code là codeGame (mã game cụ thể), id là productCode (mã nhà cung cấp)
    await playGame({
      code: dataGame.codeGame, // game_code từ BC88BET
      id: dataGame.gameId, // product_code từ BC88BET (mã nhà cung cấp)
      gameId: dataGame.gameId,
      gpid: dataGame.providerId,
      supplier: dataGame.partnerName,
      type: dataGame.gameTypeId,
      lang: "en",
      gamename: gamename, // Thêm gamename để fallback tìm config
    });
  };

  const handleAddFavorite = async () => {
    setIsFavorite(!isFavorite);
    if (isFavorite) {
      await gameService
        .DeleteGameFavorite(dataGame.gameId, dataGame.partnerName)
        .catch(() => setIsFavorite(!isFavorite));
    } else {
      await gameService
        .AddGameFavorite(dataGame.gameId, dataGame.partnerName)
        .catch(() => setIsFavorite(!isFavorite));
    }
  };

  useEffect(() => {}, []); // Chạy một lần khi component mount

  return (
    <div
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      // onClick={() => handleClick()}
      className={`cursor-pointer pt-[9px] pb-[4px] ${titleSu ? "h-[230px]" : ""} min-h-[230px] w-[158px] m-[5px] rounded-lg border-solid border-[1px] border-black hover:border-transparent flex flex-col justify-between items-center gap-2 ${
        isOpen && "bg-[#df3434] border-[#ff1c4f]"
      }  transition duration-300 relative`}
      style={{
        background: isOpen ? bgItem : "",
      }}>
      {isOpen && (
        <div
          onClick={() => handleClick()}
          className="absolute top-1/4 w-[90px] text-center px-4 py-1  bg-[#fc3f49] z-50 rounded-md"
          style={{
            background: isOpen ? bgBtn : "",
            color: colorTitleBtn ? colorTitleBtn : "white",
          }}>
          Play
        </div>
      )}
      <div className="flex flex-col items-center">
        <img
          loading="lazy"
          className={`${
            isOpen && "opacity-70 bg-black"
          } transition duration-300 object-cover h-[140px]`}
          width={140}
          src={dataGame.gameIconUrl}
          alt=""
        />
        <div className="w-full grid grid-cols-12 pl-2 gap-1">
          <div className={`col-span-10 text-black ${isOpen && "text-white"} `}>
            {dataGame.gameName}
          </div>
          <div className="col-span-2" onClick={handleAddFavorite}>
            {isFavorite ? (
              <HeartFilled style={{ fontSize: 16, color: "red" }} />
            ) : (
              <HeartOutlined
                style={{ fontSize: 16, color: isOpen ? "white" : "gray" }}
              />
            )}
          </div>
        </div>
      </div>

      {titleSu && (
        <div
          onClick={() => handleClick()}
          className={`flex justify-center text-gray-400 text-xs ${
            isOpen && "text-white"
          } transition duration-300`}>
          {titleSu}
        </div>
      )}
      
    </div>
  );
}
