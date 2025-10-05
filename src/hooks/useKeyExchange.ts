"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { createKeyExchange, KeyExchange } from "@/app/encryption/key_exchange";

/**
 * Custom hook to get KeyExchange instance for the current session user
 * Returns null if no session or user ID is available
 */
export function useKeyExchange(): KeyExchange | null {
  const { data: session } = useSession();
  
  const keyExchange = useMemo(() => {
    if (!session?.user?.id) {
      return null;
    }
    
    return createKeyExchange(session.user.id);
  }, [session?.user?.id]);
  
  return keyExchange;
}

/**
 * Custom hook to get KeyExchange instance for a specific user ID
 */
export function useKeyExchangeForUser(userId: string | null): KeyExchange | null {
  const keyExchange = useMemo(() => {
    if (!userId) {
      return null;
    }
    
    return createKeyExchange(userId);
  }, [userId]);
  
  return keyExchange;
}