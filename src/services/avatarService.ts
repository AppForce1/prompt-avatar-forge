import { toast } from 'sonner';
import { stripBase64Header, fileToBase64, base64ToUrl } from '@/utils/fileUtils';
import { supabase } from "@/integrations/supabase/client";

// Define types for our API
export type GenerationMode = 'create' | 'edit';

export interface GenerationRequest {
  prompt: string;
  mode: GenerationMode;
  image?: File | null;
  style?: string;
  size?: '1024x1024' | '1024x1792' | '1792x1024'; // Updated valid sizes for DALL-E 3
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

// Generate a new avatar using OpenAI
export const generateAvatar = async (request: GenerationRequest): Promise<Avatar> => {
  try {
    toast.info('Processing your avatar request...', {
      duration: 5000,
    });
    
    // Prepare the payload for the edge function
    const payload: any = {
      prompt: request.prompt,
      mode: request.mode,
      style: request.style,
      size: request.size
    };
    
    // If we're editing an image, convert it to base64
    if (request.mode === 'edit' && request.image) {
      const imageBase64 = await fileToBase64(request.image);
      payload.image = stripBase64Header(imageBase64);
    }
    
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-avatar', {
      body: payload,
    });
    
    if (error) {
      console.error('Error calling generate-avatar function:', error);
      throw new Error(error.message || 'Failed to generate avatar');
    }
    
    if (!data || !data.imageData) {
      console.error('Invalid response from generate-avatar function:', data);
      throw new Error('Invalid response from server');
    }
    
    // Convert base64 to URL
    const url = base64ToUrl(data.imageData);
    
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
    
    // Fallback to mock data if the API call fails
    return generateMockAvatar(request);
  }
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
