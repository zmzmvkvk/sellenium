require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Jimp = require("jimp");
const axios = require("axios");
const { createWorker } = require("tesseract.js");

const getImageURL = require("./routes/crawler");

// JSON 파싱 미들웨어 등록
app.use(bodyParser.json());

app.get("/api/getImage", async (req, res) => {
  try {
    // 이미지 URL 가져오기
    const imageURL = await getImageURL();

    // 이미지 URL을 클라이언트에 응답으로 보내기
    res.send(imageURL);
  } catch (error) {
    console.error("에러:", error);
    res.status(500).json({ error: "이미지 가져오기에 실패했습니다." });
  }
});

// 이미지 OCR 및 번역
app.post("/api/processImage", async (req, res) => {
  try {
    // 이미지 데이터 받아오기
    const imageData = req.body.imageData;

    // OCR 워커 생성 및 초기화
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage("chi_sim");
    await worker.initialize("chi_sim");

    // 이미지에서 텍스트 추출
    const {
      data: { text },
    } = await worker.recognize(imageData);

    // Naver Papago API 호출하여 번역
    const response = await axios.post(
      "https://openapi.naver.com/v1/papago/n2mt",
      {
        source: "zh-CN",
        target: "ko",
        text: text,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Naver-Client-Id": "VoXDKXzudUkyPZEDg0uF",
          "X-Naver-Client-Secret": "0P3fl_JiWB",
        },
      }
    );

    // 번역된 텍스트
    const translatedText = response.data.message.result.translatedText;

    // 오버레이된 이미지 생성
    const image = await Jimp.read(imageData);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    image.print(font, 10, 10, translatedText);

    // 오버레이된 이미지를 base64로 변환하여 클라이언트에게 응답으로 보내기
    const overlayedImage = await image.getBase64Async(Jimp.AUTO);
    res.json({ overlayedImage });

    // OCR 워커 종료
    await worker.terminate();
  } catch (error) {
    console.error("이미지 처리 오류:", error);
    res.status(500).json({ error: "이미지 처리에 실패했습니다." });
  }
});

// 이미지 다운로드
app.get("/api/downloadImage", async (req, res) => {
  try {
    // 클라이언트에게 전송할 이미지 데이터 받아오기
    const imageData = req.body.imageData; // 이미지 데이터는 클라이언트에서 요청 본문으로 전송하거나 다른 방법으로 제공되어야 합니다.

    // 이미지 데이터를 클라이언트에게 응답으로 보내기
    res.setHeader("Content-Type", "image/jpeg"); // 이미지 타입에 따라 Content-Type을 설정합니다.
    res.send(imageData);
  } catch (error) {
    console.error("이미지 다운로드 오류:", error);
    res.status(500).json({ error: "이미지 다운로드에 실패했습니다." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
