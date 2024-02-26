const { Builder, By, Capabilities, until } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");
const https = require("https"); // https 모듈 불러오기
const axios = require("axios");
const appRoot = require("app-root-path");

let crawlData = {
  a: `__AUTO__`, //업체상품코드
  b: ``, //모델명
  c: ``, //브랜드
  d: ``, //제조사
  e: `해외=아시아=중국`, //원산지
  f: ``, //상품명
  g: ` `, //홍보문구
  h: ``, //요약상품명
  i: ``, //표준산업코드
  j: ``, //카테고리코드
  k: ``, //사용자분류명
  l: ``, //한줄메모
  m: 0, //시중가
  n: 0, //원가
  o: 0, //표준공급가
  p: ``, //판매가
  q: `무료`, //배송방법
  r: 0, //배송비
  s: `Y`, //과세여부
  t: 999, //판매수량
  u: ``, //이미지1URL
  v: ``, //이미지2URL
  w: ``, //이미지3URL
  x: ``, //이미지4URL
  y: ``, //GIF생성
  z: ``, //이미지6URL
  aa: ``, //이미지7URL
  ab: ``, //이미지8URL
  ac: ``, //이미지9URL
  ad: ``, //이미지10URL
  ae: ``, //추가정보
  af: ``, //입력사항
  ag: ``, //옵션구분
  ah: ``, //선택옵션
  ai: ``, //입력형옵션
  aj: ``, //추가구매옵션
  ak: ``, //상세설명
  al: ``, //추가상세설명
  am: ``, //광고/홍보
  an: ``, //제조일자
  ao: ``, //유효일자
  ap: ``, //사은품내용
  aq: ``, //키워드
  ar: ``, //인증구분
  as: ``, //인증정보
  at: ``, //거래처
  au: ``, //영어상품명
  av: ``, //중국어상품명
  aw: ``, //일본어상품명
  ax: ``, //영어상세설명
  ay: ``, //중국어상세설명
  az: ``, //일본어상세설명
  ba: ``, //상품무게
  bb: ``, //영어키워드
  bc: ``, //중국어키워드
  bd: ``, //일본어키워드
  be: ``, //생산지국가
  bf: ``, //전세계배송코드
  bg: ``, //사이즈
  bh: ``, //포장방법
  bi: ``, //개별카테고리
  bj: ``, //상품상세코드
  bk: ``, //상품상세1
  bl: ``, //상품상세2
  bm: ``, //상품상세3
  bn: ``, //상품상세4
  bo: ``, //상품상세5
  bp: ``, //상품상세6
  bq: ``, //상품상세7
  br: ``, //상품상세8
  bs: ``, //상품상세9
  bt: ``, //상품상세10
  bu: ``, //상품상세11
  bv: ``, //상품상세12
  bw: ``, //상품상세13
  bx: ``, //상품상세14
  by: ``, //상품상세15
  bz: ``, //상품상세16
  ca: ``, //상품상세17
  cb: ``, //상품상세18
  cc: ``, //상품상세19
  cd: ``, //상품상세20
  ce: ``, //상품상세21
  cf: ``, //상품상세22
  cg: ``, //상품상세23
  ch: ``, //상품상세24
  ci: ``, //상품상세25
  cj: ``, //상품상세26
};

async function generate(url, driver) {
  try {
    // 웹 페이지 열기
    await driver.get(`${url}`);

    // sleep();
    // 상품명 가져오기
    const b = await driver.wait(
      until.elementLocated(By.css("fieldset > div h3")),
      10000
    );
    const bt = await b.getText();

    const modelName = shuffleString(bt);
    const brandName = "꾸러미배송 협력사";
    let categoryCode = "";

    // 상품명 랜덤 재배치
    function shuffleString(targetText) {
      const text = targetText.split(" ");
      return [...text].sort(() => Math.random() - 0.5).join(" ");
    }

    // sleep();
    // 카테고리 코드 가져오기 시작
    let categoriesList = [];
    const categories = await driver.wait(
      until.elementsLocated(By.css("._1_FPHJbv10")),
      10000
    );

    for (const category of categories) {
      categoriesList.push(await category.getText());
    }

    const categoryCodeExcel = fs.readFileSync(
      "./excel/categories.csv",
      "utf-8"
    );

    let categoryCodeList = categoryCodeExcel.split(/\n|\r/);
    categoryCodeList.map((_, i) => {
      if (categoryCodeList[i] == "") {
        categoryCodeList.splice(i, 1);
        i--;
      }
    });

    let splitedList = categoryCodeList.filter((category, i) => {
      return category.split(",");
    });

    splitedList.map((list, i) => {
      if (list.includes(categoriesList[categoriesList.length - 1])) {
        const listArr = list.split(",");
        const targetCode = listArr[listArr.length - 1];
        categoryCode = targetCode;
      }
    });
    // 카테고리 코드 가져오기 끝

    // 상품 가격 가져오기
    const priceTemp = await driver.wait(
      until.elementLocated(By.css("._1LY7DqCnwR")),
      10000
    );
    const price = await priceTemp.getText();

    // 썸네일 이미지 소스 가져오기
    const thumbnailImg = await driver.wait(
      until.elementLocated(By.css(".bd_2DO68")),
      10000
    );
    const thumbnailSrc = await thumbnailImg.getAttribute("src");

    // 이미지 다운로드
    const imageResponse = await axios.get(thumbnailSrc, {
      responseType: "arraybuffer",
      httpsAgent: new https.Agent({ rejectUnauthorized: false }), // SSL 인증서 검증 건너뛰기
    });

    // 이미지를 파일로 저장하기
    const filename = `${Date.now()}.png`; // 파일명을 현재 시간으로 설정
    const imagePath = `temp/${filename}`; // 이미지가 저장될 경로
    fs.writeFileSync(imagePath, Buffer.from(imageResponse.data));

    const rootPath = appRoot.toString();

    // crawlData에 데이터 넣기
    crawlData.b = modelName;
    crawlData.c = brandName;
    crawlData.d = brandName;
    crawlData.f = modelName;
    crawlData.h = modelName;
    crawlData.j = categoryCode;
    crawlData.p = price;
  } catch (error) {
    console.error("에러:", error);
    throw new Error("이미지 가져오기에 실패했습니다.");
  }
}

// 슬립 펑션
function sleep() {
  const randomSec = Math.random() * (3 - 2 + 1) + 2;
  let start = Date.now(),
    now = start;
  while (now - start < randomSec * 1000) {
    now = Date.now();
  }
}

// async function getImageURL() {
//   // 이미지 요소 찾기
//   let imageElement = await driver.findElement(By.css(".bd_2DO68"));

//   const brandName = `꾸러미배송 협력사`;

//

//   // 이미지 URL 가져오기
//   // let imageURL = await imageElement.getAttribute("src");
//   // 웹 드라이버 종료
//   // await driver.quit();
// }

module.exports = { generate };
