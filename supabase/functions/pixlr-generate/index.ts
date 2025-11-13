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

    try {
      console.log("Attempting Hugging Face API...");
      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: enhancedPrompt }),
        }
      );

      if (hfResponse.ok) {
        const imageBlob = await hfResponse.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        imageUrl = `data:image/jpeg;base64,${base64}`;
        console.log("Successfully generated with Hugging Face");
      } else {
        lastError = `Hugging Face: ${hfResponse.status}`;
        console.log("Hugging Face failed, trying fallback...");
      }
    } catch (error) {
      lastError = `Hugging Face: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error("Hugging Face error:", error);
    }

    if (!imageUrl) {
      try {
        console.log("Attempting Pollinations AI...");
        const seed = Math.floor(Math.random() * 1000000);
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

        const pollinationsResponse = await fetch(pollinationsUrl, {
          method: "GET",
          headers: { "Accept": "image/*" },
          redirect: "follow"
        });

        if (pollinationsResponse.ok) {
          const imageBlob = await pollinationsResponse.blob();
          const arrayBuffer = await imageBlob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          imageUrl = `data:image/png;base64,${base64}`;
          console.log("Successfully generated with Pollinations AI");
        } else {
          lastError = `Pollinations: ${pollinationsResponse.status}`;
        }
      } catch (error) {
        lastError = `Pollinations: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error("Pollinations error:", error);
      }
    }

    // Try DuckDuckGo proxy as another fallback
    if (!imageUrl) {
      try {
        console.log("Attempting DuckDuckGo Image Generation...");
        const seed = Math.floor(Math.random() * 1000000);
        const ddgUrl = `https://duckduckgo.com/i/${encodeURIComponent(enhancedPrompt)}.jpg?seed=${seed}`;

        const ddgResponse = await fetch(ddgUrl, {
          method: "GET",
          headers: { "Accept": "image/*" },
          redirect: "follow"
        });

        if (ddgResponse.ok) {
          const imageBlob = await ddgResponse.blob();
          const arrayBuffer = await imageBlob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          imageUrl = `data:image/jpeg;base64,${base64}`;
          console.log("Successfully generated with DuckDuckGo");
        } else {
          lastError = `DuckDuckGo: ${ddgResponse.status}`;
        }
      } catch (error) {
        lastError = `DuckDuckGo: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error("DuckDuckGo error:", error);
      }
    }

    // Try Replicate as final fallback
    if (!imageUrl) {
      try {
        console.log("Attempting ImgFlip Meme Generator fallback...");
        const seed = Math.floor(Math.random() * 1000000);
        const imgflipUrl = `https://api.imgflip.com/ai_meme?text=${encodeURIComponent(enhancedPrompt)}&seed=${seed}`;

        const imgflipResponse = await fetch(imgflipUrl, {
          method: "GET",
          headers: { "Accept": "application/json" }
        });

        if (imgflipResponse.ok) {
          const data = await imgflipResponse.json();
          if (data.success && data.data?.url) {
            const imageResponse = await fetch(data.data.url);
            const imageBlob = await imageResponse.blob();
            const arrayBuffer = await imageBlob.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            imageUrl = `data:image/jpeg;base64,${base64}`;
            console.log("Successfully generated with ImgFlip");
          }
        } else {
          lastError = `ImgFlip: ${imgflipResponse.status}`;
        }
      } catch (error) {
        lastError = `ImgFlip: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error("ImgFlip error:", error);
      }
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({
          error: "All AI services failed",
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
