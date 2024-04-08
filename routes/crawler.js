const { Builder, By, Key, until, Actions } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");
const https = require("https"); // https 모듈 불러오기
const axios = require("axios");
const Jimp = require("jimp");
const appRoot = require("app-root-path");
const AWS = require("aws-sdk");
const userList = require("../data/user");

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
});

/* S3에 있는 버킷 리스트 출력 */
const s3 = new AWS.S3();
// const userId = `1truss`;
// const phoneNum = `010-4380-9730`;

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
  ae: ``, //추가정보입력사항
  af: `SM`, //옵션구분
  ag: ``, //선택옵션
  ah: ``, //입력형옵션
  ai: ``, //추가구매옵션
  aj: ``, //상세설명
  ak: ``, //추가상세설명
  al: ``, //광고/홍보
  am: ``, //제조일자
  an: ``, //유효일자
  ao: ``, //사은품내용
  ap: ``, //키워드
  aq: `B`, //인증구분
  ar: ``, //인증정보
  as: ``, //거래처
  at: ``, //영어상품명
  au: ``, //중국어상품명
  av: ``, //일본어상품명
  aw: ``, //영어상세설명
  ax: ``, //중국어상세설명
  ay: ``, //일본어상세설명
  az: 0, //상품무게
  ba: ``, //영어키워드
  bb: ``, //중국어키워드
  bc: ``, //일본어키워드
  bd: ``, //생산지국가
  be: ``, //전세계배송코드
  bf: ``, //사이즈
  bg: `봉투`, //포장방법
  bh: ``, //개별카테고리
  bi: 35, //상품상세코드
  bj: `상세설명참조`, //상품상세1
  bk: `상세설명참조`, //상품상세2
  bl: `해당사항 없음`, //상품상세3
  bm: `중국`, //상품상세4
  bn: `상세설명참조`, //상품상세5
  bo: `Y`, //상품상세6
  bp: `상세설명참조`, //상품상세7
  bq: `${phoneNum}`, //상품상세8
  br: ``, //상품상세9
  bs: ``, //상품상세10
  bt: ``, //상품상세11
  bu: ``, //상품상세12
  bv: ``, //상품상세13
  bw: ``, //상품상세14
  bx: ``, //상품상세15
  by: ``, //상품상세16
  bz: ``, //상품상세17
  ca: ``, //상품상세18
  cb: ``, //상품상세19
  cc: ``, //상품상세20
  cd: ``, //상품상세21
  ce: ``, //상품상세22
  cf: ``, //상품상세23
  cg: ``, //상품상세24
  ch: ``, //상품상세25
  ci: ``, //상품상세26
};

async function generate(url, driver) {
  try {
    await driver.get(`${url}`);

    // 상품명 가져오기
    const b = await driver.wait(
      until.elementLocated(By.css("fieldset > div h3")),
      3000
    );
    const bt = await b.getText();

    const modelName = shuffleString(bt);
    const brandName = "꾸러미배송 협력사";

    // 카테고리 코드 가져오기 시작
    let categoryCode;
    let categoriesList = [];
    const categories = await driver.wait(
      until.elementsLocated(By.css("._1_FPHJbv10")),
      3000
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
      list.split(",").map((it) => {
        if (it === categoriesList[categoriesList.length - 1]) {
          const listArr = list.split(",");
          const targetCode = listArr[listArr.length - 1];
          categoryCode = parseInt(targetCode);
        }
      });
    });
    // 카테고리 코드 가져오기 끝

    // 상품 가격 가져오기 시작
    let splitedPrice = 0;
    const priceTemp = await driver.wait(
      until.elementLocated(By.css("strong ._1LY7DqCnwR")),
      3000
    );
    const price = await priceTemp.getText();
    splitedPrice = parseInt(price.replace(",", ""));

    // 상품 가격 가져오기 끝

    // 썸네일 가져오기 시작
    let thumbnailLi;

    try {
      thumbnailLi = await driver.wait(
        until.elementsLocated(By.css(".bd_2YVUb li")),
        3000
      );
    } catch (error) {
      thumbnailLi = [];
    }

    let thumbArr = [];

    if (
      thumbnailLi.length === 0 ||
      thumbnailLi.length === null ||
      thumbnailLi.length === undefined
    ) {
      try {
        const thumbnailImg = await driver.wait(
          until.elementLocated(By.css(".bd_2DO68")),
          3000
        );

        const thumbnailSrc = await thumbnailImg.getAttribute("src");
        thumbArr.push(thumbnailSrc);
      } catch (error) {
        console.error(
          "썸네일 이미지를 가져오는 도중 오류가 발생했습니다.",
          error
        );
      }
    } else {
      for await (const element of thumbnailLi) {
        await element.click();

        try {
          const thumbnailImg = await driver.wait(
            until.elementLocated(By.css(".bd_2DO68")),
            3000
          );

          const thumbnailSrc = await thumbnailImg.getAttribute("src");
          thumbArr.push(thumbnailSrc);
        } catch (error) {
          console.error(
            "썸네일 이미지를 가져오는 도중 오류가 발생했습니다.",
            error
          );
        }
      }
    }
    // 썸네일 가져오기 끝

    // 옵션 가져오기 시작
    const optionBtn = await driver.wait(
      until.elementLocated(By.css(".bd_1fhc9")),
      3000
    );

    optionBtn.click();

    const optionLi = await driver.wait(
      until.elementsLocated(By.css(".bd_zxkRR li")),
      3000
    );

    let optionType = `[옵션타입]`;

    for await (const option of optionLi) {
      const text = await option.getText();
      const indexOfPlus = text.indexOf("(+");

      if (indexOfPlus !== -1) {
        const s = (await text.indexOf("(+")) + 2;
        const e = await text.indexOf("원");
        const subText = await text.substring(0, text.indexOf("(+")).trim();
        const plusCharge = await text.substring(s, e);
        const optionText = `${subText}==${plusCharge}`;
        optionType += `${optionText}==999=0=0=0=
        `;
      } else {
        optionType += `${text.trim()}==0==999=0=0=0=
        `;
      }
    }
    // 옵션 가져오기 끝

    // 상세 HTML TAG 가져오기
    await driver.executeScript(
      "window.scrollBy({top: 1500,behavior: 'smooth'})"
    );

    sleep();

    const moreBtn = await driver.wait(
      until.elementLocated(By.css("._1gG8JHE9Zc")),
      3000
    );

    moreBtn.click();
    sleep();

    const untilTarget = await driver.wait(
      until.elementLocated(By.css(".product_info_notice")),
      3000
    );

    await driver.executeScript(
      "arguments[0].scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});",
      untilTarget
    );

    sleep();

    await driver.executeScript(
      "arguments[0].scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});",
      untilTarget
    );

    sleep();

    await driver.executeScript(
      "arguments[0].scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});",
      untilTarget
    );

    sleep();

    let tempOptionText = [];
    let optionImgSrc = [];
    let optionText = [];
    let detailSrc = [];
    let awsOptionSrc = [];
    let awsDetailSrc = [];
    let optionInnerHtml = "";
    let detailInnerHtml = "";
    let bottomInnerHtml = "";

    try {
      const optionImages = await driver.wait(
        until.elementsLocated(By.css("._3osy73V_eD tbody tr img")),
        3000
      );

      const optionTexts = await driver.wait(
        until.elementsLocated(By.css("._3osy73V_eD tbody tr td")),
        3000
      );

      for await ([i, img] of optionImages.entries()) {
        optionImgSrc.push(await img.getAttribute("src"));
      }

      for await ([i, text] of optionTexts.entries()) {
        tempOptionText.push(await text.getText());
      }

      optionText = tempOptionText.filter((el) => el !== "");

      await getDetailImgSrc();
    } catch (error) {
      await getDetailImgSrc();
      console.error;
    }

    for (let i = 0; i < detailSrc.length; i++) {
      optionImgSrc.map((option) => {
        if (detailSrc[i] == option) {
          detailSrc.splice(i, 1);
        }
      });
    }

    await processImagesAndDeploy(optionImgSrc, detailSrc);

    // 이미지를 다운로드하고 워터마크를 적용하여 S3에 업로드하는 함수
    async function processImage(imgUrl) {
      try {
        const response = await axios.get(imgUrl, {
          responseType: "arraybuffer",
        });
        const imageBuffer = Buffer.from(response.data);

        // 이미지를 Jimp 객체로 로드
        const image = await Jimp.read(imageBuffer);

        // 워터마크를 적용 (예시: 이미지 오른쪽 아래에 워터마크 삽입)
        const watermark = await Jimp.read(
          "https://d2cbw0xqrrkdri.cloudfront.net/1truss/common/watermark.png"
        );

        const watermarkWdith = 200;
        const scaleFactor = watermarkWdith / watermark.getWidth();
        watermark.scale(scaleFactor);

        image.composite(
          watermark,
          (image.bitmap.width - watermark.bitmap.width) / 2,
          (image.bitmap.height - watermark.bitmap.height) / 2,
          {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 0.5, // 워터마크의 투명도 설정 (0~1 사이의 값)
          }
        );

        // 이미지를 버킷에 업로드
        const uploadParams = {
          Bucket: "idwhat-cdn",
          Key: `1truss/${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`, // 고유한 키 생성
          Body: await image.getBufferAsync(Jimp.MIME_JPEG),
          ContentType: "image/jpeg",
        };

        const uploadResult = await s3.upload(uploadParams).promise();

        return uploadResult.Location;
      } catch (error) {
        console.error("Error processing image:", error);
        throw error;
      }
    }

    // 모든 이미지를 처리하고 CloudFront에 배포하는 함수
    async function processImagesAndDeploy(imgUrlArray, imgUrlArray2) {
      let processedUrls = [];
      if (
        imgUrlArray !== "" ||
        imgUrlArray !== null ||
        imgUrlArray !== undefined
      ) {
        processedUrls = await Promise.all(
          imgUrlArray.map((imgUrl) => processImage(imgUrl))
        );
      }

      const processedUrls2 = await Promise.all(
        imgUrlArray2.map((imgUrl) => processImage(imgUrl))
      );

      awsOptionSrc.push(...processedUrls);
      awsDetailSrc.push(...processedUrls2);
    }

    async function getDetailImgSrc() {
      const detailImages = await driver.wait(
        until.elementsLocated(By.css(`._3osy73V_eD img`)),
        3000
      );

      for await ([i, detail] of detailImages.entries()) {
        let $this = await driver.wait(detail.getAttribute("src"), 3000);

        if (i > 1) {
          detailSrc.push($this);
        }
      }

      detailSrc.pop();
    }

    // AWS 클라우드프론트 주소
    const cloudFrontBaseUrl = "https://d2cbw0xqrrkdri.cloudfront.net";

    const cloudFrontAwsOptionSrc = awsOptionSrc.map((s3Url) => {
      const fileName = s3Url.split("/").pop();
      return `${cloudFrontBaseUrl}/${userId}/${fileName}`;
    });

    const cloudFrontAwsDetailSrc = awsDetailSrc.map((s3Url) => {
      const fileName = s3Url.split("/").pop();
      return `${cloudFrontBaseUrl}/${userId}/${fileName}`;
    });

    // html만들기
    for await ([i, op] of cloudFrontAwsOptionSrc.entries()) {
      try {
        optionInnerHtml += `<div style=" display: inline-table; width: 50%; border: 1px solid #aaa; margin: 30px 0 0 0; box-sizing: border-box;"><img src="${op}" width="390"/><div style=" display: block; border-top: 1px solid #aaa; padding: 15px; font-size: 15pt; box-sizing: border-box;">${optionText[i]}</div></div>`;
      } catch (error) {
        console.error;
      }
    }

    for await (detail of cloudFrontAwsDetailSrc) {
      try {
        detailInnerHtml += `<div><img src="${detail}" /></div>`;
      } catch (error) {
        console.error;
      }
    }

    let detailHtml = `<div style="margin: 0 auto; width: 100%; text-align: center"><img src="https://dfua3zgxja7ca.cloudfront.net/common/option.jpg" /><div style="display: block; align-items: center; width: 100%; font-size: 0">${optionInnerHtml}</div><div style="text-align: center; margin-top: 30px">${detailInnerHtml}</div><div style="text-align: center; margin-top: 30px">${bottomInnerHtml}</div></div>`;

    console.log(`detailHtml = ${detailHtml}`);
    // crawlData에 데이터 넣기
    crawlData.b = modelName;
    crawlData.c = brandName;
    crawlData.d = brandName;
    crawlData.f = modelName;
    crawlData.h = modelName;
    crawlData.j = categoryCode;
    crawlData.p = splitedPrice - 500;
    crawlData.u = thumbArr[0];
    thumbArr[1] !== undefined
      ? (crawlData.v = thumbArr[1])
      : (crawlData.v = "");
    thumbArr[2] !== undefined
      ? (crawlData.w = thumbArr[2])
      : (crawlData.w = "");
    thumbArr[3] !== undefined
      ? (crawlData.x = thumbArr[3])
      : (crawlData.x = "");
    thumbArr[4] !== undefined
      ? (crawlData.z = thumbArr[4])
      : (crawlData.z = "");
    thumbArr[5] !== undefined
      ? (crawlData.aa = thumbArr[5])
      : (crawlData.aa = "");
    thumbArr[6] !== undefined
      ? (crawlData.ab = thumbArr[6])
      : (crawlData.ab = "");
    thumbArr[7] !== undefined
      ? (crawlData.ac = thumbArr[7])
      : (crawlData.ac = "");
    thumbArr[8] !== undefined
      ? (crawlData.ad = thumbArr[8])
      : (crawlData.ad = "");
    thumbArr[9] !== undefined
      ? (crawlData.ae = thumbArr[9])
      : (crawlData.ae = "");
    crawlData.ag = `${optionType}`;
    crawlData.aj = `${detailHtml}`;
    console.log(crawlData);
  } catch (error) {
    console.error("에러:", error);
    throw new Error("이미지 가져오기에 실패했습니다.");
  }
}

// 상품명 랜덤 재배치 펑션
function shuffleString(targetText) {
  const text = targetText.split(" ");
  return [...text].sort(() => Math.random() - 0.5).join(" ");
}

// 슬립 펑션
function sleep() {
  const randomSec = Math.random() * (2 - 1 + 1) + 1;
  let start = Date.now(),
    now = start;
  while (now - start < randomSec * 1000) {
    now = Date.now();
  }
}

// uploads 폴더 초기화
function resetUploadsFolder() {}

module.exports = { generate };
