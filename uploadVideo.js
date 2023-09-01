import credentials from "./credentials.json" assert { type: "json" };
import { OAuth2Client } from "google-auth-library";
import fs from "fs";
import { google } from "googleapis";
import readline from "readline";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

export default async function authenticateAndUploadVideo(videos, videoLink) {
  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = dirname(__filename);
  // const credentialsPath = path.join(__dirname, "./credentials.json");
  // const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));

  // Load credentials from the downloaded JSON file
  const oauth2Client = new OAuth2Client(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris[0]
  );

  try {
    oauth2Client.setCredentials(JSON.parse(fs.readFileSync("tokens.json")));

    // Create a YouTube Data API client
    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    // Set the video metadata
    const videoMetadata = {
      snippet: {
        title: videos[0].snippet.title,
        description: "add your own description",
        tags: ["add your own tags"],
        channelId: "add your channel id here",
        categoryId: "22", // channel category
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
        audience: "nonFamilySafe",
      },
    };

    // Initialize the video resource
    const videoResource = {
      part: "snippet,status",
      requestBody: videoMetadata,
      media: {
        body: fs.createReadStream(videoLink), // Change the path to your video file
      },
    };

    try {
      // Upload the video
      const response = await youtube.videos.insert(videoResource, {
        onUploadProgress: (event) => {
          console.log(
            `Uploaded ${event.bytesRead} bytes of ${event.totalBytes}`
          );
        },
      });

      console.log("Video uploaded successfully:", response.data);
    } catch (error) {
      console.error("Error uploading video:", error.message);
    }
  } catch (error) {
    console.error(
      "Error exchanging authorization code for tokens:",
      error.message
    );
  }
}
