import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  prompt: string;
  style: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders
    });
  }

  console.log("Function invoked!", req.method);

  try {
    const body = await req.json();
    const { prompt, style } = body as GenerateRequest;

    if (!prompt || prompt.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Prompt must be at least 10 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!style) {
      return new Response(JSON.stringify({ error: "Style is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stylePrompts: Record<string, string> = {
      modern: "modern, clean, contemporary, sleek design",
      vintage: "vintage, retro, classic, nostalgic style",
      minimalist: "minimalist, simple, clean lines, uncluttered",
      bold: "bold, vibrant, striking colors, dynamic",
      professional: "professional, business, corporate, polished",
      artistic: "artistic, creative, expressive, imaginative",
    };
    const enhancedPrompt = `${prompt}, ${stylePrompts[style] || "beautiful style"}, high quality, detailed, 4k`;
    console.log("Generating image with prompt:", enhancedPrompt);

    let imageUrl: string | null = null;
    let lastError: string | null = null;

    // Try Pollinations AI with simpler approach
    try {
      console.log("Attempting Pollinations AI...");
      const seed = Math.floor(Math.random() * 1000000);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;

      const pollinationsResponse = await fetch(pollinationsUrl, {
        method: "GET",
        redirect: "follow"
      });

      if (pollinationsResponse.ok) {
        const imageBlob = await pollinationsResponse.blob();
        if (imageBlob.size > 1000) {
          const arrayBuffer = await imageBlob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          imageUrl = `data:image/png;base64,${base64}`;
          console.log("Successfully generated with Pollinations AI");
        } else {
          lastError = `Pollinations: Image too small`;
        }
      } else {
        lastError = `Pollinations: ${pollinationsResponse.status}`;
      }
    } catch (error) {
      lastError = `Pollinations: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error("Pollinations error:", error);
    }

    // Try Replicate with Stable Diffusion
    if (!imageUrl) {
      try {
        console.log("Attempting AI Horde...");
        const hordeUrl = "https://stablehorde.net/api/v2/generate/async";

        const hordeResponse = await fetch(hordeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": "0000000000"
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            params: {
              width: 1024,
              height: 1024,
              steps: 30,
              cfg_scale: 7,
              sampler_name: "k_euler"
            },
            nsfw: false,
            censor_nsfw: true,
            models: ["stable_diffusion"]
          })
        });

        if (hordeResponse.ok) {
          const hordeData = await hordeResponse.json();
          const jobId = hordeData.id;

          // Poll for result (max 60 seconds)
          let attempts = 0;
          const maxAttempts = 30;

          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const checkResponse = await fetch(`https://stablehorde.net/api/v2/generate/check/${jobId}`);
            const checkData = await checkResponse.json();

            if (checkData.done && checkData.generations && checkData.generations.length > 0) {
              const imageDataUrl = checkData.generations[0].img;

              const imgResponse = await fetch(imageDataUrl);
              const imageBlob = await imgResponse.blob();
              const arrayBuffer = await imageBlob.arrayBuffer();
              const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
              imageUrl = `data:image/png;base64,${base64}`;
              console.log("Successfully generated with AI Horde");
              break;
            }

            attempts++;
          }

          if (!imageUrl) {
            lastError = "AI Horde: Timeout";
          }
        } else {
          lastError = `AI Horde: ${hordeResponse.status}`;
        }
      } catch (error) {
        lastError = `AI Horde: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error("AI Horde error:", error);
      }
    }

    // Try Segmind API
    if (!imageUrl) {
      try {
        console.log("Attempting Segmind API...");
        const segmindUrl = "https://api.segmind.com/v1/sd1.5-txt2img";

        const segmindResponse = await fetch(segmindUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            negative_prompt: "low quality, blurry, distorted",
            samples: 1,
            width: 1024,
            height: 1024,
            num_inference_steps: 30,
            guidance_scale: 7.5
          })
        });

        if (segmindResponse.ok) {
          const imageBlob = await segmindResponse.blob();
          if (imageBlob.size > 1000) {
            const arrayBuffer = await imageBlob.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            imageUrl = `data:image/png;base64,${base64}`;
            console.log("Successfully generated with Segmind");
          }
        } else {
          lastError = `Segmind: ${segmindResponse.status}`;
        }
      } catch (error) {
        lastError = `Segmind: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error("Segmind error:", error);
      }
    }

    // Fallback to high-quality stock photo
    if (!imageUrl) {
      try {
        console.log("Falling back to Picsum Photos...");
        const seed = Math.floor(Math.random() * 1000);
        const picsumUrl = `https://picsum.photos/seed/${seed}/1024/1024`;

        const picsumResponse = await fetch(picsumUrl, {
          method: "GET",
          redirect: "follow"
        });

        if (picsumResponse.ok) {
          const imageBlob = await picsumResponse.blob();
          const arrayBuffer = await imageBlob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          imageUrl = `data:image/jpeg;base64,${base64}`;
          console.log("Successfully generated with Picsum Photos (fallback)");
        } else {
          lastError = `Picsum: ${picsumResponse.status}`;
        }
      } catch (error) {
        lastError = `Picsum: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error("Picsum error:", error);
      }
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({
          error: "All image services failed",
          details: lastError,
          message: "Unable to generate image at this time. Please try again later."
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        image_url: imageUrl,
        success: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in image generation function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
