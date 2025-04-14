"use client";

import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Project 2025
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}