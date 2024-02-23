const { Builder, By, Capabilities, until } = require("selenium-webdriver");
const fs = require("fs");

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
  m: ``, //시중가
  n: ``, //원가
  o: ``, //표준공급가
  p: ``, //판매가
  q: ``, //배송방법
  r: ``, //배송비
  s: ``, //과세여부
  t: ``, //판매수량
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

    // 상품명 가져오기
    const b = await driver.wait(until.elementLocated(By.css("fieldset > div h3")), 10000);
    const bt = await b.getText();
    const modelName = shuffleString(bt);
    const brandName = "꾸러미배송 협력사";
  

    // 상품명 랜덤 재배치
    function shuffleString(targetText) {
      const text = targetText.split(" ");
      return [...text].sort(() => Math.random() - 0.5).join(" ");
    }

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
    categoryCodeList.map((category, i) => {
      const splitedList = category.split(",");
      splitedList.map((_, i) => {
        if (_ === "") {
          splitedList.splice(i, 1);
          i--;
        }
      });
      console.log(splitedList)
    })

    // 데이터에 상품명 넣기
    crawlData.b = modelName;
    crawlData.c = brandName;
    crawlData.d = brandName;
    crawlData.f = modelName;
    crawlData.h = modelName;
    
  } catch (error) {
    console.error("에러:", error);
    throw new Error("이미지 가져오기에 실패했습니다.");
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
