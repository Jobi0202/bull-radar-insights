
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';

import Logo from '@/components/Logo';
import MentionsTable from '@/components/MentionsTable';
import Autocomplete from '@/components/Autocomplete';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSupabaseMentions } from '@/hooks/useSupabaseMentions';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  const { mentions, loading, error, fetchMore, hasMore, refresh } = useSupabaseMentions({
    limit: 100,
    dateRange: date
  });

  const handleSearch = (query: string, type: 'asset' | 'channel') => {
    navigate(`/search/${encodeURIComponent(query)}?type=${type}`);
  };

  const handleChannelClick = (channel: string) => {
    navigate(`/search/${encodeURIComponent(channel)}?type=channel`);
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in font-sans">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-end">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-[240px]",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}
                      </>
                    ) : (
                      format(date.from, "LLL dd")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Autocomplete 
            onSearch={handleSearch}
            type="asset"
            placeholder="Search assets or channels..."
          />
          <ThemeToggle />
        </div>
      </header>

      <main>
        <Card className="mb-6 overflow-hidden border-none shadow-lg">
          <CardHeader className="bg-primary/5 dark:bg-primary/10">
            <CardTitle className="text-xl font-semibold">Radar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MentionsTable 
              mentions={mentions} 
              isExpandable={true}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={fetchMore}
              onChannelClick={handleChannelClick}
            />
            
            {mentions.length === 0 && !loading && !error && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No mentions found. Try refreshing the data.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={refresh} 
                  className="mt-4"
                >
                  Refresh Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              <div className="flex flex-col gap-2">
                <p>Error loading data: {error.message}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refresh}
                  className="self-start"
                >
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
};

export default HomePage;
