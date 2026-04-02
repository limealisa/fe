/* eslint-disable react-hooks/exhaustive-deps */
"use client";

/* eslint-disable @next/next/no-img-element */
import { Col, Divider, Row, Spin } from "antd";
import styles from "../../../styles/bank.module.css";
import { CopyOutlined, LoadingOutlined } from "@ant-design/icons";
import { useCopyToClipboard, useDebounce, useEffectOnce } from "react-use";
import paymentService from "@/api/services/payment.service";
import { useEffect, useState } from "react";

import { fNumberVND } from "@/utils/format-number";
import { useSearchParams } from "next/navigation";

interface BankValue {
  bankAccountName: string;
  bankCode: string;
  bankName: string;
  bankNumber: string;
  content: string;
  qrBase64: string;
  qrImageUrl?: string;
  rate: number;
  amount?: number; // Số tiền từ FastPay (đã là VNĐ)
}

const DEFAULT_BANK_VALUE: BankValue = {
  bankAccountName: "",
  bankCode: "",
  bankName: "",
  bankNumber: "",
  content: "",
  qrBase64: "",
  rate: 0.001,
  amount: 0,
};

const CountdownTimer = ({ initialSeconds }: any) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prevSeconds: number) => {
          if (prevSeconds <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [seconds]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <div>
      <p>{formatTime(seconds)}</p>
    </div>
  );
};

export default function BankTransfer() {
  const searchParams = useSearchParams();
  const [state, copyToClipboard] = useCopyToClipboard();

  const [dataBank, setDataBank] = useState<BankValue>(DEFAULT_BANK_VALUE);

  const bankCode = searchParams.get("c");
  const amount = searchParams.get("a");

  const [loading, setLoading] = useState(true);

  // Ưu tiên lấy dữ liệu từ FastPay API (đã lưu trong sessionStorage)
  useEffect(() => {
    if (bankCode && amount) {
      const savedData = sessionStorage.getItem('bankTransferData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log("Loading FastPay data:", parsedData);
          
          // Sử dụng dữ liệu từ FastPay - ưu tiên QR code từ FastPay
          setDataBank({
            bankAccountName: parsedData.bankAccountName || parsedData.bankName || "",
            bankCode: parsedData.bankCode || bankCode || "",
            bankName: parsedData.bankName || "",
            bankNumber: parsedData.bankNumber || parsedData.bankAccount || "",
            content: parsedData.content || "",
            qrBase64: parsedData.qrBase64 || "",
            // Ưu tiên qrImageUrl từ FastPay (có thể là qr_data hoặc qrImageUrl)
            qrImageUrl: parsedData.qrImageUrl || "",
            rate: parsedData.rate || 0.001,
            // Số tiền từ FastPay (đã là VNĐ)
            amount: parsedData.amount || (amount ? parseInt(amount) : 0),
          });
          
          console.log("QR Code URL from FastPay:", parsedData.qrImageUrl);
          setLoading(false);
          // Xóa dữ liệu sau khi đã sử dụng
          sessionStorage.removeItem('bankTransferData');
          return;
        } catch (error) {
          console.error("Error parsing saved bank data:", error);
        }
      }
      
      // Nếu không có dữ liệu từ FastPay, gọi API cũ
      getBankRequestF(bankCode, amount);
    }
  }, [bankCode, amount]);

  const getBankRequestF = async (bankCode: string, amount: string) => {
    try {
      setLoading(true);
      const res = await paymentService.getBankRequest(bankCode, amount);
      if (res.data) {
        setDataBank(res.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex justify-center md:items-center max-md:overflow-auto max-md:justify-start max-md:block max-md:pb-[100px] bg-white">

    <div className={`w-full max-w-[750px]  ${styles.layoutBank}`}>
      <div className={` h-full mt-0 md:mt-[40px] text-black py-5 px-10`}>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className={styles.codeInfo}>Số tiền</div>
            <div className={styles.codeInfo}>
              {/* amount từ query params đã là VNĐ (từ actualAmount), không cần chia rate */}
              {/* Nếu có amount từ FastPay data, ưu tiên dùng nó */}
              {dataBank.amount 
                ? fNumberVND(dataBank.amount) 
                : (amount ? fNumberVND(parseInt(amount)) : 0)} VNĐ
            </div>
          </div>

          {/* Logo 789bet ở giữa */}
          <div className="flex items-center justify-center flex-1">
            <img
              src="https://i.imgur.com/nGWKfdH.png"
              alt="789BET Logo"
              className="h-12 md:h-16 w-auto"
            />
          </div>

          <div className="flex flex-col">
            <div className={styles.codeInfo}>Mã ký quỹ</div>
            <div className={styles.codeInfo}>{dataBank.content}</div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          {/* Ưu tiên hiển thị QR code từ FastPay */}
          {(dataBank.qrImageUrl || dataBank.qrBase64) && (
            <img
              className="w-[280px] h-[280px] mb-[10px]"
              src={dataBank.qrImageUrl || `data:image/png;base64,${dataBank.qrBase64}`}
              alt="QR Code"
              crossOrigin="anonymous"
              onError={(e) => {
                // Fallback nếu QR code URL lỗi, thử dùng base64
                if (dataBank.qrBase64 && dataBank.qrImageUrl) {
                  (e.target as HTMLImageElement).src = `data:image/png;base64,${dataBank.qrBase64}`;
                } else {
                  console.error("QR Code load error:", e);
                }
              }}
              onLoad={() => {
                console.log("QR Code loaded successfully from:", dataBank.qrImageUrl || "base64");
              }}
            />
          )}
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="max-w-[400px] w-full grid grid-cols-1 items-center justify-center">
            <Row className={styles.boxInfo}>
              <Col
                className={styles.itemInfo}
                span={7}
              >
                Ngân hàng
              </Col>

              <Col
                className={styles.itemInfo}
                span={17}
              >
                <div>{dataBank.bankName}</div>
                <CopyOutlined
                  style={{ fontSize: "24px", color: "#1890ff" }}
                  onClick={() => copyToClipboard(dataBank.bankName)}
                />
              </Col>
            </Row>
            <Row className={styles.boxInfo}>
              <Col
                className={styles.itemInfo}
                span={7}
              >
                Số Tài Khoản:
              </Col>

              <Col
                className={styles.itemInfo}
                span={17}
              >
                <div>{dataBank.bankNumber}</div>
                <CopyOutlined
                  onClick={() => copyToClipboard(dataBank.bankNumber)}
                  style={{ fontSize: "24px", color: "#1890ff" }}
                />
              </Col>
            </Row>
            <Row className={styles.boxInfo}>
              <Col
                className={styles.itemInfo}
                span={7}
              >
                Tên Tài Khoản:
              </Col>

              <Col
                className={styles.itemInfo}
                span={17}
              >
                {dataBank.bankAccountName}
              </Col>
            </Row>
            <Row className={styles.boxInfo}>
              <Col
                className={styles.itemInfo}
                span={7}
              >
                Số tiền:
              </Col>

              <Col
                className={styles.itemInfo}
                span={17}
              >
                <div
                  style={{
                    color: "green",
                  }}
                >
                  {/* Ưu tiên số tiền từ FastPay, nếu không có thì dùng amount từ query (đã là VNĐ) */}
                  {dataBank.amount 
                    ? fNumberVND(dataBank.amount) 
                    : (amount ? fNumberVND(parseInt(amount)) : 0)}
                </div>
                <CopyOutlined
                  onClick={() => {
                    amount && dataBank.rate
                      ? copyToClipboard((parseInt(amount) / dataBank.rate || 0).toString())
                      : copyToClipboard("0");
                  }}
                  style={{ fontSize: "24px", color: "#1890ff" }}
                />
              </Col>
            </Row>
            <Row className={styles.boxInfo}>
              <Col
                className={styles.itemInfo}
                span={7}
              >
                Nội Dung CK:
              </Col>

              <Col
                className={styles.itemInfo}
                span={17}
              >
                <div
                  style={{
                    color: "red",
                  }}
                >
                  {dataBank.content}
                </div>
                <CopyOutlined
                  onClick={() => copyToClipboard(dataBank.content)}
                  style={{ fontSize: "24px", color: "#1890ff" }}
                />
              </Col>
            </Row>
            <Row className={styles.boxInfo}>
              <Col
                className={styles.itemInfo}
                span={7}
              >
                Thời gian còn lại:
              </Col>

              <Col
                className={styles.itemInfo}
                span={17}
              >
                <div
                  style={{
                    color: "red",
                  }}
                >
                  <CountdownTimer initialSeconds={900} />
                </div>
              </Col>
            </Row>
          </div>
        </div>

        <div className="my-0 px-0 md:my-5 md:px-[55px] text-[14px] f-bank">
          <p style={{ color: "red" }}>
            Sử dụng ứng dụng ngân hàng của bạn để quét mã QR để hoàn tất chuyển khoản nhanh chóng! !
            !
          </p>
          <div className="pt-5">
            <p>
              Vui lòng nhất định phải điền Nội Dung CK {' '}
              <span style={{ color: "red" }}>
                 
                <span
                  className="cursor-pointer"
                  onClick={() => copyToClipboard(dataBank.content)}
                >
                  {dataBank.content}
                </span> 
              </span>
              {' '}
              phía trên khi chuyển khoản.
            </p>
            <p style={{ color: "red" }}>
              <span>
                (Nếu không điền đủ thông tin nội dung chuyển khoản, giao dịch của bạn sẽ phải chờ để
                được xử lý)
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <Divider className="text-[#ff0000] m-0 h-[2px]" />
      </div>

      {loading && (
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
    </div>
  );
}
