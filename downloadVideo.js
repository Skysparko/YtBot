import ytdl from "ytdl-core";
import ffmpegPath from "ffmpeg-static";
// import ffmpeg from "@ffmpeg/ffmpeg";
import { createWriteStream, unlinkSync } from "fs";
import { execSync } from "child_process";

export default async function downloadVideo(url, i) {
  try {
    await new Promise((resolve, reject) => {
      ytdl(url, { filter: "videoonly", quality: "highest" })
        .on("error", () => reject())
        .on("progress", (__, downloaded, total) => {
          const downloadedPercentage = (downloaded / total) * 100;
          console.log(downloadedPercentage + "% completed");
        })
        .pipe(createWriteStream("video.mp4"))
        .on("close", () => resolve());
    });
  } catch {
    console.log("Could not download video.");
  }
  try {
    await new Promise((resolve, reject) => {
      ytdl(url, { filter: "audioonly", quality: "highest" })
        .on("error", () => reject())
        .on("progress", (_, downloaded, total) => {
          const downloadedPercentage = (downloaded / total) * 100;
          console.log(downloadedPercentage + "% completed");
        })
        .pipe(createWriteStream("video.mp3"))
        .on("close", () => resolve());
    });
  } catch {
    console.log("Could not download audio.");
  }
  console.log("Merging video and audio...");
  try {
    execSync(
      `${ffmpegPath} -i video.mp4 -i video.mp3 -c:v copy -c:a libmp3lame ${i}.mp4`
    );
  } catch {
    console.log("Unable to merge video and audio.");
  }
  console.log(
    "Merged video and audio as final.mp4. Removing video.mp4 and video.mp3."
  );
  try {
    unlinkSync("video.mp4");
  } catch {
    console.log("Unable to delete video.mp4.");
  }
  try {
    unlinkSync("video.mp3");
  } catch {
    console.log("Unable to delete video.mp3.");
  }
}
