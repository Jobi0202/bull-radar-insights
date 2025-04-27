
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ChannelAssetDetails as DetailsType } from '@/types';
import { Youtube } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface ChannelAssetDetailsProps {
  type: 'channel' | 'asset';
  name: string;
}

const ChannelAssetDetails = ({ type, name }: ChannelAssetDetailsProps) => {
  const [details, setDetails] = useState<DetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('YoutubeAdditionalInformation')
          .select('*')
          .eq('Type', type === 'channel' ? 'channel' : 'asset')
          .ilike('Name', name)
          .maybeSingle();
        
        if (fetchError) throw fetchError;
        
        setDetails(data);
      } catch (err) {
        console.error('Error fetching details:', err);
        setError('Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    
    if (name) {
      fetchDetails();
    }
  }, [type, name]);

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row gap-4 p-2">
        <div className="flex-shrink-0 w-full md:w-1/3">
          <Skeleton className="h-40 w-full rounded-md" />
        </div>
        <div className="flex-grow space-y-2 w-full md:w-2/3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="p-4 text-muted-foreground">
        No additional information available for this {type}.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 p-2">
      {details.ImageURL && (
        <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4">
          <img 
            src={details.ImageURL} 
            alt={details.Name || `${type} image`} 
            className="w-full h-auto rounded-md object-cover"
          />
        </div>
      )}
      
      <div className={`flex-grow ${!details.ImageURL ? 'w-full' : 'w-full md:w-2/3 lg:w-3/4'}`}>
        {details.Name && (
          <h3 className="text-lg font-medium mb-2">{details.Name}</h3>
        )}
        
        {details.Description && (
          <p className="text-sm text-muted-foreground mb-3">{details.Description}</p>
        )}
        
        {details.ChannelURL && (
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="flex items-center gap-2"
          >
            <a href={details.ChannelURL} target="_blank" rel="noopener noreferrer">
              <Youtube className="h-4 w-4" /> 
              Visit Channel
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChannelAssetDetails;
