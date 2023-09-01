import { google } from "googleapis";
import cron from "node-cron";
import getRandomYouTubeShortsLinks from "./ytLinks.js";
import downloadVideo from "./downloadVideo.js";
import authenticateAndUploadVideo from "./uploadVideo.js";
import { unlinkSync } from "fs";

let { videoLinks, videos } = await getRandomYouTubeShortsLinks();

// get videos
cron.schedule("0 11 * * *", () => {
  getRandomYouTubeShortsLinks().then((data) => {
    videoLinks = data.videoLinks;
    videos = data.videos;
  });
});

cron.schedule("6 11 * * *", async () => {
  for (let i = 0; i < videoLinks.length; i++) {
    await downloadVideo(videoLinks[i], i);
  }
});

// Schedule the task to run at 12 pm everyday
cron.schedule("7 11 * * *", () => {
  authenticateAndUploadVideo(
    videos.filter((video) => video.id.videoId === videoLinks[0].split("v=")[1]),
    "0.mp4"
  );
});

// Schedule the task to run at 3 pm every day
cron.schedule("0 15 * * *", () => {
  authenticateAndUploadVideo(
    videos.filter((video) => video.id.videoId === videoLinks[1].split("v=")[1]),
    "1.mp4"
  );
});

// Schedule the task to run at 6 pm every day
cron.schedule("0 18 * * *", () => {
  authenticateAndUploadVideo(
    vieos.filter((video) => video.id.videoId === videoLinks[2].split("v=")[1]),
    "2.mp4"
  );
});

// delete all the videos
cron.schedule("0 23 * * *", () => {
  try {
    for (let i = 0; i < videoLinks.length; i++) {
      unlinkSync(`${i}.mp4`);
    }
  } catch {
    console.log("Unable to delete videos");
  }
});
