
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENAI_API_URL = 'https://api.openai.com/v1/images';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, mode, image, style, size } = await req.json();
    
    // Validate required parameters
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing avatar request: mode=${mode}, style=${style}, size=${size}`);
    
    let imageData: string = '';
    
    if (mode === 'create') {
      // Text-to-image generation
      const response = await fetch(`${OPENAI_API_URL}/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: buildPrompt(prompt, style),
          n: 1,
          size: size || "1024x1024",
          response_format: "b64_json"
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('OpenAI API error:', error);
        throw new Error(error.error?.message || 'Failed to generate image');
      }
      
      const data = await response.json();
      imageData = data.data[0].b64_json;
      
    } else if (mode === 'edit' && image) {
      // Image-to-image (edit) generation
      const response = await fetch(`${OPENAI_API_URL}/edits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "dall-e-2", // DALL-E 3 doesn't support edits yet
          image: image,
          prompt: buildPrompt(prompt, style),
          n: 1,
          size: size || "1024x1024",
          response_format: "b64_json"
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('OpenAI API error:', error);
        throw new Error(error.error?.message || 'Failed to edit image');
      }
      
      const data = await response.json();
      imageData = data.data[0].b64_json;
    }
    
    return new Response(
      JSON.stringify({ imageData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error generating avatar:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to build prompts with style information
function buildPrompt(prompt: string, style?: string): string {
  if (!style || style === 'realistic') {
    return `A high-quality, professional avatar portrait of ${prompt}. Make sure it's suitable for a profile picture, with good lighting and clear facial features.`;
  }
  
  switch (style) {
    case 'anime':
      return `An anime-style avatar of ${prompt}. Use vibrant colors, large expressive eyes, and stylized features typical of anime.`;
    case 'pixel':
      return `A pixel art style avatar of ${prompt}. Use limited color palette and visible pixels in a retro game aesthetic.`;
    case '3d':
      return `A 3D rendered avatar of ${prompt}. Ensure good lighting, shadows, and texture details.`;
    case 'sketch':
      return `A hand-drawn sketch style avatar of ${prompt}. Use pencil or pen strokes, with a artistic, incomplete look.`;
    default:
      return `A high-quality avatar portrait of ${prompt} in ${style} style.`;
  }
}
