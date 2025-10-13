'use client';

import { useState } from 'react';
import RecentContentFeed from '@/components/recent-content-feed';

export default function ContentPage() {
  const [feedRefresh, setFeedRefresh] = useState(0);

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Content Library
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          View and manage your sourced content
        </p>
      </div>

      {/* Recent Content Feed */}
      <div className="max-w-5xl mx-auto">
        <RecentContentFeed refreshTrigger={feedRefresh} />
      </div>
    </div>
  );
}
