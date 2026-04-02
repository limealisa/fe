/* eslint-disable @next/next/no-img-element */
"use client";
import { Key, useState, useEffect } from "react";
import styles from "./PromotionPage.module.css";
import { Modal, Spin, message } from "antd";
import dynamic from "next/dynamic";
import { dataTagPromotion } from "@/config/dataTagPromotion";
import Image from "next/image";
import BanCa from "./ItemPromotion/baohiem/banca";
import { getAllPromotion, getPromotionById, registerPromotion } from "@/api/services/promotion.service";
import { IpromotionResponse, PromotionDetailResponse } from "@/api/types/promotion.interface";
import { formatDateTime } from "@/utils/formatDateTime";
import dayjs from "dayjs";
import he from "he";
import { useUser } from "@/context/useUserContext";
import { useRouter } from "next/navigation";

export default function PromotionPage() {
  const { user } = useUser();
  const router = useRouter();
  // BC88BET style: Fetch promotions from API
  const [promotions, setPromotions] = useState<IpromotionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const [promotionDetail, setPromotionDetail] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false); // Chỉ dùng để disable nút, không đổi text
  
  // Legacy state (giữ lại để tương thích với UI cũ nếu cần)
  const [tagPromotion, setTagPromotion] = useState(dataTagPromotion[0]?.name || "");
  const [linkDynamic, setLinkDynamic] = useState(
    dataTagPromotion[0]?.items[0]?.link || ""
  );
  const [value, setValue] = useState(dataTagPromotion[0]?.value || "");
  const [openModal, setOpenModal] = useState(false);

  // Fetch promotions from BC88BET API
  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const res = await getAllPromotion();
        // BC88BET response: { data: IpromotionResponse[] }
        if (res?.data && Array.isArray(res.data)) {
          setPromotions(res.data);
        }
      } catch (error) {
        console.error("Error fetching promotions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  // Fetch promotion detail when selected
  const handlePromotionClick = async (promotionId: string) => {
    try {
      setLoading(true);
      const detail = await getPromotionById(promotionId);
      // Handle both response formats: { data: {...} } or direct object
      const detailData = detail?.data || detail;
      setPromotionDetail(detailData);
      setSelectedPromotionId(promotionId);
      setOpenModal(true);
    } catch (error) {
      console.error("Error fetching promotion detail:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle register promotion
  const handleRegister = async () => {
    console.log("handleRegister called", { user: !!user, promotionId: selectedPromotionId, hasRegistered });
    
    if (!user) {
      message.warning("Vui lòng đăng nhập để tham gia khuyến mãi");
      router.push("/mobile/login");
      return;
    }

    if (!selectedPromotionId) {
      console.error("No promotion ID found");
      message.error("Không tìm thấy thông tin khuyến mãi");
      return;
    }

    if (hasRegistered) {
      message.info("Bạn đã đăng ký khuyến mãi này rồi");
      return;
    }

    if (isRegistering) {
      console.log("Already registering, ignoring click");
      return;
    }

    try {
      setIsRegistering(true);
      console.log("Registering promotion with ID:", selectedPromotionId);
      
      const res = await registerPromotion(selectedPromotionId);
      console.log("Register promotion response:", res);
      
      // Kiểm tra response - nếu status: false thì là lỗi
      if (res?.status === false) {
        const errorMsg = res?.msg || res?.message || res?.data?.message || "Đăng ký thất bại. Vui lòng thử lại";
        console.error("Register promotion failed:", res);
        message.error(errorMsg);
        return;
      }
      
      // Kiểm tra nhiều format response có thể có cho success
      const isSuccess = 
        res?.status === true || 
        res?.status === "success" ||
        res?.code === 200 || 
        res?.success === true ||
        res?.data?.status === true ||
        (res?.message && res?.message.toLowerCase().includes("thành công")) ||
        (res?.data && Object.keys(res.data).length > 0 && res?.data?.status !== false);
      
      if (isSuccess) {
        setHasRegistered(true);
        message.success(res?.message || res?.data?.message || res?.msg || "Đăng ký tham gia khuyến mãi thành công!");
        // Refresh promotion detail để cập nhật isRegister
        try {
          const detail = await getPromotionById(selectedPromotionId);
          const detailData = detail?.data || detail;
          setPromotionDetail(detailData);
        } catch (refreshError) {
          console.error("Error refreshing promotion detail:", refreshError);
        }
      } else {
        const errorMsg = res?.message || res?.data?.message || res?.msg || "Đăng ký thất bại. Vui lòng thử lại";
        console.error("Register promotion failed:", res);
        message.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Error registering promotion:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        data: error?.response?.data,
        status: error?.response?.status
      });
      
      const errorMsg = 
        error?.response?.data?.message || 
        error?.response?.data?.msg ||
        error?.message || 
        "Đăng ký thất bại. Vui lòng thử lại";
      message.error(errorMsg);
    } finally {
      setIsRegistering(false);
    }
  };

  // Function to handle opening the modal and setting the dynamic link
  const handleOpenModal = (link: string) => {
    if (link) {
      setLinkDynamic(link);
      setOpenModal(true);
    } else {
      console.error("Invalid link provided for dynamic import");
    }
  };

  // const DynamicContent = dynamic(async () => {
  //   try {
  //     return import(
  //       `./ItemPromotion/${value}/${linkDynamic ? linkDynamic : "DangCapNhat"}`
  //     );
  //   } catch (error) {
  //     console.error("Failed to load dynamic content:", error);
  //   }
  // });

  return (
    <div
      className="flex flex-col items-center w-full"
      style={{
        backgroundImage: "url(/images/promotion/bgKhuyenMai.jpg)",
        backgroundSize: "cover",
      }}>
      <div
        className="w-[1200px] py-[30px]"
        style={{
          justifyItems: "center",
        }}>
        {/* Promotion items section - BC88BET style: Chỉ hiển thị từ API, không có tags */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : promotions.length > 0 ? (
          <div className="flex flex-wrap gap-5">
            {promotions.map((promotion) => (
              <div
                className="w-[580px] cursor-pointer"
                key={promotion.id}
                onClick={() => handlePromotionClick(promotion.id)}>
                <img
                  src={promotion.thumbnail}
                  alt={promotion.title}
                  className="w-[590px] h-[193px] object-cover rounded"
                />
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Ngày Bắt đầu: {formatDateTime(promotion.updatedAt)}
                  </p>
                  <p className="text-base font-semibold capitalize">{promotion.title}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-20">
            <p className="text-gray-500">Không có khuyến mãi nào</p>
          </div>
        )}

        {/* Modal to show dynamic content */}
        <Modal
          closeIcon=""
          footer={
            <div className="flex justify-center py-4">
              <button
                onClick={handleRegister}
                disabled={isRegistering || hasRegistered}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
                  hasRegistered
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-95"
                } ${isRegistering ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isRegistering ? "Đang xử lý..." : "Đăng ký tham gia"}
              </button>
            </div>
          }
          open={openModal}
          width={1200}
          onCancel={() => {
            setOpenModal(false);
            setPromotionDetail(null);
            setHasRegistered(false);
          }}
          className="w-[1200px] mt-[3vh] top-0 p-[20px]"
          styles={{
            content: {
              borderRadius: 0,
            },
          }}>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : promotionDetail?.content || promotionDetail?.description ? (
            <div
              className="promotion-content"
              dangerouslySetInnerHTML={{
                __html: he.decode(promotionDetail.content || promotionDetail.description || ""),
              }}
            />
          ) : (
            <div className="flex justify-center items-center py-20">
              <p className="text-gray-500">Không có nội dung khuyến mãi</p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
