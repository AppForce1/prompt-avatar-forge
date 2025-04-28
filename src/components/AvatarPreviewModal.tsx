
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/services/avatarService';
import { downloadImage } from '@/utils/fileUtils';
import { Download, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AvatarPreviewModalProps {
  avatar: Avatar | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AvatarPreviewModal: React.FC<AvatarPreviewModalProps> = ({ avatar, open, onOpenChange }) => {
  if (!avatar) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Avatar Preview</DialogTitle>
          <DialogDescription>{avatar.metadata.prompt}</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <img
            src={avatar.url}
            alt={avatar.metadata.prompt}
            className="w-full h-auto rounded-md object-contain max-h-[70vh]"
          />
          <Button 
            className="absolute top-2 right-2" 
            size="icon" 
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              downloadImage(avatar.url, `avatar-${avatar.metadata.id}.png`);
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline">{avatar.metadata.dimensions}</Badge>
          {avatar.metadata.style && (
            <Badge variant="outline">{avatar.metadata.style}</Badge>
          )}
          <Badge variant="outline">{avatar.metadata.mode === 'create' ? 'Generated' : 'Edited'}</Badge>
          <Badge variant="outline">
            {new Date(avatar.metadata.timestamp).toLocaleString()}
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarPreviewModal;
