/* eslint-disable import/no-anonymous-default-export */
import { contentInstance } from "@/configs/CustomizeAxios";
import { CurrentVipInfo } from "./contants";

const getCurrentVipInfo = async () => {
  const response = await contentInstance.get(CurrentVipInfo.CURRENT_VIP_INFO);
  return response?.data?.data;
};

const getUpgradeHistory = async () => {
    const response = await contentInstance.get(CurrentVipInfo.UPGRADE_HISTORY);
    return response?.data?.data;
  };

export default {
  getCurrentVipInfo,
  getUpgradeHistory
};
