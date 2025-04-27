
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
import ChannelAssetDetails from './ChannelAssetDetails';
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
  onChannelClick?: (channel: string) => void;
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
  loading = false,
  onChannelClick
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
              {expandedView !== 'channel' && (
                <TableHead className="w-[180px] min-w-[120px]">Channel</TableHead>
              )}
              {expandedView !== 'asset' && (
                <TableHead className="w-[150px] min-w-[100px]">Asset</TableHead>
              )}
              <TableHead className="w-[110px] min-w-[90px]">Date</TableHead>
              <TableHead className="min-w-[120px]">Sentiment</TableHead>
              <TableHead className="hidden md:table-cell">Video</TableHead>
              {isExpandable && <TableHead className="w-[80px]"></TableHead>}
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
                        <span className="truncate">{truncateText(mention.Video_Name, 60)}</span>
                      </div>
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
                              {/* Mobile-only video title */}
                              <div className="md:hidden">
                                <h4 className="font-semibold">Video</h4>
                                <p className="text-sm">{mention.Video_Name}</p>
                                {mention.URL && (
                                  <a 
                                    href={mention.URL} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                                  >
                                    <Youtube className="h-4 w-4" /> Watch on YouTube
                                  </a>
                                )}
                              </div>
                              
                              {/* Channel or Asset details */}
                              {expandedView === 'channel' ? (
                                <div>
                                  <h4 className="font-semibold">Asset Details</h4>
                                  <ChannelAssetDetails 
                                    type="asset"
                                    name={mention.Asset}
                                  />
                                </div>
                              ) : expandedView === 'asset' ? (
                                <div>
                                  <h4 className="font-semibold">Channel Details</h4>
                                  <ChannelAssetDetails 
                                    type="channel"
                                    name={mention.youtube_channel}
                                  />
                                </div>
                              ) : null}
                              
                              {/* Analysis */}
                              <div>
                                <h4 className="font-semibold">Analysis</h4>
                                <p className="text-sm text-muted-foreground">{mention.Analysis}</p>
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
            variant="default" 
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
