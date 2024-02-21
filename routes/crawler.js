const { Builder, By, Capabilities } = require("selenium-webdriver");

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

    /**
     **브랜드 제조사	*원산지	*상품명	홍보문구	요약상품명	표준산업코드	카테고리코드	사용자분류명	한줄메모	시중가	원가	표준공급가	*판매가	배송방법	배송비	*과세여부	*판매수량	*이미지1URL	이미지2URL	이미지3URL	이미지4URL	GIF생성	이미지6URL	이미지7URL	이미지8URL	이미지9URL	이미지10URL	추가정보 입력사항	옵션구분	선택옵션	입력형옵션	추가구매옵션	*상세설명	추가상세설명	광고/홍보	제조일자	유효일자	사은품내용	키워드	인증구분	인증정보	거래처	영어상품명	중국어상품명	일본어상품명	영어상세설명	중국어상세설명	일본어상세설명	상품무게	영어키워드	중국어키워드	일본어키워드	생산지국가	전세계배송코드	사이즈	포장방법	개별카테고리	상품상세코드	상품상세1	상품상세2	상품상세3	상품상세4	상품상세5	상품상세6	상품상세7	상품상세8	상품상세9	상품상세10	상품상세11	상품상세12	상품상세13	상품상세14	상품상세15	상품상세16	상품상세17	상품상세18	상품상세19	상품상세20	상품상세21	상품상세22	상품상세23	상품상세24	상품상세25	상품상세26

     *
     */
    // 웹 페이지 열기
    await driver.get(
      "https://smartstore.naver.com/richcommerce/products/9807129161"
    );
    // 이미지 요소 찾기
    let imageElement = await driver.findElement(By.css(".bd_2DO68"));

    const b = await driver.findElement(By.css("fieldset > div h3"));
    const bt = await b.getText();

    let crawlData = {
      a: `__AUTO__`, //업체상품코드
      b: `${shuffleString(bt)}`, //모델명
      c: ``,
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

function shuffleString(targetText) {
  const text = targetText.split(" ");
  return [...text].sort(() => Math.random() - 0.5).join(" ");
}

module.exports = getImageURL;
