"use client";

import React from 'react';
import Link from 'next/link';

interface Source {
  index: number;
  url: string;
}

interface AgendaItemProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: string;
  impact: string;
  sourceIndices: number[];
  sources?: Source[];
}

export default function AgendaItemCard({
  id,
  title,
  description,
  progress,
  status,
  impact,
  sourceIndices,
  sources
}: AgendaItemProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {/* Placeholder image */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      </div>
      
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-3">
          <Link href={`/item/${id}`} className="hover:underline text-blue-600 dark:text-blue-400">
            {title}
          </Link>
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {description}
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status:</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Impact:</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{impact}</p>
        </div>
        
        {sources && sourceIndices && sourceIndices.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sources:</h3>
            <div className="flex flex-wrap gap-2">
              {sourceIndices.slice(0, 3).map((index) => {
                const source = sources.find(s => s.index === index);
                return source ? (
                  <a 
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Source {index}
                  </a>
                ) : null;
              })}
              {sourceIndices.length > 3 && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">
                  +{sourceIndices.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}