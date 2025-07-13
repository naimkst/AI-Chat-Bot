import type { Attachment } from '@/lib/types';
import { LoaderIcon } from './icons';
import { PaperclipIcon } from 'lucide-react';

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;

  console.log("url====", contentType);

  return (
    <div data-testid="input-attachment-preview" className="flex flex-col gap-2">
      <div className="w-20 h-16 aspect-video bg-muted rounded-md relative flex items-center justify-center overflow-hidden">
        {isUploading ? (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            <LoaderIcon size={24} />
          </div>
        ) : contentType?.includes('png') || contentType?.includes('jpg') || contentType?.includes('jpeg') || contentType?.includes('webp') || contentType?.includes('gif') && url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={url}
            alt={name ?? 'Image preview'}
            className="rounded-md w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center text-zinc-400">
            <PaperclipIcon size={24} />
          </div>
        )}
      </div>
      {/* <div className="text-xs text-zinc-500 max-w-16 truncate text-center">
        {name || 'Uploading...'}
      </div> */}
    </div>
  );
};
