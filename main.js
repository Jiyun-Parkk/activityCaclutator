// 1. 본인 서비스키 입력
const SERVICE_KEY =
  "GBoOsGNfCsftDxIeRK2PTityVvGtdVbabSFzh36mdurV72ZcWByr1%2Fc220DpbwPDCKcXSV2kzMdhC5XO8TutHA%3D%3D";

// 2. 오늘 연/월 자동 감지
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1; // 1~12
let workdays = 0;

// 3. API URL 구성
const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?serviceKey=${SERVICE_KEY}&solYear=${year}&solMonth=${String(
  month
).padStart(2, "0")}&_type=json`;

(async () => {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      // 4. 공휴일 목록 파싱 (YYYY-MM-DD)
      let items = data.response.body.items.item;
      if (!items) items = [];
      if (!Array.isArray(items)) items = [items]; // 1개만 있을 때

      const holidays = items.map((item) => {
        // ex: 20240717 -> 2024-07-17
        return item.locdate.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
      });

      // 5. 이번 달 마지막 날
      const lastDate = new Date(year, month, 0).getDate();

      // 6. 평일 중 공휴일 제외해서 계산
      for (let d = 1; d <= lastDate; d++) {
        const date = new Date(year, month - 1, d);
        const dayOfWeek = date.getDay(); // 0:일, 1:월, ..., 6:토

        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
          if (!holidays.includes(dateStr)) {
            workdays++;
          }
        }
      }

      document.querySelector(
        ".date"
      ).innerHTML = `${year}년 ${month}월의 근무일은 <span class="workingDay">${workdays}일</span> 입니다.`;
    })
    .catch((err) => {
      console.error("API 호출 또는 데이터 처리 오류:", err);
    });
})();

document.querySelector(".activityForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const activityNumber = e.target["activityNumber"].value;
  const getRegisterDay = workdays * activityNumber;
  const restTime = (getRegisterDay - Math.trunc(getRegisterDay)).toFixed(1) * 8;
  document.querySelector(".result").innerHTML = ` ${Math.trunc(
    getRegisterDay
  )}일 ${restTime}시간`;
});
