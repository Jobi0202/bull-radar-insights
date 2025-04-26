
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import MentionsTable from '@/components/MentionsTable';
import Autocomplete from '@/components/Autocomplete';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSupabaseMentions } from '@/hooks/useSupabaseMentions';
import { RefreshCw } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { mentions, loading, error, fetchMore, hasMore, refresh } = useSupabaseMentions({
    limit: 100
  });

  const handleSearch = (query: string) => {
    navigate(`/search/${encodeURIComponent(query)}`);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex items-center gap-4">
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
          <CardHeader className="bg-primary/5 dark:bg-primary/10 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">Recent Mentions</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefresh} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <MentionsTable 
              mentions={mentions} 
              isExpandable={true}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={fetchMore} 
            />
            
            {mentions.length === 0 && !loading && !error && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No mentions found. Try refreshing the data.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh} 
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
                  onClick={handleRefresh}
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
