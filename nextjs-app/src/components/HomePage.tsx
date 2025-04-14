"use client";

import React from 'react';
import AgendaItemCard from './AgendaItemCard';

interface Source {
  index: number;
  url: string;
}

interface AgendaItem {
  title: string;
  description: string;
  progress: number;
  status: string;
  impact: string;
  sourceIndices: number[];
}

interface Item {
  id: string;
  type: string;
  timestamp: string;
  title?: string;
  path: string;
  agendaItems?: AgendaItem[];
  sources?: Source[];
}

interface HomePageProps {
  items: Item[];
}

export default function HomePage({ items }: HomePageProps) {
  // Find the list item that contains agenda items
  const listItem = items.find(item => item.type === 'list' && Array.isArray(item.agendaItems) && item.agendaItems.length > 0);
  
  if (!listItem || !listItem.agendaItems || listItem.agendaItems.length === 0) {
    return (
      <div className="py-8">
        <h1 className="text-4xl font-bold mb-8">Project 2025 Reports</h1>
        <div className="flex flex-col gap-6">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-semibold mb-2">
                <a href={`/item/${item.id}`} className="hover:underline">
                  {item.title || `Report ${item.id}`}
                </a>
              </h2>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Type: {item.type}</span>
                <time dateTime={item.timestamp}>
                  {new Date(item.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold mb-8">Project 2025 Agenda Items</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {listItem.agendaItems.map((agendaItem, index) => (
          <AgendaItemCard
            key={`agenda-${index}`}
            id={`item-${index}`}
            title={agendaItem.title}
            description={agendaItem.description}
            progress={agendaItem.progress}
            status={agendaItem.status}
            impact={agendaItem.impact}
            sourceIndices={agendaItem.sourceIndices}
            sources={listItem.sources}
          />
        ))}
      </div>
    </div>
  );
}