import React from 'react';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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

// In App Router, components can be async
export default async function Detail({ params }: { params: { id: string } }) {
  // Fetch data (replaces getStaticProps)
  const item = await getItem(params.id);
  
  // If item not found, return 404
  if (!item) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline flex items-center">
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
      </div>

      <div className="mb-6 text-sm text-gray-500">
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

      {item.sources && item.sources.length > 0 && (
        <div className="border-t pt-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Sources</h2>
          <ul className="space-y-2">
            {item.sources.map((source) => (
              <li key={source.index}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
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

// Helper function to get item (replaces getStaticProps)
async function getItem(id: string): Promise<Item | null> {
  try {
    console.log(process.cwd())
    console.log(process.cwd())
    console.log(process.cwd())
    console.log(process.cwd())
    // Path to the data directory
    const dataDirServer = path.join(process.cwd(), '../', 'data');
    const dataDirLive = path.join(process.cwd(), 'data');

    const dataDir = fs.existsSync(path.join(dataDirServer, 'index.json')) ? dataDirServer : dataDirLive;

    console.log({dataDir})
    
    // Read the index file to find the item's file path
    const indexPath = path.join(dataDir, 'index.json');
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

    // Find the item in the index
    const indexItem = indexData.items.find((item: { id: string }) => item.id === id);
    
    if (!indexItem) {
      return null;
    }
    
    // Read the item's data file
    const itemPath = path.join(dataDir, indexItem.path);
    console.log(indexItem)
    console.log(itemPath)

    const itemData = JSON.parse(fs.readFileSync(itemPath, 'utf8'));
    
    return itemData;
  } catch (error) {
    console.error('Error loading item data:', error);
    return null;
  }
}

// This enables revalidation (similar to revalidate in getStaticProps)
export const revalidate = 3600; // Revalidate every hour

// This replaces getStaticPaths
export async function generateStaticParams() {
  try {
    // Path to the index.json file
    const dataDir = path.join(process.cwd(), '../../..', 'data');
    const indexPath = path.join(dataDir, 'index.json');
    
    // Read and parse the index file
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    // Generate params for each item
    return indexData.items.map((item: { id: string }) => ({
      id: item.id,
    }));
  } catch (error) {
    console.error('Error generating params:', error);
    return [];
  }
}

// This is similar to fallback: 'blocking' in getStaticPaths
export const dynamicParams = true;