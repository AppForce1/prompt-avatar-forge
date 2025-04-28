
import React, { useState } from 'react';
import PromptInput from '@/components/PromptInput';
import AvatarGallery from '@/components/AvatarGallery';
import LoadingAvatar from '@/components/LoadingAvatar';
import AvatarPreviewModal from '@/components/AvatarPreviewModal';
import { generateAvatar, getAvatars, deleteAvatar, Avatar, GenerationMode } from '@/services/avatarService';
import { toast } from 'sonner';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatars, setAvatars] = useState(() => getAvatars());
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleGenerate = async (
    prompt: string,
    mode: GenerationMode,
    file: File | null,
    style?: string,
    size?: string
  ) => {
    try {
      setIsLoading(true);
      const newAvatar = await generateAvatar({
        prompt,
        mode,
        image: file,
        style,
        size: size as '512x512' | '1024x1024',
      });
      
      setAvatars(getAvatars());
      toast.success(`Avatar successfully ${mode === 'create' ? 'created' : 'edited'}!`);
      
      // Automatically show the new avatar in the preview modal
      setSelectedAvatar(newAvatar);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteAvatar(id);
    setAvatars(getAvatars());
    toast.success('Avatar deleted');
  };

  const handleSelectAvatar = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 glow-text bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-blue-400">
            Avatar Forge
          </h1>
          <p className="text-muted-foreground mb-8">
            Create custom avatars using AI-powered text prompts or edit existing images
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-accent/20 rounded-xl p-6 backdrop-blur-sm glow-border">
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
        </div>

        <div className="max-w-7xl mx-auto">
          {isLoading && (
            <div className="mb-8">
              <LoadingAvatar />
            </div>
          )}

          <AvatarGallery 
            avatars={avatars} 
            onDelete={handleDelete} 
            onSelect={handleSelectAvatar}
          />
        </div>
      </div>

      <AvatarPreviewModal
        avatar={selectedAvatar}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      <footer className="border-t border-border py-6 mt-12">
        <div className="container">
          <p className="text-sm text-center text-muted-foreground">
            Avatar Forge - Create and edit stunning AI-generated avatars
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
