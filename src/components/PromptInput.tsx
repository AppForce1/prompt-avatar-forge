
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Upload, Wand2 } from 'lucide-react';
import { validateImageFile } from '@/utils/fileUtils';
import { toast } from 'sonner';
import { GenerationMode } from '@/services/avatarService';

interface PromptInputProps {
  onGenerate: (prompt: string, mode: GenerationMode, file: File | null, style?: string, size?: string) => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GenerationMode>('create');
  const [file, setFile] = useState<File | null>(null);
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('512x512');
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (!validateImageFile(selectedFile)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF) under 10MB.');
        return;
      }
      
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    if (mode === 'edit' && !file) {
      toast.error('Please upload an image to edit');
      return;
    }
    
    onGenerate(prompt, mode, file, style, size);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <Tabs 
        defaultValue="create" 
        className="w-full" 
        onValueChange={(value) => setMode(value as GenerationMode)}
      >
        <TabsContent value="create" className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Style Preset</h3>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="pixel">Pixel Art</SelectItem>
                  <SelectItem value="3d">3D Render</SelectItem>
                  <SelectItem value="sketch">Sketch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Size</h3>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="512x512">512 × 512</SelectItem>
                  <SelectItem value="1024x1024">1024 × 1024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="mb-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 transition-all hover:border-primary/50">
            {filePreview ? (
              <div className="relative w-full">
                <img src={filePreview} alt="Upload preview" className="h-64 w-full object-cover rounded-md mx-auto" />
                <Button 
                  variant="outline" 
                  className="absolute top-2 right-2" 
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setFilePreview(null);
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Upload an image to edit</p>
                <Input 
                  type="file"
                  className="hidden"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="avatar-upload">
                  <Button variant="outline" asChild>
                    <span>Choose file</span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        </TabsContent>

        <div className="flex flex-col">
          <TabsContent value="edit" className="mt-0 mb-2">
            <h3 className="text-sm font-medium">Edit Instructions</h3>
          </TabsContent>
          <TabsContent value="create" className="mt-0 mb-2">
            <h3 className="text-sm font-medium">Description</h3>
          </TabsContent>
          
          <div className="flex space-x-2">
            <Input
              placeholder={
                mode === 'create'
                  ? "Describe your avatar (e.g. 'A cyberpunk warrior with glowing blue eyes')"
                  : "Describe your edits (e.g. 'Add a crown and make the background dark')"
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="relative overflow-hidden" disabled={isLoading}>
              <span className="flex items-center gap-1">
                {mode === 'create' ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    <span>Edit</span>
                  </>
                )}
              </span>
              {isLoading && (
                <span className="absolute inset-0 flex items-center justify-center bg-primary">
                  <svg className="animate-spin h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              )}
            </Button>
          </div>
        </div>
        
        <TabsList className="mt-4">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Create Avatar
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Edit Image
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </form>
  );
};

export default PromptInput;
