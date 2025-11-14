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

    const seed = Math.floor(Math.random() * 1000000);

    const imageServices = [
      {
        name: "Pollinations",
        url: `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`,
        timeout: 30000,
      },
      {
        name: "Pollinations Alt",
        url: `https://pollinations.ai/p/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}`,
        timeout: 30000,
      },
      {
        name: "Picsum Placeholder",
        url: `https://picsum.photos/1024/1024?random=${seed}`,
        timeout: 10000,
      },
    ];

    let lastError: Error | null = null;

    for (const service of imageServices) {
      try {
        console.log(`Attempting to generate image using ${service.name}:`, service.url);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), service.timeout);

        const imageResponse = await fetch(service.url, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "image/*",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!imageResponse.ok) {
          throw new Error(`${service.name} returned status: ${imageResponse.status}`);
        }

        const imageBlob = await imageResponse.blob();
        console.log(`Image fetched successfully from ${service.name}, size:`, imageBlob.size, "bytes");

        if (imageBlob.size < 100) {
          throw new Error(`Image from ${service.name} too small, likely an error response`);
        }

        const arrayBuffer = await imageBlob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        const chunkSize = 8192;

        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }

        const base64 = btoa(binary);
        const dataUrl = `data:image/jpeg;base64,${base64}`;

        console.log(`Image converted to base64 from ${service.name}, length:`, base64.length);

        return new Response(
          JSON.stringify({
            image_url: dataUrl,
            success: true,
            service: service.name,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (fetchError) {
        console.error(`Error with ${service.name}:`, fetchError);
        lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
        continue;
      }
    }

    console.error("All image services failed. Last error:", lastError);

    return new Response(
      JSON.stringify({
        error: "Image generation failed",
        message: lastError?.message || "All image services are unavailable",
        details: "Unable to generate image at this time. Please try again later.",
      }),
      {
        status: 500,
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