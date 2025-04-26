
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import SearchBar from '@/components/SearchBar';
import MentionsTable from '@/components/MentionsTable';
import { getRecentMentions } from '@/data/mockData';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [mentions] = useState(() => getRecentMentions(10));

  const handleSearch = (query: string) => {
    // Check if the query appears to be an asset or channel
    // This is a simple check; in a real app, this might be more sophisticated
    navigate(`/search/${encodeURIComponent(query)}`);
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <Logo />
        <SearchBar onSearch={handleSearch} />
      </header>

      <main>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">10 Most Recent Mentions</h2>
          <MentionsTable mentions={mentions} isExpandable={true} />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
