
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import MentionsTable from '@/components/MentionsTable';
import Autocomplete from '@/components/Autocomplete';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseMentions } from '@/hooks/useSupabaseMentions';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { mentions, loading, error, fetchMore, hasMore } = useSupabaseMentions({
    limit: 100
  });

  const handleSearch = (query: string) => {
    // Check if the query appears to be an asset or channel
    // This is a simple check; in a real app, this might be more sophisticated
    navigate(`/search/${encodeURIComponent(query)}`);
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
          <CardHeader className="bg-primary/5 dark:bg-primary/10">
            <CardTitle className="text-xl font-semibold">Recent Mentions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MentionsTable 
              mentions={mentions} 
              isExpandable={true}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={fetchMore} 
            />
          </CardContent>
        </Card>
        
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md mt-4">
            Error loading data: {error.message}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
