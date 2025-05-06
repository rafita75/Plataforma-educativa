const axios = require('axios');

exports.searchYouTubeVideo = async (query) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(query)}+educación&key=${process.env.YOUTUBE_API_KEY}&part=snippet&type=video&maxResults=1`
    );
    return response.data.items[0]?.id?.videoId || null;
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return null;
  }
};