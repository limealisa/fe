"use client";

import paymentService from "@/api/services/payment.service";
import { PaymentHistoryReq } from "@/api/types/payment.interface";
import ModalDetailPayment from "@/components/ModalDetailPayment";
import ModalMobileTransactionHistory from "@/components/ModalMobileTransactionHistory";
import { dayNames, TRANSACTION_TYPE_ENUM } from "@/constant";
import renderTypePayment from "@/constant/renderTypePayment";
import { MailTypeEnum } from "@/constant/enum";
import { useGetPaymentHistory } from "@/hooks/usePaymentService";
import { Button, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState, useMemo } from "react";

const options = [
  { value: "", label: "Tất cả" }, // Dùng empty string thay vì undefined
  { value: MailTypeEnum.COMPANY_IN, label: "Công ty gửi tiền" },
  { value: MailTypeEnum.ONLINE_IN, label: "Thanh toán trực tuyến" },
  { value: MailTypeEnum.ONLINE_OUT, label: "Rút tiền trực tuyến" },
  { value: MailTypeEnum.MANUAL, label: "Nạp rút thủ công" },
  { value: MailTypeEnum.PREFERENTIAL, label: "Hoạt động ưu đãi" },
  { value: MailTypeEnum.PREFERENTIAL_DAY, label: "Hoàn trả ngày" },
  { value: MailTypeEnum.VIP_BONUS, label: "VIP bonus" },
  { value: MailTypeEnum.ORTHER, label: "Khác" },
];

export default function Transaction() {
  const [rangeDate, setRangeDate] = useState({
    dateFrom: dayjs().startOf("day").toISOString(),
    dateTo: dayjs().toISOString(),
    selected: "now",
  });
  const [transactionType, setTransactionType] = useState<
    MailTypeEnum | undefined
  >(undefined);

  // Tạo params động dựa trên transactionType và rangeDate (memoize để tránh re-render không cần thiết)
  const params: PaymentHistoryReq = useMemo(() => {
    const p: PaymentHistoryReq = {
      page: 1, // BC88BET: page bắt đầu từ 1, không phải 0
      limit: 50,
      dateFrom: rangeDate.dateFrom,
      dateTo: rangeDate.dateTo,
    };
    if (transactionType) {
      p.type = transactionType;
    }
    return p;
  }, [transactionType, rangeDate.dateFrom, rangeDate.dateTo]);

  const { dataPaymentHistory, refetch } = useGetPaymentHistory(params);

  function getShortDayName(date: dayjs.Dayjs): string {
    return dayNames[date.day()];
  }

  const [dataListPaymentType, setDataListPaymentType] = useState<any>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dataPayment, setDataPayment] = useState<any>();

  useEffect(() => {
    if (dataPaymentHistory) {
      // BC88BET response: { data: [...], total: number, ... }
      // data đã được convert từ dataExport trong service
      setDataListPaymentType({
        dataExport: dataPaymentHistory.data || [],
        total: dataPaymentHistory.total || 0,
      });
    }
  }, [dataPaymentHistory]);

  const handleOpenDetail = (data: any) => {
    setDataPayment(data);
    setIsOpen(true);
  };

  const handleChangeRange = (type: string) => {
    switch (type) {
      case "now":
        setRangeDate({
          dateFrom: dayjs().startOf("day").toISOString(),
          dateTo: dayjs().toISOString(),
          selected: type,
        });

        break;
      case "yesterday":
        setRangeDate({
          dateFrom: dayjs().subtract(1, "day").startOf("day").toISOString(),
          dateTo: dayjs().toISOString(),
          selected: type,
        });

        break;
      case "7days":
        setRangeDate({
          dateFrom: dayjs().subtract(7, "day").startOf("day").toISOString(),
          dateTo: dayjs().toISOString(),
          selected: type,
        });

        break;
      case "30days":
        setRangeDate({
          dateFrom: dayjs().subtract(30, "day").startOf("day").toISOString(),
          dateTo: dayjs().toISOString(),
          selected: type,
        });

        break;
      default:
        break;
    }
  };

  // useGetPaymentHistory sẽ tự động refetch khi params thay đổi (vì queryKey phụ thuộc vào params)
  // Không cần useEffect riêng để refetch

  return (
    <>
      {/* Desktop view - ẩn trên mobile */}
      <div className="w-full bg-[#fff] border-[#ddd] border-solid border-[1px] rounded font-helvetica hidden md:block">
        <div className="h-[50px] bg-[#2b2b2b] flex justify-center items-center text-[21px] text-white rounded-t">
          Lịch sử giao dịch
        </div>
        <div className="p-[15px]">
          <div className="w-full border-[1px] border-gray-400 rounded-b grid grid-cols-2 gap-2 text-black mb-[20px]">
            <div className="flex flex-wrap items-center">
              <div className="font-bold text-sm">Thời gian</div>
              <Button
                onClick={() => handleChangeRange("now")}
                className={`p-1 text-xs rounded hover:!text-black hover:!border-[#adadad] hover:!bg-[#e6e6e6] ${rangeDate.selected === "now" ? "!text-[#a94442]" : ""}`}>
                Hôm nay
              </Button>
              <Button
                onClick={() => handleChangeRange("yesterday")}
                className={`p-1 text-xs rounded hover:!text-black hover:!border-[#adadad] hover:!bg-[#e6e6e6] ${rangeDate.selected === "yesterday" ? "!text-[#a94442]" : ""}`}>
                Hôm qua
              </Button>
              <Button
                onClick={() => handleChangeRange("7days")}
                className={`p-1 text-xs rounded hover:!text-black hover:!border-[#adadad] hover:!bg-[#e6e6e6] ${rangeDate.selected === "7days" ? "!text-[#a94442]" : ""}`}>
                Trong vòng 7 ngày
              </Button>
              <Button
                onClick={() => handleChangeRange("30days")}
                className={`p-1 text-xs rounded hover:!text-black hover:!border-[#adadad] hover:!bg-[#e6e6e6] ${rangeDate.selected === "30days" ? "!text-[#a94442]" : ""}`}>
                Trong vòng 30 ngày
              </Button>
            </div>
            <div className="flex flex-col items-end">
              {/* <div className="font-bold">Phân loại Số tiền</div> */}
              <div className="flex font-bold">
                <div className="flex flex-col text-sm justify-center mr-2">
                  <p>Số</p>
                  <p>tiền</p>
                </div>
                <div className="text-sm">
                  <div>Phân loại</div>
                  <Select
                    style={{ width: "200px" }}
                    defaultValue=""
                    placeholder="Tất cả"
                    onChange={(value) => {
                      // Convert empty string về undefined để tương thích với logic hiện tại
                      setTransactionType(value === "" ? undefined : (value as MailTypeEnum));
                    }}>
                    {options.map((option) => (
                      <Select.Option key={option.value || "all"} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {dataListPaymentType &&
            dataListPaymentType.dataExport &&
            dataListPaymentType.dataExport.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd", backgroundColor: "#f5f5f5" }}>
                  <th className="p-[8px] text-left text-black font-bold">Thời gian</th>
                  <th className="p-[8px] text-right text-black font-bold">Số tiền</th>
                  <th className="p-[8px] text-left text-black font-bold">Loại</th>
                  <th className="p-[8px] text-left text-black font-bold">Mô tả</th>
                  <th className="p-[8px] text-center text-black font-bold">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {dataListPaymentType.dataExport.map(
                  (data: any, index: number) => {
                    // Xác định loại giao dịch
                    const getTransactionType = () => {
                      // Kiểm tra description trước (thường chính xác nhất)
                      const desc = (data.description || data.info || '').toUpperCase();
                      const isWithdrawFromDesc = desc.includes('WITHDRAW') || desc.includes('RÚT');
                      const isDepositFromDesc = desc.includes('DEPOSIT') || desc.includes('NẠP') || desc.includes('ADMIN') || desc.includes('TẠO LỆNH');
                      
                      // Kiểm tra type field từ API
                      let typeLabel = '';
                      let typeValue = '';
                      
                      if (data.type) {
                        typeValue = typeof data.type === 'string' 
                          ? data.type 
                          : data.type?.defaultValue || data.type?.type || '';
                        
                        // Thử render bằng renderTypePayment nếu có trong enum
                        try {
                          const typeKey = typeValue as keyof typeof TRANSACTION_TYPE_ENUM;
                          if (TRANSACTION_TYPE_ENUM[typeKey]) {
                            typeLabel = renderTypePayment(TRANSACTION_TYPE_ENUM[typeKey]);
                          }
                        } catch (e) {
                          // Ignore
                        }
                        
                        // Nếu không có trong enum, dùng logic kiểm tra string
                        if (!typeLabel) {
                          const typeUpper = typeValue.toUpperCase();
                          if (typeUpper.includes('ONLINE_OUT') || typeUpper.includes('OUT') || typeUpper.includes('RÚT') || typeUpper.includes('WITHDRAW')) {
                            typeLabel = 'Rút tiền';
                          } else if (typeUpper.includes('ONLINE_IN') || typeUpper.includes('IN') || typeUpper.includes('NẠP') || typeUpper.includes('DEPOSIT') || typeUpper.includes('THANH TOÁN')) {
                            typeLabel = 'Nạp tiền';
                          }
                        }
                      }
                      
                      // Ưu tiên description, sau đó type, cuối cùng là amount
                      let isWithdraw = false;
                      let isDeposit = false;
                      
                      if (isWithdrawFromDesc) {
                        isWithdraw = true;
                        typeLabel = typeLabel || 'Rút tiền';
                      } else if (isDepositFromDesc) {
                        isDeposit = true;
                        typeLabel = typeLabel || 'Nạp tiền';
                      } else if (typeLabel.includes('Rút')) {
                        isWithdraw = true;
                      } else if (typeLabel.includes('Nạp') || typeLabel.includes('Thanh toán')) {
                        isDeposit = true;
                      } else {
                        // Fallback cuối cùng: dựa vào amount (nhưng ít tin cậy hơn)
                        // Nếu amount dương và không có thông tin gì, mặc định là nạp
                        // Nếu amount âm, chắc chắn là rút
                        if (data.amount < 0) {
                          isWithdraw = true;
                          typeLabel = 'Rút tiền';
                        } else {
                          // Với amount dương, cần kiểm tra kỹ hơn
                          // Nếu description có "Withdraw" thì là rút (dù amount dương)
                          if (desc.includes('WITHDRAW')) {
                            isWithdraw = true;
                            typeLabel = 'Rút tiền';
                          } else {
                            isDeposit = true;
                            typeLabel = 'Nạp tiền';
                          }
                        }
                      }
                      
                      // Xác định màu sắc: Rút tiền = đỏ, Nạp tiền = xanh lá
                      if (isWithdraw) {
                        return { label: 'Rút tiền', color: '#a94442', bgColor: '#f2dede', isWithdraw: true };
                      } else if (isDeposit) {
                        return { label: 'Nạp tiền', color: '#3c763d', bgColor: '#dff0d8', isWithdraw: false };
                      }
                      
                      return { label: typeLabel || 'Khác', color: '#777777', bgColor: '#f5f5f5', isWithdraw: false };
                    };
                    
                    const transactionType = getTransactionType();
                    
                    return (
                      <tr
                        key={data.id}
                        className={`${index % 2 === 0 && "bg-[#f9f9f9]"}`}
                        style={{
                          borderTop: "1px solid #ddd",
                        }}>
                        <td className="p-[8px] leading-[34px] text-black">
                          {dayjs(data.createdAt || data.id).format("YYYY/MM/DD")} (
                          {getShortDayName(dayjs(data.createdAt || data.id))}){" "}
                          {dayjs(data.createdAt || data.id).format("HH:mm:ss")}{" "}
                          <span className="text-[#777777]">
                            {dayjs().diff(dayjs(data.createdAt || data.id), "day") < 30
                              ? `${dayjs().diff(dayjs(data.createdAt || data.id), "day")} ngày trước`
                              : `1 tháng trước`}
                          </span>
                        </td>
                        <td
                          className={`text-right p-[8px] leading-[34px] font-semibold ${transactionType.isWithdraw ? "text-[#a94442]" : "text-[#3c763d]"}`}>
                          {transactionType.isWithdraw ? '-' : '+'}{Math.abs(data.amount || 0)?.toLocaleString('vi-VN')}
                        </td>
                        <td className="p-[8px] leading-[34px]">
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '11px',
                              fontWeight: '500',
                              color: transactionType.color,
                              whiteSpace: 'nowrap',
                            }}>
                            {transactionType.label}
                          </span>
                        </td>
                        <td className="p-[8px] leading-[34px] text-black">
                          {transactionType.isWithdraw ? 'Rút tiền trực tuyến' : (data.description || data.info || '-')}
                        </td>
                        <td
                          className="text-center p-[8px] leading-[34px] text-[#337ab7] cursor-pointer hover:underline"
                          onClick={() => handleOpenDetail(data)}>
                          Chi tiết
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          ) : (
            <div className="col-span-2">
              <div className="p-4 mb-4 bg-[#fcf8e3] border-solid border-[1px] border-t-0 border-[#faebcc] text-sm text-[#8a6d3b]">
                Không có bất kì thông tin nào
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile view - chỉ hiển thị trên mobile */}
      <div className="block md:hidden">
        <ModalMobileTransactionHistory
          handleChangeRange={handleChangeRange}
          rangeDate={rangeDate}
          setTransactionType={setTransactionType}
          transactionType={transactionType}
          dataListPaymentType={dataListPaymentType}
        />
      </div>
      
      <ModalDetailPayment
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        detailPayment={dataPayment}
      />
    </>
  );
}
