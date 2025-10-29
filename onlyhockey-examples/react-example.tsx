/**
 * React/Next.js Examples for Tango Wisdom API
 * Copy and adapt these components for your OnlyHockey React app
 */

import { useState, useEffect } from "react";
import type {
  WisdomEntry,
  WisdomSingleResponse,
  WisdomListResponse,
} from "../onlyhockey-api-types";

const API_BASE = "https://[YOUR-TANGO-DOMAIN]/api/public/wisdom";

// ============================================
// Example 1: Random Wisdom Widget Component
// ============================================

export function RandomWisdomWidget() {
  const [wisdom, setWisdom] = useState<WisdomEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomWisdom = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/random`);
      const result: WisdomSingleResponse = await response.json();

      if (result.success) {
        setWisdom(result.data);
      } else {
        setError(result.error || "Failed to load wisdom");
      }
    } catch (err) {
      setError("Network error");
      console.error("Error fetching wisdom:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomWisdom();
  }, []);

  if (loading) {
    return <div className="wisdom-loading">Loading wisdom...</div>;
  }

  if (error) {
    return <div className="wisdom-error">Error: {error}</div>;
  }

  if (!wisdom) {
    return null;
  }

  return (
    <div className="wisdom-widget">
      <h3>{wisdom.title}</h3>
      <p className="musing">
        <em>&quot;{wisdom.musing}&quot;</em>
      </p>
      <blockquote className="quote">
        <strong>From the box:</strong> {wisdom.from_the_box}
      </blockquote>
      <div className="meta">
        {wisdom.theme && <span className="theme">{wisdom.theme}</span>}
        {wisdom.attribution && (
          <span className="attribution">{wisdom.attribution}</span>
        )}
      </div>
      <button onClick={fetchRandomWisdom} className="refresh-btn">
        Get Another Wisdom
      </button>
    </div>
  );
}

// ============================================
// Example 2: Latest Wisdom List Component
// ============================================

interface LatestWisdomListProps {
  limit?: number;
}

export function LatestWisdomList({ limit = 10 }: LatestWisdomListProps) {
  const [wisdomList, setWisdomList] = useState<WisdomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestWisdom = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/latest?limit=${limit}`);
        const result: WisdomListResponse = await response.json();

        if (result.success) {
          setWisdomList(result.data);
        } else {
          setError(result.error || "Failed to load wisdom");
        }
      } catch (err) {
        setError("Network error");
        console.error("Error fetching wisdom:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestWisdom();
  }, [limit]);

  if (loading) {
    return <div>Loading wisdom...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="wisdom-list">
      <h2>Latest Wisdom</h2>
      {wisdomList.map((wisdom) => (
        <WisdomCard key={wisdom.id} wisdom={wisdom} />
      ))}
    </div>
  );
}

// ============================================
// Example 3: Reusable Wisdom Card Component
// ============================================

interface WisdomCardProps {
  wisdom: WisdomEntry;
}

export function WisdomCard({ wisdom }: WisdomCardProps) {
  return (
    <article className="wisdom-card">
      <h3>{wisdom.title}</h3>
      <p className="musing">
        <em>&quot;{wisdom.musing}&quot;</em>
      </p>
      <blockquote className="quote">
        <strong>From the box:</strong> {wisdom.from_the_box}
      </blockquote>
      <div className="meta">
        {wisdom.theme && <span className="theme">{wisdom.theme}</span>}
        {wisdom.attribution && (
          <span className="attribution">{wisdom.attribution}</span>
        )}
      </div>
    </article>
  );
}

// ============================================
// Example 4: Filtered Wisdom Component
// ============================================

interface FilteredWisdomProps {
  theme: string;
}

export function FilteredWisdom({ theme }: FilteredWisdomProps) {
  const [wisdomList, setWisdomList] = useState<WisdomEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWisdom = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE}?theme=${encodeURIComponent(theme)}&limit=50`,
        );
        const result: WisdomListResponse = await response.json();

        if (result.success) {
          setWisdomList(result.data);
        }
      } catch (err) {
        console.error("Error fetching wisdom:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWisdom();
  }, [theme]);

  if (loading) {
    return <div>Loading {theme} wisdom...</div>;
  }

  return (
    <div className="filtered-wisdom">
      <h2>Wisdom: {theme}</h2>
      {wisdomList.map((wisdom) => (
        <WisdomCard key={wisdom.id} wisdom={wisdom} />
      ))}
    </div>
  );
}

// ============================================
// Example 5: Custom Hook for Wisdom Data
// ============================================

export function useRandomWisdom() {
  const [wisdom, setWisdom] = useState<WisdomEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWisdom = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/random`);
      const result: WisdomSingleResponse = await response.json();

      if (result.success) {
        setWisdom(result.data);
      } else {
        setError(result.error || "Failed to load wisdom");
      }
    } catch (err) {
      setError("Network error");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { wisdom, loading, error, fetchWisdom };
}

// Usage in component:
// const { wisdom, loading, error, fetchWisdom } = useRandomWisdom();
// useEffect(() => { fetchWisdom(); }, []);

// ============================================
// Example 6: Next.js Page with Server-Side Rendering
// ============================================

// app/wisdom/page.tsx (Next.js 13+ App Router)
export async function WisdomPage() {
  // Fetch on server side
  const response = await fetch(`${API_BASE}/latest?limit=20`, {
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  });
  const result: WisdomListResponse = await response.json();

  if (!result.success) {
    return <div>Failed to load wisdom</div>;
  }

  return (
    <div className="wisdom-page">
      <h1>Penalty Box Philosopher</h1>
      <p>Wisdom from the box</p>
      <div className="wisdom-grid">
        {result.data.map((wisdom) => (
          <WisdomCard key={wisdom.id} wisdom={wisdom} />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Example 7: Wisdom Archive with Pagination
// ============================================

export function WisdomArchive() {
  const [wisdomList, setWisdomList] = useState<WisdomEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const limit = 20;
  const totalPages = Math.ceil(totalCount / limit);

  const loadPage = async (page: number) => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await fetch(
        `${API_BASE}?limit=${limit}&offset=${offset}`,
      );
      const result: WisdomListResponse = await response.json();

      if (result.success) {
        setWisdomList(result.data);
        setTotalCount(result.count);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("Error loading page:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(1);
  }, []);

  return (
    <div className="wisdom-archive">
      <h1>Wisdom Archive</h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="wisdom-list">
            {wisdomList.map((wisdom) => (
              <WisdomCard key={wisdom.id} wisdom={wisdom} />
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => loadPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => loadPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
