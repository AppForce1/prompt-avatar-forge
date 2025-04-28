
import { toast } from 'sonner';

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

// Mock data for placeholder avatars (to simulate previously generated avatars)
const mockAvatars: Avatar[] = [
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    metadata: {
      id: '1',
      prompt: 'Professional woman with a confident smile',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      dimensions: '512x512',
      mode: 'create',
      style: 'realistic'
    }
  },
  {
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    metadata: {
      id: '2',
      prompt: 'Young man with stylish hair in urban setting',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      dimensions: '512x512',
      mode: 'create',
      style: 'modern'
    }
  },
  {
    url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    metadata: {
      id: '3',
      prompt: 'Professional portrait of a woman with red hair',
      timestamp: new Date().toISOString(),
      dimensions: '1024x1024',
      mode: 'create',
      style: 'professional'
    }
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    metadata: {
      id: '4',
      prompt: 'Smiling young man with glasses indoors',
      timestamp: new Date().toISOString(),
      dimensions: '1024x1024',
      mode: 'edit',
      style: 'casual'
    }
  }
];

// In-memory storage for our generated avatars
let avatars: Avatar[] = [...mockAvatars];

// Mock function to generate a new avatar
export const generateAvatar = async (request: GenerationRequest): Promise<Avatar> => {
  try {
    // Simulate API loading time
    toast.info('Processing your avatar request...', {
      duration: 3000,
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // For mock purposes, we'll use placeholder images
    let placeholderUrl: string;
    
    if (request.mode === 'create') {
      // Use a different placeholder for each style
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
      // For edit mode, just use the same placeholder generator but with different seed
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
    
    return newAvatar;
  } catch (error) {
    console.error('Error generating avatar:', error);
    toast.error('Failed to generate avatar. Please try again.');
    throw new Error('Failed to generate avatar');
  }
};

// Function to get all previously generated avatars
export const getAvatars = (): Avatar[] => {
  return avatars;
};

// Function to delete an avatar
export const deleteAvatar = (id: string): void => {
  avatars = avatars.filter(avatar => avatar.metadata.id !== id);
};
