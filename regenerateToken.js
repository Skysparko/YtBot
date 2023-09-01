import credentials from "./credentials.json" assert { type: "json" };
import { OAuth2Client } from "google-auth-library";
import fs from "fs";
import { google } from "googleapis";
import readline from "readline";

export default async function authenticateAndUploadVideo(videos, videoLink) {
  // Load credentials from the downloaded JSON file
  const oauth2Client = new OAuth2Client(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris[0]
  );
  // Generate the authentication URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/youtube.upload"],
  });

  // Print the authentication URL and ask the user to visit it
  console.log("Please visit the following URL to authorize the application:");
  console.log(authUrl);

  // Create a readline interface to capture user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Prompt the user to enter the authorization code
  rl.question(
    "Enter the authorization code from the redirect URL: ",
    async (code) => {
      // Close the readline interface
      rl.close();

      try {
        // Exchange the authorization code for tokens

        const { tokens } = await oauth2Client.getToken(code);
        console.log(tokens);
        console.log(code);
        oauth2Client.setCredentials(tokens);

        // Create a YouTube Data API client
        const youtube = google.youtube({
          version: "v3",
          auth: oauth2Client,
        });

        // Set the video metadata
        const videoMetadata = {
          snippet: {
            title: videos[0].snippet.title,
            description: "",
            tags: [""],
            channelId: "",
            categoryId: "22",
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
  );
}

// Call the authenticateAndUploadVideo function
authenticateAndUploadVideo();
