"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface SystemStatus {
  apiConfigured: boolean;
  apiStatus: "configured" | "not-configured" | "testing" | "error";
  sourceItemsCount: number;
  triviaSetsCount: number;
  loading: boolean;
  error: string | null;
}

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    apiConfigured: false,
    apiStatus: "testing",
    sourceItemsCount: 0,
    triviaSetsCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Test Gemini API configuration
        let apiConfigured = false;
        try {
          const response = await fetch("/api/gemini/test", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const result = await response.json();
          apiConfigured = result.success;
        } catch (apiError) {
          console.log("Gemini API test failed:", apiError);
          apiConfigured = false;
        }

        // Get source items count from ingested table
        const { count: sourceCount, error: sourceError } = await supabase
          .from("ingested")
          .select("*", { count: "exact", head: true });

        if (sourceError) {
          throw new Error(`Source count error: ${sourceError.message}`);
        }

        // Get trivia questions count from all three trivia tables
        const { count: mcCount } = await supabase
          .from("trivia_multiple_choice")
          .select("*", { count: "exact", head: true });

        const { count: tfCount } = await supabase
          .from("true_false_trivia")
          .select("*", { count: "exact", head: true });

        const { count: whoamiCount } = await supabase
          .from("trivia_who_am_i")
          .select("*", { count: "exact", head: true });

        const triviaCount =
          (mcCount || 0) + (tfCount || 0) + (whoamiCount || 0);

        setStatus({
          apiConfigured,
          apiStatus: apiConfigured ? "configured" : "not-configured",
          sourceItemsCount: sourceCount || 0,
          triviaSetsCount: triviaCount || 0,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          apiStatus: "error",
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    };

    checkSystemStatus();
  }, []);

  return status;
}
