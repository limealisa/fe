import { dayNames, TRANSACTION_TYPE_ENUM } from "@/constant";
import renderTypePayment from "@/constant/renderTypePayment";
import { useUser } from "@/context/useUserContext";
import { fNumber } from "@/utils/format-number";
import { Button, Modal } from "antd";
import dayjs from "dayjs";

export default function ModalDetailPayment({
  isOpen,
  onClose,
  detailPayment,
}: {
  isOpen: boolean;
  onClose: () => void;
  detailPayment: any;
}) {
  const { user, balance } = useUser();

  function getShortDayName(date: dayjs.Dayjs): string {
    return dayNames[date.day()];
  }

  const typeKey: keyof typeof TRANSACTION_TYPE_ENUM =
    detailPayment && (detailPayment.type as keyof typeof TRANSACTION_TYPE_ENUM);

  // Xác định loại giao dịch (giống logic trong transaction page)
  const getTransactionType = () => {
    if (!detailPayment) return { isWithdraw: false, label: 'Nạp tiền' };
    
    // Kiểm tra description trước (thường chính xác nhất)
    const desc = (detailPayment.description || detailPayment.info || '').toUpperCase();
    const isWithdrawFromDesc = desc.includes('WITHDRAW') || desc.includes('RÚT');
    const isDepositFromDesc = desc.includes('DEPOSIT') || desc.includes('NẠP') || desc.includes('ADMIN') || desc.includes('TẠO LỆNH');
    
    // Kiểm tra type field từ API
    let typeLabel = '';
    let typeValue = '';
    
    if (detailPayment.type) {
      typeValue = typeof detailPayment.type === 'string' 
        ? detailPayment.type 
        : detailPayment.type?.defaultValue || detailPayment.type?.type || '';
      
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
      // Fallback cuối cùng: dựa vào amount
      if (detailPayment.amount < 0) {
        isWithdraw = true;
        typeLabel = 'Rút tiền';
      } else {
        // Với amount dương, cần kiểm tra kỹ hơn
        if (desc.includes('WITHDRAW')) {
          isWithdraw = true;
          typeLabel = 'Rút tiền';
        } else {
          isDeposit = true;
          typeLabel = 'Nạp tiền';
        }
      }
    }
    
    return { 
      isWithdraw, 
      isDeposit, 
      label: typeLabel || (isWithdraw ? 'Rút tiền' : 'Nạp tiền')
    };
  };
  
  const transactionType = getTransactionType();

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title="Chi tiết lịch sử giao dịch"
      footer={<Button onClick={onClose}>Đóng</Button>}>
      {detailPayment && (
        <div className="p-[15px]">
          <div className="flex">
            <div className="w-1/3 px-[15px] text-right">Số tiền giao dịch</div>
            <div
              className={`w-2/3 px-[15px] ${transactionType.isWithdraw ? "text-[#a94442]" : "text-[#3c763d]"}`}>
              <span className="">
                {transactionType.label}
              </span>{" "}
              <span className="ng-binding">
                {Math.abs(detailPayment.amount || 0)}{" "}
              </span>
            </div>
          </div>
          <div className="flex">
            <div className="w-1/3 px-[15px] text-right text-nowrap">
              số dư sau giao dịch
            </div>
            <div className="w-2/3 px-[15px] ng-binding">{fNumber(balance)}</div>
          </div>
          <div className="flex">
            <div className="w-1/3 px-[15px] text-right">
              thời gian giao dịch
            </div>
            <div className="w-2/3 px-[15px]">
              {dayjs(detailPayment.createdAt).format("YYYY/MM/DD")} (
              {getShortDayName(dayjs(detailPayment.createdAt))}){" "}
              {dayjs(detailPayment.createdAt).format("HH:mm:ss")} -{" "}
              <span className="text-[#777777]">
                {dayjs().diff(dayjs(detailPayment.createdAt), "day") < 30
                  ? `${dayjs().diff(dayjs(detailPayment.createdAt), "day")} ngày trước`
                  : `1 tháng trước`}
              </span>
            </div>
          </div>
          <div className="flex">
            <div className="w-1/3 px-[15px] text-right">Phân loại</div>
            <div className="w-2/3 px-[15px] ng-binding">
              {renderTypePayment(TRANSACTION_TYPE_ENUM[typeKey])}
            </div>
          </div>
          <div className="flex">
            <div className="w-1/3 px-[15px] text-right">ghi chú</div>
            <div className="w-2/3 px-[15px] ng-binding">
              {detailPayment.description}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
