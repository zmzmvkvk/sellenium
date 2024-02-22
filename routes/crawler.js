const { Builder, By, Capabilities } = require("selenium-webdriver");

// TODO: CSV에서 URL전달받은거 순회해서 url에 뿌려주기.
const url = "https://smartstore.naver.com/richcommerce/products/9807129161";

async function getImageURL() {
  try {
    // 사용자 에이전트 설정
    const chromeCapabilities = Capabilities.chrome();
    chromeCapabilities.set("chromeOptions", {
      args: [
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      ],
    });

    // 웹 드라이버 생성
    let driver = await new Builder()
      .forBrowser("chrome")
      .withCapabilities(chromeCapabilities)
      .build();

    // 웹 페이지 열기
    await driver.get(`${url}`);
    // 이미지 요소 찾기
    let imageElement = await driver.findElement(By.css(".bd_2DO68"));

    const b = await driver.findElement(By.css("fieldset > div h3"));
    const bt = await b.getText();

    function shuffleString(targetText) {
      const text = targetText.split(" ");
      return [...text].sort(() => Math.random() - 0.5).join(" ");
    }

    const brandName = `꾸러미배송 협력사`;

    const j = await driver.findElements(By.className("_1_FPHJbv10"));

    let crawlData = {
      a: `__AUTO__`, //업체상품코드
      b: `${shuffleString(bt)}`, //모델명
      c: `${brandName}`, //브랜드
      d: `${brandName}`, //제조사
      e: `해외=아시아=중국`, //원산지
      f: `${shuffleString(bt)}`, //상품명
      g: ` `, //홍보문구
      h: `${shuffleString(bt)}`, //요약상품명
      i: `${j}`, //표준산업코드
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

    // 이미지 URL 가져오기
    // let imageURL = await imageElement.getAttribute("src");
    // 웹 드라이버 종료
    // await driver.quit();

    return crawlData;
  } catch (error) {
    console.error("에러:", error);
    throw new Error("이미지 가져오기에 실패했습니다.");
  }
}

module.exports = getImageURL;
