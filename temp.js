let imgResource = {
  option: [],
  detail: [],
};
let optionText = [];
let optionImageSrc = [];
let detailImageSrc = [];

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

  for await (img of optionImages) {
    optionImageSrc.push(await driver.wait(img.getAttribute("src"), 3000));
  }

  for await (text of optionTexts) {
    optionText.push(await driver.wait(text.getText(), 3000));
  }

  let filteredOptionText = optionText.filter((el) => el !== "");

  // imgResource옵션값 넣기
  for (let i = 0; i < optionImageSrc.length; i++) {
    imgResource.option = [
      ...imgResource.option,
      {
        src: optionImageSrc[i],
        text: filteredOptionText[i],
      },
    ];
  }

  const detailImages = await driver.wait(
    until.elementsLocated(By.css(`._3osy73V_eD img`)),
    3000
  );

  //for await에서 index값 얻기
  for await ([idx, img] of detailImages.entries()) {
    let $this = await driver.wait(img.getAttribute("src"), 3000);

    if (idx > 1) {
      detailImageSrc.push($this);
    }
  }

  detailImageSrc.pop();
  imgResource.detail.push(...detailImageSrc);

  for (let i = 0; i < imgResource.detail.length; i++) {
    imgResource.option.map((it, idx) => {
      imgResource.detail.map((el, idx) => {
        if (el.includes(it.src)) {
          imgResource.detail.splice(idx, 1);
        }
      });
    });
  }

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
        "https://idwhat-cdn.s3.ap-northeast-2.amazonaws.com/1truss/common/watermark.png"
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
      // console.log("Uploaded image:", uploadResult.Location);

      return uploadResult.Location;
    } catch (error) {
      console.error("Error processing image:", error);
      throw error;
    }
  }

  // 모든 이미지를 처리하고 CloudFront에 배포하는 함수
  async function processImagesAndDeploy(imgUrlArray, imgType) {
    try {
      const processedUrls = await Promise.all(
        imgUrlArray.map((imgUrl) => processImage(imgUrl))
      );

      // CloudFront 캐시 갱신
      const distributionId = "E3NGHDSZ2VTCD7";
      await cloudfront
        .createInvalidation({
          DistributionId: distributionId,
          InvalidationBatch: {
            CallerReference: `${Date.now()}`,
            Paths: {
              Quantity: processedUrls.length,
              Items: processedUrls.map(
                (url) => `/1truss/${url.split("/").pop()}`
              ), // S3에 업로드된 파일의 경로
            },
          },
        })
        .promise();

      console.log("CloudFront cache invalidated successfully.");

      // 이미지 유형에 따라 처리된 URL을 분류
      if (imgType === "option") {
        awsOptionSrc.push(...processedUrls);
      } else if (imgType === "detail") {
        awsDetailSrc.push(...processedUrls);
      }
    } catch (error) {
      console.error("Error processing images and deploying:", error);
    }
  }

  let awsOptionSrc = [];
  let awsDetailSrc = [];

  // 이미지 처리 및 배포 함수 호출
  await processImagesAndDeploy(optionImageSrc, "option");
  await processImagesAndDeploy(detailImageSrc, "detail");

  // // html만들기
  // for await (op of imgResource.option) {
  //   try {
  //     optionInnerHtml += `<div style=" display: inline-table; width: 50%; border: 1px solid #aaa; margin: 30px 0 0 0; box-sizing: border-box;"><img src="${op.src}" width="390"/><div style=" display: block; border-top: 1px solid #aaa; padding: 15px; font-size: 15pt; box-sizing: border-box;">${op.text}</div></div>`;
  //   } catch (error) {
  //     console.error;
  //   }
  // }

  // for await (detail of imgResource.detail) {
  //   try {
  //     detailInnerHtml += `<div><img src="${detail}" /></div>`;
  //   } catch (error) {
  //     console.error;
  //   }
  // }

  // // console.log(imgResource);
  // let detailHtml = `
  //   <div style="margin: 0 auto; width: 100%; text-align: center">
  //     <img src="https://dfua3zgxja7ca.cloudfront.net/common/option.jpg" />
  //     <div style="display: block; align-items: center; width: 100%; font-size: 0">${optionInnerHtml}</div>
  //     <div style="text-align: center; margin-top: 30px">${detailInnerHtml}</div>
  //     <div style="text-align: center; margin-top: 30px">${bottomInnerHtml}</div>
  //   </div>
  // `;
} catch (error) {
  console.error("option값이 없습니다.", error);
}
// 상세 HTML TAG 끝
