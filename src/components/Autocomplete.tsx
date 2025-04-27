
import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Search } from "lucide-react";

interface AutocompleteProps {
  placeholder?: string;
  onSearch: (query: string, type: 'channel' | 'asset') => void;
  type: 'channel' | 'asset';
}

export default function Autocomplete({ placeholder, onSearch, type }: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const column = type === 'channel' ? 'youtube_channel' : 'Asset';
        
        // Use startsWith query for better matches
        const { data, error } = await supabase
          .from('Youtube Sentiment')
          .select(column)
          .ilike(column, `${query}%`)
          .limit(10);

        if (error) throw error;

        // Extract unique values
        const uniqueValues = Array.from(new Set(data.map(item => item[column])))
          .filter(Boolean) as string[];
        
        setSuggestions(uniqueValues);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the fetch operation
    const handler = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(handler);
  }, [query, type]);

  const handleSubmit = () => {
    if (value.trim()) {
      onSearch(value.trim(), type);
      setOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full max-w-sm">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger ref={triggerRef} asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={open} 
            className="w-full justify-between"
          >
            <Input
              value={value}
              onChange={e => {
                setValue(e.target.value);
                setQuery(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || `Search by ${type}...`}
              className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
            />
            {loading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Search className="h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandList>
              <CommandEmpty>
                {loading ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </div>
                ) : query.length < 2 ? (
                  'Type at least 2 characters to search'
                ) : (
                  'No matches found'
                )}
              </CommandEmpty>
              <CommandGroup>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    onSelect={() => {
                      setValue(suggestion);
                      setOpen(false);
                      onSearch(suggestion, type);
                    }}
                    className="flex items-center"
                  >
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button 
        type="submit" 
        size="sm"
        className="absolute right-0 top-0 h-full rounded-l-none"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
      </Button>
    </div>
  );
}
