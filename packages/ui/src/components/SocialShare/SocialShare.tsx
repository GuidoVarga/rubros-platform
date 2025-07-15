import { Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '../Button';

type SocialShareProps = {
  url: string;
  title: string;
  description?: string;
  className?: string;
};

export const SocialShare = ({ url, title, description, className }: SocialShareProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const isNativeShareAvailable = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground">Compartir:</span>

      {isNativeShareAvailable && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="gap-1"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}

      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir en Facebook"
          >
            <Facebook className="h-4 w-4" />
          </a>
        </Button>

        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir en Twitter"
          >
            <Twitter className="h-4 w-4" />
          </a>
        </Button>

        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir en WhatsApp"
            className="md:hidden"
          >
            <span className="text-green-600">📱</span>
          </a>
        </Button>
      </div>
    </div>
  );
};