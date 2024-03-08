require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Jimp = require("jimp");
const multer = require("multer");
const csv = require("csv-parser");
const { createWorker } = require("tesseract.js");
const crawler = require("./routes/crawler");
const { Builder, By, Capabilities } = require("selenium-webdriver");

// 파일 업로드를 위한 multer 미들웨어 설정
const upload = multer({ dest: "uploads/" });
app.use(express.static("public"));
// JSON 파싱 미들웨어 등록
app.use(bodyParser.json());

let urlList = [];

app.get("/", async (req, res) => {
  res.sendFile("public/index.html");
});

app.post("/readcsv", upload.single("csvFile"), async (req, res) => {
  // CSV 파일을 읽고 데이터를 배열에 저장
  const filePath = req.file.path;
  const csv = fs.readFileSync(filePath, "utf-8");
  urlList = csv.split(/\n|\r/); //CSV 파일 데이터의 배열

  // 사용자 에이전트 설정
  const chromeCapabilities = Capabilities.chrome();
  chromeCapabilities.set("chromeOptions", {
    args: [
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "--accept-language=ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    ],
  });

  // 웹 드라이버 생성
  let driver = new Builder()
    .forBrowser("chrome")
    .withCapabilities(chromeCapabilities)
    .build();

  await crawler.generate(
    "https://smartstore.naver.com/ttokalmall/products/9657042387",
    driver
  );

  // URL을 비동기적으로 처리
  // for await (const url of urlList) {
  //   await crawler.generate(url, driver);
  // }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
