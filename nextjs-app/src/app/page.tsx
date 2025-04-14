import React from 'react';
import fs from 'fs';
import path from 'path';
import Layout from '../components/Layout';
import HomePage from '../components/HomePage';
import Newsletter from '../components/Newsletter';


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
}

// In App Router, components can be async
export default async function Home() {
  // Fetch data (replaces getStaticProps)
  const items = await getItems();
  
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <HomePage items={items} />
        </div>
        <div className="md:col-span-1">
          <Newsletter />
        </div>
      </div>
    </Layout>
  );
}

// Helper function to get items and list data
async function getItems(): Promise<Item[]> {
  try {
    // Path to the index.json file
    const dataDir = path.join(process.cwd(), '../', 'data');
    const indexPath = path.join(dataDir, 'index.json');
    
    // Read and parse the index file
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    // Find the list item in the index
    const listItem = indexData.items.find((item: Item) => item.type === 'list');
    
    if (listItem) {
      // Read the list data file
      const listPath = path.join(dataDir, listItem.path);
      const listData = JSON.parse(fs.readFileSync(listPath, 'utf8'));
      
      // Add the agenda items to the list item
      listItem.agendaItems = listData.agendaItems || [];
      
      // Return the list item with agenda items
      return [listItem];
    }
    
    return indexData.items || [];
  } catch (error) {
    console.error('Error loading index data:', error);
    
    // Return empty items array if there's an error
    return [];
  }
}

// This enables revalidation (similar to revalidate in getStaticProps)
export const revalidate = 3600; // Revalidate every hour