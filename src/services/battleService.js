import { createClient } from '@supabase/supabase-js';

// Optional Supabase credentials from environment
const SUPABASE_URL = typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL 
  ? process.env.VITE_SUPABASE_URL 
  : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';

const SUPABASE_ANON_KEY = typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY 
  ? process.env.VITE_SUPABASE_ANON_KEY 
  : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

let supabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your_')) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.warn("Realtime sync fallback triggered:", e);
    }
  }
}

/**
 * Generates a short 6-character room code
 */
export function generateRoomCode() {
  return 'ROAST-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

/**
 * Subscribes to realtime battle room updates
 */
export function subscribeToBattleRoom(roomCode, onRoomUpdate) {
  if (supabase) {
    const channel = supabase.channel(`battle_${roomCode}`, {
      config: { broadcast: { self: true } }
    });

    channel
      .on('broadcast', { event: 'battle_event' }, (payload) => {
        if (onRoomUpdate) onRoomUpdate(payload.payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Fallback using BroadcastChannel API for local multi-tab testing
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    const channel = new BroadcastChannel(`battle_${roomCode}`);
    const handler = (e) => {
      if (onRoomUpdate) onRoomUpdate(e.data);
    };
    channel.addEventListener('message', handler);
    return () => {
      channel.removeEventListener('message', handler);
      channel.close();
    };
  }

  return () => {};
}

/**
 * Sends a message/event to the battle room
 */
export function broadcastBattleEvent(roomCode, eventData) {
  if (supabase) {
    const channel = supabase.channel(`battle_${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'battle_event',
      payload: eventData
    });
  }

  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel(`battle_${roomCode}`);
      channel.postMessage(eventData);
      channel.close();
    } catch (e) {}
  }
}
