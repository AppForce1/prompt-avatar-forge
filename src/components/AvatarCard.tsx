
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, CalendarIcon, Clock } from 'lucide-react';
import { downloadImage } from '@/utils/fileUtils';
import { Avatar } from '@/services/avatarService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

interface AvatarCardProps {
  avatar: Avatar;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

const AvatarCard: React.FC<AvatarCardProps> = ({ avatar, onDelete, onClick }) => {
  const [isHovering, setIsHovering] = useState(false);
  const { metadata, url } = avatar;
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadImage(url, `avatar-${metadata.id}.png`);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(metadata.id);
    }
  };
  
  const formattedDate = formatDistanceToNow(new Date(metadata.timestamp), { addSuffix: true });

  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 ${isHovering ? 'scale-[1.02] shadow-lg shadow-purple-900/20' : ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardContent className="p-0 relative">
        <img 
          src={url} 
          alt={metadata.prompt} 
          className="w-full h-64 object-cover transition-transform duration-200"
          style={{ transform: isHovering ? 'scale(1.05)' : 'scale(1)' }}
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant="secondary" className="text-xs">
            {metadata.dimensions}
          </Badge>
          {metadata.style && (
            <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
              {metadata.style}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4 gap-2">
        <p className="text-sm line-clamp-2">{metadata.prompt}</p>
        <div className="flex items-center justify-between w-full mt-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formattedDate}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {new Date(metadata.timestamp).toLocaleString()}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AvatarCard;
