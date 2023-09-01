import fs from "fs";

export default function storeDataToJson(filePath, data) {
  try {
    let existingData = {};

    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      // If the file exists, load the existing data from it
      existingData = JSON.parse(fs.readFileSync(filePath));
    }

    // Add the new data to the existing data
    data.forEach((str, index) => {
      existingData[index + 1] = str;
    });

    // Write the updated data back to the JSON file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    console.log("Data stored successfully.");
  } catch (err) {
    console.error("Error while storing data:", err);
  }
}
