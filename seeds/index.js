const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Nest = require("../models/AdventureNest");

//Database connection
mongoose.connect("mongodb://localhost:27017/AdventureNest");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once;
"open",
  () => {
    console.log("Database Connected");
  };

// This function will create a random image address for the specific collection Id
const collectionId = "483251";
const accessKey = "fMnSMqxs-SzoRYgExn1w21GpzZPwzLw7gujHMk5SICk";

async function fetchImageLinks(collectionId, accessKey, count = 50) {
  const apiUrl = `https://api.unsplash.com/collections/${collectionId}/photos/?client_id=${accessKey}&per_page=${count}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const imageLinks = data.map((photo) => photo.urls.full);
    return imageLinks;
  } catch (error) {
    console.error("Error fetching image links:", error);
    return []; // Return an empty array on error
  }
}

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Nest.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const imgLinks = await fetchImageLinks(collectionId, accessKey, 50);
    const nest = new Nest({
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: sample(imgLinks),
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Totam non vero voluptatem, rerum optio iure perferendis corporis, beatae dolorem impedit numquam illum cupiditate eligendi modi? Aspernatur est quis asperiores quidem.",
      price,
    });

    await nest.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
