import {rouletteData_1, rouletteData_2} from './rouletteData.js'

// 요구사항
// 1. 기본적으로는 1번 데이터로 룰렛을 셋팅한다
// 2. 셀렉트 박스가 변경되면, 선택된 값으로 룰렛판을 재설정한다
// 3. 버튼을 클릭하면 룰렛을 돌리고, 데이터를 fetch 한다
// 4. 서버에서 받아온 당첨 값에 룰렛이 천천히 멈춘다
// 5. 한번 돌리면 버튼 disabled 된다

const roulette = document.getElementById("roulette");
const selectBox = document.getElementById("select-box");
const resultBox = document.getElementById("result-box");
const shootButton = document.getElementById("shoot-btn");

const colorCache = {};

const initialize = function () {
  createRoulette(rouletteData_1);
};

initialize();

function createRoulette(data) {
  roulette.innerHTML = "";

  // 부채꼴 중심각
  const sectionAngle = 360 / data.length;

  data.forEach((item, index) => {
    const section = document.createElement("div");
    section.className = `roulette-section`;

    // 각 섹션의 시작 각도와 끝 각도를 계산
    const startAngle = index * sectionAngle;
    const angleInRadians = (sectionAngle * Math.PI) / 180; // 각도를 라디안으로 변환

    const x = 50 + 50 * Math.cos(angleInRadians);
    const y = 50 + 50 * Math.sin(angleInRadians);

    section.style.background = `conic-gradient(${getRandomColor(index)} 0deg, ${getRandomColor(
      index
    )} ${sectionAngle}deg, transparent ${sectionAngle}deg)`;

    section.style.zIndex = data.length - index;
    // 부채꼴 모양 만들기
    section.style.clipPath = `polygon(
        50% 50%,
        100% 0%,
        ${x}% ${y}%, 
        50% 50%
    );`;
    section.style.transform = `rotate(${startAngle}deg)`;

    const label = document.createElement("p");
    label.className = "section-label";
    label.textContent = item.name;

    section.appendChild(label);
    roulette.appendChild(section);
  });
}

function mockApiCall() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const selectedValue = document.getElementById("select-box").value;

      switch (selectedValue) {
        case "1":
          resolve(rouletteData_1);
          break;
        case "2":
          resolve(rouletteData_2);
          break;
        default:
          reject("Error occur");
      }
    }, 2000);
  });
}

function spinRoulette() {
  roulette.style.animation = "spin 0.2s linear infinite";
}

function stopRoulette(targetDeg) {
  // 타겟 각도를 인자로 받아 그 각도에 멈추도록 셋팅
  console.log(targetDeg);
  roulette.style.transform = `rotate(-${targetDeg}deg)`;
  roulette.style.animation = "none";
}

async function onClickShootBtn() {
  spinRoulette();
  shootButton.setAttribute("disabled", "");

  try {
    const res = await mockApiCall();
    const sectionAngle = 360 / res.length;
    const [winning] = res.filter((data) => data.value === 1);
    // target arrow가 중심에 오도록 만들어 줌
    const targetDeg = ((winning.id * sectionAngle) - (sectionAngle / 2));

    stopRoulette(targetDeg);
    resultBox.innerHTML = winning.name;
  } catch (error) {
    console.error("API 호출 중 오류 발생:", error);
  }
}

function onChangeSelectBox() {
  // 1. 결과박스 초기화
  // 2. 버튼 disabled 풀기
  // 3. 룰렛 판 변경

  resultBox.innerHTML = "";
  shootButton.removeAttribute("disabled");
  changeRoulettePositionBySelection();
}

function changeRoulettePositionBySelection() {
  const selectedValue = selectBox.value;

  switch (selectedValue) {
    case "1":
      return createRoulette(rouletteData_1);
    case "2":
      return createRoulette(rouletteData_2);
  }
}

function getRandomColor(index) {
  // 이미 해당 index에 대한 색상이 캐시되어 있다면, 그 색상을 반환
  if (colorCache[index]) {
    return colorCache[index];
  }

  // 그렇지 않다면 새 색상을 생성하고, 캐시에 저장한 후 반환
  const newColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  colorCache[index] = newColor;
  return newColor;
}
