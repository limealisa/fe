/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import {
  Button,
  Checkbox,
  DatePicker,
  Radio,
  RadioChangeEvent,
  Select,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import ModalMobileBetRecord from "@/components/ModalMobileBetRecord";
import querystring from "querystring";
import { contentInstance } from "@/configs/CustomizeAxios";
import {
  BetRecordEndPoint,
  ConfigMailBoxEndPoint,
} from "@/api/services/contants";

export default function BetRecord() {
  // Convert ISO date to BC88BET format: "DD/MM/YYYY HH:mm:ss"
  const formatDateToBC88BET = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      
      // Tính giờ UTC+7 (chênh lệch 7 * 60 phút = 420 phút)
      const utc7Offset = 7 * 60; // phút
      const localOffset = date.getTimezoneOffset(); // phút
      const totalOffset = utc7Offset + localOffset;
      
      const utc7Date = new Date(date.getTime() + totalOffset * 60 * 1000);
      
      const pad = (n: number) => n.toString().padStart(2, "0");
      
      const day = pad(utc7Date.getDate());
      const month = pad(utc7Date.getMonth() + 1);
      const year = utc7Date.getFullYear();
      const hours = pad(utc7Date.getHours());
      const minutes = pad(utc7Date.getMinutes());
      const seconds = pad(utc7Date.getSeconds());
      
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return isoDate;
    }
  };

  const firstDayOfCurrentMonth = () => {
    const now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    return now;
  };
  const [value, setValue] = useState(1);
  const [betRecords, setBetRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [filterOptions, setFilterOptions] = useState<any>({
    betTimeStart: firstDayOfCurrentMonth().toISOString(),
    betTimeEnd: new Date().toISOString(),
    type: undefined,
  });

  useEffect(() => {
    getBetRecords({});
  }, []);

  const getBetRecords = async (options = {}) => {
    try {
      setBetRecords([]);
      
      // Convert date format từ ISO sang BC88BET format
      const from = formatDateToBC88BET(filterOptions.betTimeStart || firstDayOfCurrentMonth().toISOString());
      const to = formatDateToBC88BET(filterOptions.betTimeEnd || new Date().toISOString());
      
      // BC88BET API params
      const params: any = {
        page: 1,
        limit: 100,
        from: from,
        to: to,
      };
      
      console.log("getBetRecords - Request params:", params);
      
      const response = await contentInstance.get(BetRecordEndPoint.BET_RECORD, { params });
      
      console.log("getBetRecords - Raw response:", response);
      
      // BC88BET response format: { dataExport: [...], total: number, page: number, kmess: number }
      // contentInstance interceptor đã trả về data trực tiếp
      const responseData = response?.data || response;
      
      console.log("getBetRecords - Response data:", responseData);
      
      const records = responseData?.dataExport || responseData?.data || [];
      const totalCount = responseData?.total || 0;
      
      console.log("getBetRecords - Records count:", records.length);
      console.log("getBetRecords - Total:", totalCount);
      
      setBetRecords(records);
      setTotal(totalCount);
    } catch (error: any) {
      console.error("getBetRecords error:", error);
      console.error("getBetRecords error response:", error?.response);
      setBetRecords([]);
      setTotal(0);
    }
  };

  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };
  return (
    <div className="w-full">
      {/* Desktop view - ẩn trên mobile */}
      <div className="hidden md:block">
        <div className="h-[50px] bg-[#2b2b2b] flex justify-center items-center text-[21px] text-white rounded-t-sm">
          Lịch sử đặt cược
        </div>

        <div className="p-2 border-solid border-[1px] border-gray-400 bg-white text-black font-helvetica">
        <Radio.Group
          onChange={onChange}
          value={value}
          style={{
            width: "100%",
            padding: "2px",
          }}
        >
          <div className="border-solid border-[1px] border-gray-400 grid grid-cols-2 w-full p-2 gap-2">
            <div className="col-span-1  flex flex-col gap-2">
              <Radio value={1}>Thời gian đặt cược</Radio>
              <div>
                <DatePicker lang="vi" />{" "}
                <span className="mx-1 text-[16px] text-black">-</span>
                <DatePicker lang="vi" />
              </div>
              <Checkbox>Chỉ tìm kiếm đơn cược chưa thanh toán</Checkbox>
            </div>

            <div className="col-span-1  flex flex-col gap-2">
              <Radio value={2}>Thời gian đặt cược</Radio>
              <div>
                <DatePicker lang="vi" />{" "}
                <span className="mx-1 text-[16px] text-black font-bold">-</span>
                <DatePicker lang="vi" />
              </div>
              <div className="flex justify-between w-3/4">
                <div className="font-bold text-black text-[14px]">
                  Loại trò chơi
                </div>
                <Select style={{ width: "200px" }} defaultValue={"all1"}>
                  <Select.Option value="all1">
                    Không có hồ sơ trò chơi gần dây
                  </Select.Option>
                </Select>
              </div>
            </div>
          </div>
        </Radio.Group>
        <div className="w-full pr-20 flex justify-end py-2">
          <Button>Tìm kiếm</Button>
        </div>

        <div className="w-full grid grid-cols-12 border-t-solid border-b-solid border-t-[1px] border-t-gray-400 font-bold py-2 text-sm">
          <div className="col-span-2">Tên trò chơi</div>
          <div className="col-span-4">Thời gian thanh toán</div>

          <div className="col-span-4">Cược hợp lệ</div>

          <div className="col-span-2">Thanh toán</div>
        </div>

        <div className="w-full grid grid-cols-12 border-t-solid border-b-solid border-t-[1px]  border-b-[1px] border-t-gray-400 font-bold py-2 border-b-gray-400  text-sm">
          <div className="col-span-2">Tổng đơn: {betRecords.length} đơn</div>
          <div className="col-span-4"></div>

          <div className="col-span-4">
            {betRecords.reduce((sum, record) => sum + (parseFloat(record.validBetAmount) || 0), 0).toLocaleString('vi-VN')}
          </div>

          <div className="col-span-2">
            {betRecords.reduce((sum, record) => sum + (parseFloat(record.winAmount) || 0), 0).toLocaleString('vi-VN')}
          </div>
        </div>

        {betRecords.length > 0 ? (
          <div className="w-full">
            {betRecords.map((record: any, index: number) => (
              <div
                key={record.id || record.betOrderNo || index}
                className="w-full grid grid-cols-12 border-t-solid border-t-[1px] border-t-gray-400 py-2 text-sm hover:bg-gray-50">
                <div className="col-span-2 px-2">{record.gameName || record.gameCode || '-'}</div>
                <div className="col-span-4 px-2">
                  {record.betTime ? dayjs(record.betTime).format("YYYY/MM/DD HH:mm:ss") : '-'}
                </div>
                <div className="col-span-4 px-2">
                  {(parseFloat(record.validBetAmount) || 0).toLocaleString('vi-VN')}
                </div>
                <div className="col-span-2 px-2">
                  {(parseFloat(record.winAmount) || 0).toLocaleString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full text-center text-sm pt-2 pb-8">
            Tất cả thông tin đã được hiện ra
          </div>
        )}
        </div>
      </div>
      
      {/* Mobile view - chỉ hiển thị trên mobile */}
      <div className="block md:hidden">
        <ModalMobileBetRecord
          betRecords={betRecords}
          filterOptions={filterOptions}
          setFilterOptions={(newOptions: any) => {
            setFilterOptions(newOptions);
            // Gọi lại API khi filter thay đổi
            setTimeout(() => {
              getBetRecords({});
            }, 100);
          }}
          getBetRecords={getBetRecords}
        ></ModalMobileBetRecord>
      </div>
    </div>
  );
}
