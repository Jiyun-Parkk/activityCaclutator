// 1. 본인 서비스키 입력 (인코딩된 키를 디코딩해서 사용)
const SERVICE_KEY = decodeURIComponent(
  "GBoOsGNfCsftDxIeRK2PTityVvGtdVbabSFzh36mdurV72ZcWByr1%2Fc220DpbwPDCKcXSV2kzMdhC5XO8TutHA%3D%3D"
);
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1; // 1~12
let workdays;
// API를 호출하고 근무일수를 계산하여 '반환'하는 함수
setTimeout(async () => {
  (workdays = await getWorkdays(year, month)), 1000;
});
const getWorkdays = async (year, month) => {
  // 1. 기본 URL과 파라미터 정의
  const endpoint =
    "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo";
  const params = new URLSearchParams(); // URL 파라미터를 관리하는 객체 생성

  // 2. params 객체에 필요한 값들을 추가 (append)
  // 이 과정을 거치면 서비스 키의 특수문자가 자동으로 인코딩됩니다.
  params.append("serviceKey", SERVICE_KEY);
  params.append("solYear", year);
  params.append("solMonth", String(month).padStart(2, "0"));
  params.append("_type", "json");

  // 3. 완성된 URL 생성
  const url = `${endpoint}?${params.toString()}`;

  // console.log("요청 URL:", url); // URL이 어떻게 만들어지는지 확인해보세요.

  let workdays = 0;

  try {
    const res = await fetch(url);

    // 404 같은 서버 오류 응답을 확인하는 코드 추가
    if (!res.ok) {
      throw new Error(`서버 응답 오류: ${res.status}`);
    }

    const data = await res.json();

    // 4. 공휴일 목록 파싱 (YYYY-MM-DD)
    let items = data.response.body.items.item;
    if (!items) items = [];
    if (!Array.isArray(items)) items = [items]; // 공휴일이 1개만 있을 때 배열로 만듦

    const holidays = items.map((item) => {
      // ex: 20240717 -> 2024-07-17
      return String(item.locdate).replace(
        /^(\d{4})(\d{2})(\d{2})$/,
        "$1-$2-$3"
      );
    });

    // 5. 이번 달 마지막 날
    const lastDate = new Date(year, month, 0).getDate();

    // 6. 평일 중 공휴일 제외해서 계산
    for (let d = 1; d <= lastDate; d++) {
      const date = new Date(year, month - 1, d);
      const dayOfWeek = date.getDay(); // 0:일, 1:월, ..., 6:토

      // 주말이 아니면 (월~금)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workdays++;
      }
    }

    workdays -= holidays.length;
    document.querySelector(
      ".date"
    ).innerHTML = `${year}년 ${month}월의 근무일은 <span class="workingDay">${workdays}일</span> 입니다.`;
    document.querySelector(
      ".holiday"
    ).innerHTML = `${year}년 ${month}월의 공휴일은 <span class="workingDay">${holidays.length}일</span> 입니다.`;

    return workdays; // 계산된 근무일수를 반환
  } catch (err) {
    console.error("API 호출 또는 데이터 처리 오류:", err);
    alert("공휴일 정보를 가져오는 데 실패했습니다.");
    return null; // 오류 발생 시 null 반환
  }
};

// 폼 제출 이벤트 처리
document
  .querySelector(".activityForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    // 2. 오늘 연/월 자동 감지

    // getWorkdays 함수가 끝날 때까지 기다렸다가 근무일수(workdays)를 받음

    // workdays가 정상적으로 받아졌을 때만 아래 로직 실행
    if (workdays !== null) {
      const activityNumber = e.target["activityNumber"].value;
      const getRegisterDay = workdays * activityNumber;
      console.log(workdays);

      const restTime =
        (getRegisterDay - Math.trunc(getRegisterDay)).toFixed(1) * 8;

      document.querySelector(".result").innerHTML = ` ${Math.trunc(
        getRegisterDay
      )}일 ${restTime}시간`;
    }
  });
