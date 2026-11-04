import { Button, Dialog } from "@xoheeoh/components";

type BasicPolicyChangeHistoryModalProps = {
  open: boolean;
  onClose: () => void;
};

// 기본 정책 변경 이력 조회
export function BasicPolicyChangeHistoryModal({ open, onClose }: BasicPolicyChangeHistoryModalProps) {
  return (
    <Dialog
      size="lg"
      open={open}
      onClose={onClose}
      title="기본 정책 변경 이력"
      footer={<Button variant="outlined" color="neutral" onClick={onClose} label="확인" />}>
      <div style={{ maxHeight: 250, overflowY: "auto" }}>
        <table className="table table--sticky-header">
          <thead>
            <tr>
              <th>항목</th>
              <th>변경내역</th>
              <th>변경일시</th>
              <th>적용일시</th>
              <th>적용여부</th>
              <th>변경자</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>연 발행한도</td>
              <td>500000천원 → 1000000천원</td>
              <td>2021-04-10 14:29</td>
              <td>2021-05-01 09:00</td>
              <td>예정</td>
              <td>admin01 (운영팀/홍길동)</td>
            </tr>
            <tr>
              <td>판매수수료</td>
              <td>6.0% → 10.0%</td>
              <td>2021-04-10 14:29</td>
              <td>2021-05-01 09:00</td>
              <td>완료</td>
              <td>admin01 (운영팀/홍길동)</td>
            </tr>
            <tr>
              <td>연 발행한도</td>
              <td>500000천원 → 1000000천원</td>
              <td>2021-04-10 14:29</td>
              <td>2021-05-01 09:00</td>
              <td>예정</td>
              <td>admin01 (운영팀/홍길동)</td>
            </tr>
            <tr>
              <td>판매수수료</td>
              <td>6.0% → 10.0%</td>
              <td>2021-04-10 14:29</td>
              <td>2021-05-01 09:00</td>
              <td>예정</td>
              <td>admin01 (운영팀/홍길동)</td>
            </tr>
            <tr>
              <td>연 발행한도</td>
              <td>500000천원 → 1000000천원</td>
              <td>2021-04-10 14:29</td>
              <td>2021-05-01 09:00</td>
              <td>예정</td>
              <td>admin01 (운영팀/홍길동)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}

export default BasicPolicyChangeHistoryModal;
