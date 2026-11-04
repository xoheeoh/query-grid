import { Fragment, forwardRef, useImperativeHandle, useState } from "react";
import { EditPanelHandle } from "./types";
import { Banner, Icon, TabPanel, Textarea } from "@xoheeoh/components";
import { mdiEmailEditOutline } from "@mdi/js";
import styles from "../VoucherManagePanel.module.css";

/**
 * 기본적으로 수정화면에서 최초 등록하는 내용
 * 최초 등록 이후 수정하는 경우 데이터 불러옴
 */
export const MessageInfoPannel = forwardRef<EditPanelHandle>(function MessageInfoPannel(_props, ref) {
  // 값이 바뀌면 입력칸을 처음 상태로 다시 그린다. 초기화 버튼이 쓴다.
  const [formKey, setFormKey] = useState(0);

  useImperativeHandle(ref, () => ({
    reset: () => setFormKey((k) => k + 1),
  }));

  return (
    <TabPanel value="message" forceMount className="page-subview-body flex-col gap-16">
      <Fragment key={formKey}>
        <div className={styles.body}>
          <div className={`row-center gap-8 ${styles.title}`}>
            <Icon path={mdiEmailEditOutline} size={22} />
            <span className="text-subtitle2">알림톡 자동지급 메시지</span>
          </div>

          <div className={styles.content}>
            <Banner
              type="info"
              message="이벤트별로 메시지를 작성할 수 있습니다. (최대 400자)"
              detailMessage="지정하신 메시지는 실시간으로 반영됩니다."
            />

            <fieldset className={styles.messageFieldset}>
              <legend className={`text-subtitle2 ${styles.titleBadge} ${styles.success}`}>성공 안내 메시지</legend>

              <span>{"[#{상품권명}] 지급 안내"}</span>

              <Textarea placeholder={`안녕하세요.\n오시장데이 지급 안내입니다.`} maxLength={400} rows={5} />

              <p style={{ lineHeight: 2 }}>
                {"#{수신자명}"}님께 {"#{상품권명} #{선물금액}"}원이 {"#{지급신청한 결제앱}"} APP으로 지급되었습니다.
                <br />▶ {"#{상품권명}"} 지급 및 금액 확인
                <br />- {"#{지급신청한 결제앱}"} APP 내 모바일 상품권 페이지에서 바로 확인 가능합니다.
                <br />▶ 이용 안내
                <br />- {"#{상품권명}"}의 사용기한은 {"#{만료일}"}까지입니다.
                <br />- 기한 내 사용하지 못한 잔액은 만료 후 결제, 결제취소 및 환불이 불가능합니다. 자세한 사용처는
                '바우처 플랫폼' 앱에서 확인 가능합니다.
                <br />
                <br />▶ 상품권 이용방법 상세 안내
                <br />앱 실행 {">"} 바우처 플랫폼 모바일 상품권 메뉴 선택 {">"} 지급된 상품권 및 금액 확인 {">"} 결제하기 메뉴
                선택 {">"} QR 결제 또는 바코드 결제
                <br />▶ 상품권 이용 문의: 바우처 플랫폼 고객센터 0000-0000
              </p>
            </fieldset>

            <fieldset className={styles.messageFieldset}>
              <legend className={`text-subtitle2 ${styles.titleBadge} ${styles.fail}`}>실패 안내 메시지</legend>

              <span>{"[#{상품권명}] 지급 실패 안내"}</span>

              <Textarea placeholder={`안녕하세요.\n오시장데이 지급 안내입니다.`} maxLength={400} rows={5} />

              <p style={{ lineHeight: 2 }}>
                본 메시지는 아직 {"#{지급신청한 결제앱}"} APP에 가입되지 않아, {"#{상품권명}"} 지급이 완료되지 않은 분께
                발송됩니다.
                <br />본 메시지 수령 후 {"#{지급신청한 결제앱}"} APP 내의 모바일 상품권 서비스에 가입되지 않은 경우 상품권
                지급이 취소됩니다.
                <br />▶ {"#{상품권명}"} 지급 예정 APP
                <br />- {"#{지급신청한 결제앱}"} APP에서 모바일 상품권 회원 가입 완료가 확인된 후 지급 예정입니다.
                <br />
                원활한 {"#{상품권명}"} 지급을 위해 {"#{지급신청한 결제앱}"} APP 내의 '바우처 플랫폼 모바일 상품권'에 가입을
                진행해주시기 바랍니다.
                <br />
                이미 바우처 플랫폼 모바일 상품권에 가입하신 상태라면 바우처 플랫폼 고객센터로 문의주시기 바랍니다.
                <br />▶ 상품권 이용 문의: 바우처 플랫폼 고객센터 0000-0000
              </p>
            </fieldset>
          </div>
        </div>
      </Fragment>
    </TabPanel>
  );
});

export default MessageInfoPannel;
