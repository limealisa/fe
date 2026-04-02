/* eslint-disable @next/next/no-img-element */
"use client";

import { Col, Row } from "antd";

export default function SumBetRecordComponent({ betRecords = [] }: any) {
  const Record = ({ label, value }: any) => (
    <Row className="">
      <Col
        span={15}
        className="border p-1.5"
      >
        <b>{label}</b>
      </Col>
      <Col
        span={9}
        className="border p-1.5"
      >
        {value}
      </Col>
    </Row>
  );

  // Sử dụng đúng field từ API response
  const countBetAmountTotal = betRecords.reduce(
    (acc: number, curr: any) => {
      const betAmount = parseFloat(curr.betAmount || curr.stake || curr.validBetAmount || 0);
      return acc + betAmount;
    },
    0,
  );
  
  const countValidBetTotal = betRecords.reduce(
    (acc: number, curr: any) => {
      const validBet = parseFloat(curr.validBetAmount || curr.betAmount || curr.stake || 0);
      return acc + validBet;
    },
    0,
  );
  
  const countWinAmountTotal = betRecords.reduce(
    (acc: number, curr: any) => {
      const winAmount = parseFloat(curr.winAmount || curr.winLoss || 0);
      return acc + winAmount;
    },
    0,
  );
  
  const countTotalRecords = betRecords.length;

  return (
    <div className="border mb-8">
      <Record
        label="Số tiền cược"
        value={countBetAmountTotal.toLocaleString('vi-VN')}
      />
      <Record
        label="Đặt cược có hiệu lực"
        value={countValidBetTotal.toLocaleString('vi-VN')}
      />
      <Record
        label="Thanh toán"
        value={countWinAmountTotal.toLocaleString('vi-VN')}
      />
      <Record
        label="Tổng số đơn"
        value={`Tổng ${countTotalRecords} đơn`}
      />
    </div>
  );
}
