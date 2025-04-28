
// Function to convert a File to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Function to validate an image file
export const validateImageFile = (file: File): boolean => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return false;
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return false;
  }
  
  return true;
};

// Function to download an image
export const downloadImage = (url: string, filename: string = 'avatar.png'): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to strip base64 header for OpenAI API
export const stripBase64Header = (base64String: string): string => {
  return base64String.replace(/^data:image\/[a-z]+;base64,/, '');
};

// Convert OpenAI response to usable URL
export const base64ToUrl = (base64String: string): string => {
  if (!base64String.startsWith('data:image')) {
    return `data:image/png;base64,${base64String}`;
  }
  return base64String;
};
