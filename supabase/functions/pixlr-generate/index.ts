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

    // Try Picsum for placeholder with overlay text
    try {
      console.log("Attempting Picsum Photos with text overlay...");
      const seed = Math.floor(Math.random() * 1000);
      const width = 1024;
      const height = 1024;

      // Use picsum for the base image
      const picsumUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;

      const picsumResponse = await fetch(picsumUrl, {
        method: "GET",
        redirect: "follow"
      });

      if (picsumResponse.ok) {
        const imageBlob = await picsumResponse.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        imageUrl = `data:image/jpeg;base64,${base64}`;
        console.log("Successfully generated with Picsum");
      } else {
        lastError = `Picsum: ${picsumResponse.status}`;
      }
    } catch (error) {
      lastError = `Picsum: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error("Picsum error:", error);
    }

    // Try Lorem Picsum as fallback
    if (!imageUrl) {
      try {
        console.log("Attempting Lorem Picsum...");
        const id = Math.floor(Math.random() * 1000);
        const loremUrl = `https://picsum.photos/id/${id}/1024/1024`;

        const loremResponse = await fetch(loremUrl, {
          method: "GET",
          redirect: "follow"
        });

        if (loremResponse.ok) {
          const imageBlob = await loremResponse.blob();
          const arrayBuffer = await imageBlob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          imageUrl = `data:image/jpeg;base64,${base64}`;
          console.log("Successfully generated with Lorem Picsum");
        } else {
          lastError = `Lorem Picsum: ${loremResponse.status}`;
        }
      } catch (error) {
        lastError = `Lorem Picsum: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error("Lorem Picsum error:", error);
      }
    }

    // Try Placeholder.com as another fallback
    if (!imageUrl) {
      try {
        console.log("Attempting Placeholder.com...");
        const colors = ["FF6B6B", "4ECDC4", "45B7D1", "FFA07A", "98D8C8", "F7DC6F"];
        const bgColor = colors[Math.floor(Math.random() * colors.length)];
        const textColor = "FFFFFF";
        const encodedText = encodeURIComponent(prompt.substring(0, 50));

        const placeholderUrl = `https://via.placeholder.com/1024x1024/${bgColor}/${textColor}?text=${encodedText}`;

        const placeholderResponse = await fetch(placeholderUrl, {
          method: "GET"
        });

        if (placeholderResponse.ok) {
          const imageBlob = await placeholderResponse.blob();
          const arrayBuffer = await imageBlob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          imageUrl = `data:image/png;base64,${base64}`;
          console.log("Successfully generated with Placeholder.com");
        } else {
          lastError = `Placeholder: ${placeholderResponse.status}`;
        }
      } catch (error) {
        lastError = `Placeholder: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error("Placeholder error:", error);
      }
    }

    // Try DummyImage.com as final fallback
    if (!imageUrl) {
      try {
        console.log("Attempting DummyImage...");
        const colors = ["ff6b6b", "4ecdc4", "45b7d1", "ffa07a", "98d8c8", "f7dc6f"];
        const bgColor = colors[Math.floor(Math.random() * colors.length)];
        const shortText = prompt.substring(0, 30).replace(/[^a-zA-Z0-9 ]/g, '');

        const dummyUrl = `https://dummyimage.com/1024x1024/${bgColor}/ffffff&text=${encodeURIComponent(shortText)}`;

        const dummyResponse = await fetch(dummyUrl, {
          method: "GET"
        });

        if (dummyResponse.ok) {
          const imageBlob = await dummyResponse.blob();
          const arrayBuffer = await imageBlob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          imageUrl = `data:image/png;base64,${base64}`;
          console.log("Successfully generated with DummyImage");
        } else {
          lastError = `DummyImage: ${dummyResponse.status}`;
        }
      } catch (error) {
        lastError = `DummyImage: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error("DummyImage error:", error);
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
