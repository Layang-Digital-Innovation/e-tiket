import { cn } from '@/lib/utils';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:font-semibold prose-headings:text-gray-700',
        'prose-p:text-gray-700 prose-p:leading-relaxed',
        'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-gray-900 prose-strong:font-semibold',
        'prose-ul:list-disc prose-ol:list-decimal',
        'prose-li:text-gray-700',
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
