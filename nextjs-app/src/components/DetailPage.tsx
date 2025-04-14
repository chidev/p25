"use client";

import React from 'react';
import Link from 'next/link';
import { ShareArticle } from './ShareArticle';

interface Source {
  index: number;
  url: string;
}

interface ApiMetadata {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  citationTokens: number;
  numSearchQueries: number;
  reasoningTokens: number;
  aiAnalysis?: string;
}

interface Item {
  id: string;
  type: string;
  timestamp: string;
  content: string;
  sources: Source[];
  apiMetadata: ApiMetadata;
  title?: string;
}

interface DetailPageProps {
  item: Item;
}

export default function DetailPage({ item }: DetailPageProps) {
  return (
    <div className="py-8">
      <div className="mb-8">
        <Link href="/" className="text-primary hover:underline flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Reports
        </Link>
      </div>

      <div className="flex justify-between items-start mb-6">
        <h1 className="text-4xl font-bold">{item.title || `Report ${item.id}`}</h1>
        <ShareArticle url={`${typeof window !== 'undefined' ? window.location.href : ''}`} title={item.title || `Report ${item.id}`} />
      </div>

      <div className="mb-6 text-sm text-muted-foreground">
        <time dateTime={item.timestamp}>
          {new Date(item.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <span className="mx-2">•</span>
        <span>Type: {item.type}</span>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none mb-8" dangerouslySetInnerHTML={{ __html: item.content }} />

      {item.sources.length > 0 && (
        <div className="border-t pt-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Sources</h2>
          <ul className="space-y-2">
            {item.sources.map((source) => (
              <li key={source.index}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {source.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}