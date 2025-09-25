import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Book } from 'lucide-react';

const verses = [
  {
    text: "Tell me, what do you have in your house?",
    reference: "2 Kings 4:2"
  },
  {
    text: "Go around and ask all your neighbors for empty jars—don't ask for just a few.",
    reference: "2 Kings 4:3"
  },
  {
    text: "Then go inside and shut the door... Pour oil into all the jars.",
    reference: "2 Kings 4:4"
  },
  {
    text: "Go, sell the oil and pay your debts. You and your sons can live on what is left.",
    reference: "2 Kings 4:7"
  },
  {
    text: "When all the jars were full, she said... 'Bring me another one.' But there was not a jar left. Then the oil stopped flowing.",
    reference: "2 Kings 4:6"
  }
];

interface BiblicalVerseProps {
  className?: string;
}

export const BiblicalVerse: React.FC<BiblicalVerseProps> = ({ className = "" }) => {
  const [currentVerse, setCurrentVerse] = useState(verses[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVerse(verses[Math.floor(Math.random() * verses.length)]);
    }, 30000); // Change verse every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={`bg-white border border-purple-100 shadow-card dark:bg-zinc-900 dark:border-zinc-800 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="mt-1 text-purple-600">
            <Book className="h-5 w-5" />
          </div>
          <div>
            <blockquote className="text-sm font-medium text-foreground italic mb-2">
              "{currentVerse.text}"
            </blockquote>
            <cite className="text-xs font-semibold text-muted-foreground">
              — {currentVerse.reference}
            </cite>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};