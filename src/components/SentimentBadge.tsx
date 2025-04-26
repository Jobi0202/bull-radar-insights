
import React from 'react';
import { cn } from "@/lib/utils";

interface SentimentBadgeProps {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
}

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment }) => {
  const getEmoji = () => {
    switch (sentiment) {
      case 'Bullish':
        return '🟢';
      case 'Bearish':
        return '🔴';
      case 'Neutral':
        return '🔵';
      default:
        return '';
    }
  };

  return (
    <span 
      className={cn(
        "sentiment-badge",
        sentiment === 'Bullish' && "sentiment-bullish",
        sentiment === 'Bearish' && "sentiment-bearish",
        sentiment === 'Neutral' && "sentiment-neutral"
      )}
    >
      {getEmoji()} {sentiment}
    </span>
  );
};

export default SentimentBadge;
