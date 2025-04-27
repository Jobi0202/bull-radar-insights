
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";
import { Mention } from '@/types';
import SentimentBadge from '../SentimentBadge';

interface MentionRowProps {
  mention: Mention;
  expandedView?: 'channel' | 'asset';
  onChannelClick?: (channel: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isExpandable: boolean;
}

const MentionRow = ({
  mention,
  expandedView,
  onChannelClick,
  isExpanded,
  onToggleExpand,
  isExpandable,
}: MentionRowProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <TableRow 
      className={isExpandable ? "cursor-pointer hover:bg-muted/50" : ""}
      onClick={isExpandable ? onToggleExpand : undefined}
    >
      {expandedView !== 'channel' && (
        <TableCell>
          {onChannelClick ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onChannelClick(mention.youtube_channel);
              }}
              className="hover:underline text-primary text-left"
            >
              {mention.youtube_channel}
            </button>
          ) : (
            mention.youtube_channel
          )}
        </TableCell>
      )}
      
      {expandedView !== 'asset' && (
        <TableCell>{mention.Asset}</TableCell>
      )}
      
      <TableCell>{formatDate(mention.Publish_date)}</TableCell>
      
      <TableCell>
        <SentimentBadge sentiment={mention.Sentiment} />
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-2">
          {mention.URL && (
            <a 
              href={mention.URL} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-primary hover:text-primary/80 transition-colors bg-primary/10 p-2 rounded-full flex items-center justify-center hover:bg-primary/20"
              title="Watch on YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
          )}
          <span className="truncate">{mention.Video_Name}</span>
        </div>
      </TableCell>
      
      {isExpandable && (
        <TableCell className="text-right">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            {isExpanded ? "Hide" : "Details"}
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
};

export default MentionRow;
