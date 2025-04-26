
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Youtube } from "lucide-react";
import SentimentBadge from './SentimentBadge';
import { Mention } from '@/types';

interface MentionsTableProps {
  mentions: Mention[];
  isExpandable?: boolean;
  filterOptions?: string[];
  filterLabel?: string;
  onFilterChange?: (value: string) => void;
  expandedView?: 'channel' | 'asset';
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const MentionsTable: React.FC<MentionsTableProps> = ({ 
  mentions, 
  isExpandable = false, 
  filterOptions = [],
  filterLabel = "Filter",
  onFilterChange,
  expandedView,
  onLoadMore,
  hasMore = false,
  loading = false
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="space-y-4">
      {filterOptions.length > 0 && onFilterChange && (
        <div className="flex items-center gap-2">
          <Select onValueChange={onFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={`${filterLabel}: All`} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">{filterLabel}: All</SelectItem>
                {filterOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              {expandedView !== 'channel' && <TableHead>Channel</TableHead>}
              {expandedView !== 'asset' && <TableHead>Asset</TableHead>}
              <TableHead>Date</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead className="w-full">Video</TableHead>
              {isExpandable && <TableHead className="w-10"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {loading ? 'Loading...' : 'No results found.'}
                </TableCell>
              </TableRow>
            ) : (
              mentions.map((mention) => (
                <React.Fragment key={mention.id}>
                  <TableRow 
                    className={isExpandable ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={isExpandable ? () => toggleExpand(mention.id) : undefined}
                  >
                    {expandedView !== 'channel' && <TableCell>{mention.youtube_channel}</TableCell>}
                    {expandedView !== 'asset' && <TableCell>{mention.Asset}</TableCell>}
                    <TableCell>{formatDate(mention.Publish_date)}</TableCell>
                    <TableCell>
                      <SentimentBadge sentiment={mention.Sentiment} />
                    </TableCell>
                    <TableCell className="max-w-xs lg:max-w-md xl:max-w-lg flex items-center gap-2">
                      {mention.URL && (
                        <a 
                          href={mention.URL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          <Youtube className="h-5 w-5" />
                        </a>
                      )}
                      <span className="truncate">{truncateText(mention.Video_Name, 60)}</span>
                    </TableCell>
                    {isExpandable && (
                      <TableCell className="text-right">
                        <Collapsible open={expandedId === mention.id}>
                          <CollapsibleTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(mention.id);
                              }}
                            >
                              {expandedId === mention.id ? "Hide" : "Details"}
                            </Button>
                          </CollapsibleTrigger>
                        </Collapsible>
                      </TableCell>
                    )}
                  </TableRow>
                  {isExpandable && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <Collapsible open={expandedId === mention.id}>
                          <CollapsibleContent className="p-4 bg-secondary/30">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold">Analysis</h4>
                                <p className="text-sm text-muted-foreground">{mention.Analysis}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">Video</h4>
                                <p className="text-sm">{mention.Video_Name}</p>
                                <a 
                                  href={mention.URL} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                                >
                                  <Youtube className="h-4 w-4" /> Watch on YouTube
                                </a>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button 
            onClick={onLoadMore} 
            variant="outline" 
            className="w-full max-w-xs"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Results'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MentionsTable;
