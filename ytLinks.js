import { google } from "googleapis";
import fs from "fs";
import storeDataToJson from "./storeData.js";
// Function to check if an employee with the given ID exists in the JSON data
function LinksExists(dataArray, id) {
  return dataArray.some((data) => data === id);
}

export default async function getRandomYouTubeShortsLinks() {
  const youtube = google.youtube("v3");

  // Keep fetching video links until we have 5 unique links

  const response = await youtube.search.list({
    part: "snippet",
    maxResults: 100,
    type: "video",
    videoLicense: "creativeCommon", // non copyright
    videoCategoryId: "17", // Short Films category
    chart: "mostPopular",
    videoDuration: "short",
    // key: "you can get this from google console",
  });
  const videos = response.data.items;

  let videoLinks = videos.map(
    (video) => `https://www.youtube.com/watch?v=${video.id.videoId}`
  );

  if (fs.existsSync("data.json")) {
    // Filter videos which are not uploaded before
    const arrayOfLinksExisted = Object.values(
      JSON.parse(fs.readFileSync("data.json"))
    );

    videoLinks = videoLinks.filter(
      (element) => !LinksExists(arrayOfLinksExisted, element)
    );

    storeDataToJson("data.json", [
      ...arrayOfLinksExisted,
      ...videoLinks.slice(0, 3),
    ]);
    console.log(videoLinks.slice(0, 3));

    // Return the first 5 unique and shuffled video links

    return { videoLinks: videoLinks.slice(0, 3), videos };
  }

  storeDataToJson("data.json", videoLinks.slice(0, 3));
  console.log(videoLinks.slice(0, 3));
  console.log(videos[0]);
  // Return the first 5 unique and shuffled video links
  return { videoLinks: videoLinks.slice(0, 3), videos };
}
