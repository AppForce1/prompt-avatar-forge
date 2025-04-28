
import { toast } from 'sonner';
import { stripBase64Header, fileToBase64, base64ToUrl } from '@/utils/fileUtils';

// Define types for our API
export type GenerationMode = 'create' | 'edit';

export interface GenerationRequest {
  prompt: string;
  mode: GenerationMode;
  image?: File | null;
  style?: string;
  size?: '512x512' | '1024x1024';
}

export interface AvatarMetadata {
  id: string;
  prompt: string;
  timestamp: string;
  dimensions: string;
  mode: GenerationMode;
  style?: string;
}

export interface Avatar {
  url: string;
  metadata: AvatarMetadata;
}

// OpenAI API Configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/images';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// In-memory storage for our generated avatars (in a real app, this would be in a database)
let avatars: Avatar[] = [];

// Helper function to load avatars from localStorage
const loadAvatarsFromStorage = (): void => {
  try {
    const savedAvatars = localStorage.getItem('avatarforge_avatars');
    if (savedAvatars) {
      avatars = JSON.parse(savedAvatars);
    }
  } catch (error) {
    console.error('Failed to load avatars from localStorage', error);
  }
};

// Helper function to save avatars to localStorage
const saveAvatarsToStorage = (): void => {
  try {
    localStorage.setItem('avatarforge_avatars', JSON.stringify(avatars));
  } catch (error) {
    console.error('Failed to save avatars to localStorage', error);
  }
};

// Initialize avatars from localStorage
loadAvatarsFromStorage();

// Function to check if API key is configured
const isApiKeyConfigured = (): boolean => {
  return !!OPENAI_API_KEY && OPENAI_API_KEY.length > 0;
};

// Generate a new avatar using OpenAI
export const generateAvatar = async (request: GenerationRequest): Promise<Avatar> => {
  try {
    // Check if API key is configured
    if (!isApiKeyConfigured()) {
      toast.error('OpenAI API key is not configured. Please set the VITE_OPENAI_API_KEY environment variable.');
      throw new Error('OpenAI API key is not configured');
    }
    
    toast.info('Processing your avatar request...', {
      duration: 5000,
    });
    
    let imageData: string = '';
    
    if (request.mode === 'create') {
      // Text-to-image generation
      const response = await fetch(`${OPENAI_API_URL}/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: buildPrompt(request.prompt, request.style),
          n: 1,
          size: request.size || "1024x1024",
          response_format: "b64_json"
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate image');
      }
      
      const data = await response.json();
      imageData = data.data[0].b64_json;
      
    } else if (request.mode === 'edit' && request.image) {
      // Image-to-image (edit) generation
      const imageBase64 = await fileToBase64(request.image);
      const imageBase64Stripped = stripBase64Header(imageBase64);
      
      const response = await fetch(`${OPENAI_API_URL}/edits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "dall-e-2", // DALL-E 3 doesn't support edits yet
          image: imageBase64Stripped,
          prompt: buildPrompt(request.prompt, request.style),
          n: 1,
          size: request.size || "1024x1024",
          response_format: "b64_json"
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to edit image');
      }
      
      const data = await response.json();
      imageData = data.data[0].b64_json;
    }
    
    // Convert base64 to URL
    const url = base64ToUrl(imageData);
    
    // Create new avatar metadata
    const newAvatar: Avatar = {
      url,
      metadata: {
        id: Date.now().toString(),
        prompt: request.prompt,
        timestamp: new Date().toISOString(),
        dimensions: request.size || '1024x1024',
        mode: request.mode,
        style: request.style
      }
    };
    
    // Add to our "database"
    avatars = [newAvatar, ...avatars];
    
    // Save to localStorage
    saveAvatarsToStorage();
    
    return newAvatar;
  } catch (error) {
    console.error('Error generating avatar:', error);
    toast.error(`Failed to generate avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // If API key is not configured, provide fallback to mock data
    if (!isApiKeyConfigured()) {
      return generateMockAvatar(request);
    }
    
    throw error;
  }
};

// Helper function to build prompts with style information
const buildPrompt = (prompt: string, style?: string): string => {
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
};

// Fallback function to generate a mock avatar when API is not available
const generateMockAvatar = async (request: GenerationRequest): Promise<Avatar> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Use a different placeholder for each style
  let placeholderUrl: string;
  
  if (request.mode === 'create') {
    switch (request.style) {
      case 'anime':
        placeholderUrl = 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=' + Date.now();
        break;
      case 'pixel':
        placeholderUrl = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + Date.now();
        break;
      case 'realistic':
      default:
        placeholderUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now();
        break;
    }
  } else {
    placeholderUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random();
  }
  
  // Create new avatar metadata
  const newAvatar: Avatar = {
    url: placeholderUrl,
    metadata: {
      id: Date.now().toString(),
      prompt: request.prompt,
      timestamp: new Date().toISOString(),
      dimensions: request.size || '512x512',
      mode: request.mode,
      style: request.style
    }
  };
  
  // Add to our "database"
  avatars = [newAvatar, ...avatars];
  
  // Save to localStorage
  saveAvatarsToStorage();
  
  return newAvatar;
};

// Function to get all previously generated avatars
export const getAvatars = (): Avatar[] => {
  return avatars;
};

// Function to delete an avatar
export const deleteAvatar = (id: string): void => {
  avatars = avatars.filter(avatar => avatar.metadata.id !== id);
  saveAvatarsToStorage();
};
