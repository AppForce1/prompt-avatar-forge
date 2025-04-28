
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const LoadingAvatar: React.FC = () => {
  // Generate a random loading message
  const loadingMessages = [
    "Forging your avatar...",
    "Generating masterpiece...",
    "AI is working its magic...",
    "Creating digital likeness...",
    "Drawing pixels of perfection...",
    "Crafting your new look..."
  ];
  
  const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 flex items-center justify-center h-64 bg-accent bg-grid">
        <div className="flex flex-col items-center justify-center text-primary">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-slow">
              <Loader2 className="h-8 w-8 text-primary animate-spin-slow" />
            </div>
            <div className="absolute inset-0 bg-radial-gradient rounded-full animate-pulse"></div>
          </div>
          <p className="mt-4 text-sm font-medium animate-pulse">{randomMessage}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <div className="w-full space-y-2">
          <div className="h-4 bg-accent rounded animate-pulse"></div>
          <div className="h-4 w-2/3 bg-accent rounded animate-pulse"></div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoadingAvatar;
