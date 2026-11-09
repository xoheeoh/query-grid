/** 개인정보를 가려서 보여줄 때 쓰는 함수들. "마스킹해제"를 누르면 원래 값을 보여준다. */

/** 휴대폰번호 가운데 자리를 가린다. 010-1234-5678 → 010-****-5678 */
export function maskPhone(phone: string): string {
  return phone.replace(/^(\d{3})-?(\d{3,4})-?(\d{4})$/, (_, a: string, b: string, c: string) => `${a}-${"*".repeat(b.length)}-${c}`);
}

/** 아이디 앞 7자만 남기고 가린다. gildonghong → gildong**** */
export function maskId(id: string): string {
  return id.slice(0, 7) + "*".repeat(Math.max(0, id.length - 7));
}
