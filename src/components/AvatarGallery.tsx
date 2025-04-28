
import React from 'react';
import AvatarCard from './AvatarCard';
import { Avatar } from '@/services/avatarService';
import { Separator } from '@/components/ui/separator';
import { ImageIcon } from 'lucide-react';

interface AvatarGalleryProps {
  avatars: Avatar[];
  onDelete?: (id: string) => void;
  onSelect?: (avatar: Avatar) => void;
}

const AvatarGallery: React.FC<AvatarGalleryProps> = ({ avatars, onDelete, onSelect }) => {
  if (avatars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted rounded-full p-6 mb-4">
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium text-foreground mb-2">No avatars yet</h3>
        <p className="text-muted-foreground max-w-md">
          Your generated avatars will appear here. Get started by creating a new avatar using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Your Avatars</h2>
          <span className="text-sm text-muted-foreground">{avatars.length} avatar{avatars.length !== 1 ? 's' : ''}</span>
        </div>
        <Separator />
      </div>
      <div className="avatar-grid">
        {avatars.map((avatar) => (
          <AvatarCard 
            key={avatar.metadata.id} 
            avatar={avatar} 
            onDelete={onDelete}
            onClick={onSelect ? () => onSelect(avatar) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default AvatarGallery;
