import express from "express";
import needle from "needle";
import apicache from "apicache";
import cors from "cors";
import rateLimit from "express-rate-limit";
require("dotenv").config();
const PORT = process.env.PORT || 5000;
import url from "url";
const app = express();

//Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
});

app.use(limiter);
app.set("trust proxy", 1);
app.use(cors());

//ENV Variables
const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY_NAME: any = process.env.API_KEY_NAME;
const API_KEY_VALUE = process.env.API_KEY_VALUE;

//INIT CACHE
let cache = apicache.middleware;

app.get("/api", cache("2 minute"), async (req, res) => {
  try {
    // console.log(url.parse(req.url, true).query);
    const params = new URLSearchParams({
      [API_KEY_NAME]: API_KEY_VALUE,
      ...url.parse(req.url, true).query,
    });

    const apiResponse = await needle("get", `${API_BASE_URL}?${params}`);
    const data = apiResponse.body;

    if (process.env.NODE_ENV !== "production") {
      console.log(`REQUEST: ${API_BASE_URL}?${params}`);
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
