/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function OpenGamePage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  useEffect(() => {
    if (url) {
      const decodedUrl = decodeURIComponent(url);
      
      // Thử mở tab mới tự động cho tất cả trình duyệt
      // Trên mobile, redirect đến trang này vẫn trong user interaction context
      const newWindow = window.open(decodedUrl, "_blank", "noopener,noreferrer");
      
      if (newWindow && !newWindow.closed && typeof newWindow.closed !== "undefined") {
        // Nếu mở được tab mới, quay lại trang trước
        setTimeout(() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = "/";
          }
        }, 300);
      } else {
        // Nếu không mở được (bị chặn popup), redirect trực tiếp trong cùng tab
        // Đây là cách chắc chắn hoạt động trên tất cả trình duyệt, kể cả Safari
        window.location.href = decodedUrl;
      }
    } else {
      // Nếu không có URL, quay lại
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }
  }, [url]);

  // Hiển thị loading trong khi xử lý
  return (
    <div className="w-full h-full flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="text-xl font-sans text-black mb-4">
          Đang mở game...
        </div>
        <div className="text-sm text-gray-500">
          Vui lòng đợi trong giây lát
        </div>
      </div>
    </div>
  );
}

