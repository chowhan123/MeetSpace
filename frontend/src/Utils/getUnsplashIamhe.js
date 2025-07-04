import axios from "axios";

const UNSPLASH_KEY = process.env.REACT_APP_UNSPLASH_KEY;

export const getRandomImageUrl = async (query = "technology, office") => {
  try {
    const response = await axios.get("https://api.unsplash.com/photos/random", {
      params: {
        query,
        orientation: "landscape",
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_KEY}`,
      },
    });

    return response.data.urls.full;
  } catch (err) {
    console.error("Failed to fetch Unsplash image:", err.message);
    return null;
  }
};
