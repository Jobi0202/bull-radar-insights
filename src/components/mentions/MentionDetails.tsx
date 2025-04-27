
import { TableRow, TableCell } from "@/components/ui/table";
import { Youtube } from "lucide-react";
import { Mention } from '@/types';
import ChannelAssetDetails from '../ChannelAssetDetails';

interface MentionDetailsProps {
  mention: Mention;
  expandedView?: 'channel' | 'asset';
}

const MentionDetails = ({ mention, expandedView }: MentionDetailsProps) => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="p-0">
        <div className="p-4 bg-secondary/30">
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
        </div>
      </TableCell>
    </TableRow>
  );
};

export default MentionDetails;
