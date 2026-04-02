/* eslint-disable @next/next/no-img-element */
"use client";

import { Col, Row } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faStar, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";

export default function BetRecordComponent({ betRecords }: any) {
  // constant
  const initialItems = [
    {
      label: (
        <FontAwesomeIcon
          className="text-[#ffca00]"
          icon={faStar}
        />
      ),
      children: "Hộp khuyến mãi",
      key: "1",
      closable: false,
    },

    {
      label: "Hộp thư đến",
      children: "Hộp thư đến",
      key: "2",
      closable: false,
    },
    {
      label: "Hộp thư đi",
      children: "Hộp thư đi",
      key: "3",
      closable: false,
    },
  ];

  const formatTime = (time: Date) => {
    const yyyy = time.getFullYear();
    const mm = time.getMonth();
    const dd = time.getDay();
    const hh = time.getHours();
    const MM = time.getMinutes();
    const ss = time.getSeconds();
    const tzOffsetMinutes = time.getTimezoneOffset() / 60;

    const tz = tzOffsetMinutes >= 0 ? "+" + tzOffsetMinutes : tzOffsetMinutes;

    return `${yyyy}/${mm}/${dd} ${hh}:${MM}:${ss} GMT${tz}`;
  };

  const Record = ({ label, value }: any) => (
    <Row className="">
      <Col
        span={9}
        className="border p-1.5"
      >
        <b>{label}</b>
      </Col>
      <Col
        span={15}
        className="border p-1.5"
      >
        {value}
      </Col>
    </Row>
  );

  return (
    <div>
      {betRecords && betRecords.length > 0 ? (
        betRecords.map((betRecord: any, index: number) => {
          const nowDayjs = dayjs();

          const getDayLeft = (time: any) => {
            if (!time) return "vài giây trước";
            const timeDayjs = dayjs(time);
            return [
              [nowDayjs.diff(timeDayjs, "days"), "ngày trước"],
              [nowDayjs.diff(timeDayjs, "hours"), "giờ trước"],
              [nowDayjs.diff(timeDayjs, "minutes"), "phút trước"],
              [nowDayjs.diff(timeDayjs, "seconds"), "giây trước"],
            ]
              .find((v) => (v[0] as number) > 0)
              ?.join(" ") || "vài giây trước";
          };

          // Sử dụng đúng field từ API response
          const betTime = betRecord.betTime || betRecord.createdAt || betRecord.betTimeStart;
          const settleTime = betRecord.settleTime || betRecord.updatedAt || betRecord.betTimeEnd;
          const betAmount = betRecord.betAmount || betRecord.stake || betRecord.validBetAmount || 0;
          const validBetAmount = betRecord.validBetAmount || betRecord.betAmount || betRecord.stake || 0;
          const winAmount = betRecord.winAmount || betRecord.winLoss || 0;
          const gameName = betRecord.gameName || betRecord.gameCode || "-";
          const gameType = betRecord.gameType || betRecord.productType || "-";

          const betTimeFormatted = betTime ? dayjs(betTime).format("YYYY/MM/DD HH:mm:ss") : "-";
          const settleTimeFormatted = settleTime ? dayjs(settleTime).format("YYYY/MM/DD HH:mm:ss") : "-";

          const betTimeDayAgo = betTime ? getDayLeft(betTime) : "-";
          const settleTimeDayAgo = settleTime ? getDayLeft(settleTime) : "-";

          return (
            <div
              key={betRecord.id || betRecord.betOrderNo || index}
              className="border mb-8"
            >
              <Record
                label="Thứ tự"
                value={index + 1}
              />
              <Record
                label="Loại trò chơi"
                value={gameType}
              />
              <Record
                label="Tên trò chơi"
                value={gameName}
              />
              <Record
                label={
                  <>
                    Thời gian đặt <br /> cược
                  </>
                }
                value={
                  <div>
                    <p>{betTimeFormatted}</p>
                    {betTimeDayAgo && <p className="text-gray-500">{betTimeDayAgo}</p>}
                  </div>
                }
              />
              <Record
                label="Thời gian thanh toán"
                value={
                  <div>
                    <p>{settleTimeFormatted}</p>
                    {settleTimeDayAgo && <p className="text-gray-500">{settleTimeDayAgo}</p>}
                  </div>
                }
              />
              <Record
                label="Số tiền đặt cược"
                value={parseFloat(betAmount).toLocaleString('vi-VN')}
              />
              <Record
                label="Đặt cược có hiệu lực"
                value={parseFloat(validBetAmount).toLocaleString('vi-VN')}
              />
              <Record
                label="Thanh toán"
                value={parseFloat(winAmount).toLocaleString('vi-VN')}
              />
            </div>
          );
        })
      ) : (
        <div className="w-full text-center text-sm pt-2 pb-8">
          Không có dữ liệu
        </div>
      )}
    </div>
  );
}
