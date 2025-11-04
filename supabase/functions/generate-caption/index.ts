import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { imageData } = await req.json();

    if (!imageData) {
      return new Response(
        JSON.stringify({ error: "Image or video data is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const isVideo = imageData.startsWith('blob:');

    // For videos, we need to let the client know we'll analyze it differently
    // Since we can't directly process blob URLs on the server,
    // we'll return a video-specific caption if it's a video
    if (isVideo) {
      const videoMockCaptions = [
        {
          text: "Watch till the end! 🎥 This moment was too good not to share with you all.",
          hashtags: ["#VideoContent", "#WatchThis", "#ContentCreator"],
          tone: "Engaging"
        },
        {
          text: "Behind the scenes magic in motion ✨ What's your favorite part?",
          hashtags: ["#BTS", "#VideoProduction", "#CreativeProcess"],
          tone: "Interactive"
        },
        {
          text: "Creating content that matters 🎬 Drop a comment with your thoughts!",
          hashtags: ["#VideoMarketing", "#ContentStrategy", "#DigitalContent"],
          tone: "Professional"
        },
        {
          text: "This is exactly what you need to see today! 🔥 Hit that like button if you agree!",
          hashtags: ["#MustWatch", "#TrendingNow", "#ViralVideo"],
          tone: "Enthusiastic"
        }
      ];

      const randomCaption = videoMockCaptions[Math.floor(Math.random() * videoMockCaptions.length)];

      return new Response(
        JSON.stringify(randomCaption),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Use Claude AI to analyze the image and generate a caption
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicApiKey) {
      // Fallback to mock caption if no API key
      const mockCaptions = [
        {
          text: "Capturing moments that matter ✨ Every picture tells a story, and this one speaks volumes.",
          hashtags: ["#Photography", "#MomentsCaptured", "#InstaGood"],
          tone: "Inspirational"
        },
        {
          text: "Just another day creating magic! 🎨 What do you think of this one?",
          hashtags: ["#CreativeLife", "#BehindTheScenes", "#DailyInspiration"],
          tone: "Casual & Engaging"
        },
        {
          text: "Professional quality meets creative vision. Proud to share this masterpiece with you all! 🌟",
          hashtags: ["#ProfessionalWork", "#CreativeProcess", "#Excellence"],
          tone: "Professional"
        },
        {
          text: "Obsessed with how this turned out! 😍 Drop a ❤️ if you love it too!",
          hashtags: ["#Obsessed", "#LoveThis", "#ShareTheLove"],
          tone: "Enthusiastic"
        }
      ];

      const randomCaption = mockCaptions[Math.floor(Math.random() * mockCaptions.length)];

      return new Response(
        JSON.stringify(randomCaption),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Call Claude API for image analysis
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: imageData.split(';')[0].split(':')[1],
                  data: imageData.split(',')[1],
                },
              },
              {
                type: "text",
                text: `Analyze this image and create an engaging social media caption.

                Return your response in this exact JSON format:
                {
                  "text": "The main caption text with emojis",
                  "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3"],
                  "tone": "The tone of the caption (e.g., Inspirational, Casual, Professional, Enthusiastic)"
                }

                Make the caption engaging, relevant to the image, and optimized for social media. Include 2-3 relevant hashtags.`
              }
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const captionText = data.content[0].text;

    // Parse the JSON response from Claude
    const caption = JSON.parse(captionText);

    return new Response(
      JSON.stringify(caption),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error generating caption:", error);

    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate caption" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});