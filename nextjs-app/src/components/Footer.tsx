"use client";

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Project 2025. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Home
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}