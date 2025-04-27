
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import Autocomplete from '@/components/Autocomplete';

interface SearchHeaderProps {
  onSearch: (query: string, type: 'channel' | 'asset') => void;
}

const SearchHeader = ({ onSearch }: SearchHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/')}>
          ← Back
        </Button>
        <Logo />
      </div>
      <div className="flex items-center gap-4">
        <Autocomplete 
          onSearch={onSearch} 
          type="channel"
          placeholder="Search assets or channels..."
        />
        <ThemeToggle />
      </div>
    </header>
  );
};

export default SearchHeader;
