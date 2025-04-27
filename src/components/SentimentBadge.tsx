
import React from 'react';
import { cn } from "@/lib/utils";

type SentimentType = 'Strong Bullish' | 'Slightly Bullish' | 'Bullish' | 'Strong Bearish' | 'Slightly Bearish' | 'Bearish' | 'Neutral (Hold)' | 'Neutral';

interface SentimentBadgeProps {
  sentiment: SentimentType;
}

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment }) => {
  const getEmoji = () => {
    switch (sentiment) {
      case 'Strong Bullish':
      case 'Slightly Bullish':
      case 'Bullish':
        return '🟢';
      case 'Strong Bearish':
      case 'Slightly Bearish':
      case 'Bearish':
        return '🔴';
      case 'Neutral (Hold)':
      case 'Neutral':
        return '🔵';
      default:
        return '⚪';
    }
  };

  const getBadgeClass = () => {
    if (sentiment.includes('Bullish')) {
      return 'sentiment-bullish';
    }
    if (sentiment.includes('Bearish')) {
      return 'sentiment-bearish';
    }
    return 'sentiment-neutral';
  };

  return (
    <span className={cn(
      "sentiment-badge whitespace-nowrap",
      getBadgeClass()
    )}>
      {getEmoji()} {sentiment}
    </span>
  );
};

export default SentimentBadge;
