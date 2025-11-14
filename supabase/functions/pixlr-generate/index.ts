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
      console.log("Attempting Pollinations AI...");
      const seed = Math.floor(Math.random() * 1000000);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;

      const pollinationsResponse = await fetch(pollinationsUrl, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(45000)
      });

      console.log("Pollinations response status:", pollinationsResponse.status);

      if (pollinationsResponse.ok) {
        const contentType = pollinationsResponse.headers.get("content-type");
        console.log("Pollinations content-type:", contentType);

        if (contentType && contentType.includes("image")) {
          const imageBlob = await pollinationsResponse.blob();
          console.log("Pollinations image size:", imageBlob.size);

          if (imageBlob.size > 1000) {
            const arrayBuffer = await imageBlob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            let base64 = '';
            const chunkSize = 8192;
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.slice(i, i + chunkSize);
              base64 += String.fromCharCode.apply(null, Array.from(chunk));
            }

            imageUrl = `data:image/png;base64,${btoa(base64)}`;
            console.log("Successfully generated with Pollinations AI");
          } else {
            lastError = `Pollinations: Image too small (${imageBlob.size} bytes)`;
            console.error(lastError);
          }
        } else {
          lastError = `Pollinations: Invalid content-type: ${contentType}`;
          console.error(lastError);
        }
      } else {
        const errorText = await pollinationsResponse.text();
        lastError = `Pollinations: ${pollinationsResponse.status} - ${errorText.substring(0, 100)}`;
        console.error(lastError);
      }
    } catch (error) {
      lastError = `Pollinations: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error("Pollinations error:", error);
    }

    if (!imageUrl) {
      try {
        console.log("Attempting Together AI...");
        const togetherUrl = "https://api.together.xyz/v1/images/generations";

        const togetherResponse = await fetch(togetherUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            prompt: enhancedPrompt,
            steps: 20,
            n: 1
          }),
          signal: AbortSignal.timeout(45000)
        });

        console.log("Together AI response status:", togetherResponse.status);

        if (togetherResponse.ok) {
          const data = await togetherResponse.json();
          console.log("Together AI response:", JSON.stringify(data).substring(0, 200));

          if (data.data && data.data[0] && data.data[0].url) {
            const imgUrl = data.data[0].url;
            const imgResponse = await fetch(imgUrl);

            if (imgResponse.ok) {
              const imageBlob = await imgResponse.blob();
              const arrayBuffer = await imageBlob.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);

              let base64 = '';
              const chunkSize = 8192;
              for (let i = 0; i < uint8Array.length; i += chunkSize) {
                const chunk = uint8Array.slice(i, i + chunkSize);
                base64 += String.fromCharCode.apply(null, Array.from(chunk));
              }

              imageUrl = `data:image/png;base64,${btoa(base64)}`;
              console.log("Successfully generated with Together AI");
            }
          }
        } else {
          const errorText = await togetherResponse.text();
          lastError = `Together AI: ${togetherResponse.status} - ${errorText.substring(0, 100)}`;
          console.error(lastError);
        }
      } catch (error) {
        lastError = `Together AI: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error("Together AI error:", error);
      }
    }

    if (!imageUrl) {
      try {
        console.log("Using placeholder generation...");
        const placeholderUrl = `https://via.placeholder.com/1024x1024/6366f1/ffffff?text=${encodeURIComponent(prompt.substring(0, 50))}`;

        const placeholderResponse = await fetch(placeholderUrl, {
          method: "GET",
          signal: AbortSignal.timeout(10000)
        });

        if (placeholderResponse.ok) {
          const imageBlob = await placeholderResponse.blob();
          const arrayBuffer = await imageBlob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          let base64 = '';
          const chunkSize = 8192;
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.slice(i, i + chunkSize);
            base64 += String.fromCharCode.apply(null, Array.from(chunk));
          }

          imageUrl = `data:image/png;base64,${btoa(base64)}`;
          console.log("Generated placeholder image");
        }
      } catch (error) {
        console.error("Placeholder error:", error);
      }
    }

    if (!imageUrl) {
      console.error("All generation methods failed. Last error:", lastError);
      return new Response(
        JSON.stringify({
          error: "Image generation failed",
          details: lastError,
          message: "Unable to generate image. Please try again with a different prompt or check your internet connection."
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
      JSON.stringify({ 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error",
        details: "Please check the console logs for more information."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});