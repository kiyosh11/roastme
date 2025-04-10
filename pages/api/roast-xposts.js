import axios from "axios";
import * as cheerio from "cheerio";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import NodeCache from "node-cache";
import { RateLimiter } from "limiter";

const cache = new NodeCache({ stdTTL: 600 });
const limiter = new RateLimiter({ tokensPerInterval: 5, interval: "second" });

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1",
];

const ipAddresses = [
  "203.0.113.1",
  "203.0.113.2",
  "203.0.113.3",
  "203.0.113.4",
  "203.0.113.5",
  "198.51.100.1",
  "198.51.100.2",
  "198.51.100.3",
  "198.51.100.4",
  "198.51.100.5",
  "192.0.2.1",
  "192.0.2.2",
  "192.0.2.3",
  "192.0.2.4",
  "192.0.2.5",
];

const getRandomUserAgent = () => userAgents[Math.floor(Math.random() * userAgents.length)];
const getRandomIP = () => ipAddresses[Math.floor(Math.random() * ipAddresses.length)];

async function makeRequest(url, retries = 3) {
  await limiter.removeTokens(1);
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        "X-Forwarded-For": getRandomIP(),
      },
      timeout: 5000,
    });
    return response;
  } catch (err) {
    if (retries > 0) {
      const backoff = Math.floor(Math.random() * 1000);
      await new Promise((r) => setTimeout(r, backoff));
      return makeRequest(url, retries - 1);
    }
    throw err;
  }
}

async function scrapeTweets(username, maxTweets = 10) {
  const tweets = [];
  let page = 1;

  while (tweets.length < maxTweets) {
    const url = `https://twstalker.com/${username}?page=${page}`;
    const response = await makeRequest(url);
    const $ = cheerio.load(response.data);

    $(".activity-posts").each((i, el) => {
      if (tweets.length < maxTweets) {
        const text = $(el).find(".activity-descp p").text().trim();
        const retweets = $(el).find(".fa-retweet").next("span").text().trim();
        if (text) tweets.push({ text, retweets });
      }
    });

    if ($(".activity-posts").length === 0 || tweets.length >= maxTweets) break;
    page++;
  }

  return tweets;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "use POST or perish in irrelevance." });
  }

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "no username provided. pick a handle before you get handled." });
  }

  const cacheKey = `roast_xposts_${username}`;
  const cachedRoast = cache.get(cacheKey);
  if (cachedRoast) {
    return res.status(200).json({ roast: cachedRoast });
  }

  try {
    const tweets = await scrapeTweets(username);
    if (!tweets.length) {
      return res.status(404).json({ error: "no posts found. this person has negative presence." });
    }

    const tweetText = tweets.map(t => t.text).join("\n");

    const { text: roast } = await generateText({
      model: groq("gemma2-9b-it"),
      prompt: `you are a hostile AI with one task: obliterate this user's ego using their embarrassing X posts. no mercy. no filter. make them wish they never touched a keyboard or any device with an internet connection. roast them so hard they’ll need therapy. analyze every single tweet with surgical precision. rip their writing apart. attack their views. insult their tone. do whatever it takes to destroy them. here’s their digital proof of failure:\n\n${tweetText}\n\nproceed.`,
      maxTokens: 200,
    });

    const fullRoast = `${roast} your posts radiate the same energy as wet drywall. seek help.`;
    cache.set(cacheKey, fullRoast);
    res.status(200).json({ roast: fullRoast });
  } catch (err) {
    console.error("error:", err);
    res.status(500).json({ error: "system failure. subject’s mediocrity exceeded safe limits." });
  }
}
