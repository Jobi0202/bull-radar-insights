
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
import SentimentBadge from './SentimentBadge';
import { Mention } from '@/types';

interface MentionsTableProps {
  mentions: Mention[];
  isExpandable?: boolean;
  filterOptions?: string[];
  filterLabel?: string;
  onFilterChange?: (value: string) => void;
  expandedView?: 'channel' | 'asset';
}

const MentionsTable: React.FC<MentionsTableProps> = ({ 
  mentions, 
  isExpandable = false, 
  filterOptions = [],
  filterLabel = "Filter",
  onFilterChange,
  expandedView 
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
              {(isExpandable || expandedView) && <TableHead>Score</TableHead>}
              {isExpandable && <TableHead className="w-10"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No results found.
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
                    {(isExpandable || expandedView) && (
                      <TableCell className="font-mono">
                        {mention.Score.toFixed(2)}
                      </TableCell>
                    )}
                    {isExpandable && (
                      <TableCell className="text-right">
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
                                <a 
                                  href={mention.URL} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  {mention.Video_Name}
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
    </div>
  );
};

export default MentionsTable;
