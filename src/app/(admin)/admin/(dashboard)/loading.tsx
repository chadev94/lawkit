/**
 * 탭을 바꿔 DB 를 읽는 동안. 상단에 가느다란 진행선을 보여 "눌렸다"는 것을 알린다.
 * 이전 화면이 멈춘 듯 보이다가 갑자기 바뀌는 것보다 낫다.
 */
export default function AdminLoading() {
  return (
    <div className="a-loading" role="status" aria-label="불러오는 중">
      <div className="a-loading-bar" />
    </div>
  );
}
