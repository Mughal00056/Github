import { Product } from './types';

export type SyncEventType = 
  | 'PRODUCTS_UPDATED' 
  | 'CATEGORIES_UPDATED' 
  | 'ANNOUNCEMENTS_UPDATED' 
  | 'SETTINGS_UPDATED' 
  | 'ORDERS_UPDATED'
  | 'COUPONS_UPDATED';

export interface SyncMessage {
  type: SyncEventType;
  payload: any;
  timestamp: number;
}

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('aether_sync_channel');
  } catch (e) {
    console.warn('BroadcastChannel not available:', e);
  }
}

/**
 * Broadcasts an admin mutation to all panels (storefront, dashboard, modals)
 * regardless of whether they are in the same tab or separate browser tabs/windows.
 */
export function broadcastAdminChange(type: SyncEventType, payload: any) {
  const message: SyncMessage = {
    type,
    payload,
    timestamp: Date.now()
  };

  // 1. Sync local storage caches with dual keys to prevent mismatches
  try {
    if (type === 'PRODUCTS_UPDATED') {
      localStorage.setItem('cached_products', JSON.stringify(payload));
      localStorage.setItem('aether-products', JSON.stringify(payload));
      // Also update Express backend cache in background
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } else if (type === 'CATEGORIES_UPDATED') {
      localStorage.setItem('cached_categories', JSON.stringify(payload));
    } else if (type === 'ANNOUNCEMENTS_UPDATED') {
      localStorage.setItem('cached_announcements', JSON.stringify(payload));
    } else if (type === 'SETTINGS_UPDATED') {
      localStorage.setItem('admin_escrow_settings', JSON.stringify(payload));
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('LocalStorage synchronization warning:', err);
  }

  // 2. BroadcastChannel (inter-tab communication)
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage(message);
    }
  } catch (err) {
    console.warn('BroadcastChannel error:', err);
  }

  // 3. In-window custom event (intra-tab communication)
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aether_sync_event', { detail: message }));
    }
  } catch (err) {
    console.warn('CustomEvent dispatch error:', err);
  }
}

export interface SyncListeners {
  onProducts?: (products: Product[]) => void;
  onCategories?: (categories: any[]) => void;
  onAnnouncements?: (announcements: string[]) => void;
  onSettings?: (settings: { easypaisaNumber: string; jazzcashNumber: string; cryptoAddress: string }) => void;
  onOrders?: () => void;
}

/**
 * Subscribes to real-time updates from the Admin Panel.
 */
export function listenToAdminChanges(listeners: SyncListeners): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleMessage = (msg: SyncMessage) => {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'PRODUCTS_UPDATED':
        if (listeners.onProducts && Array.isArray(msg.payload)) {
          listeners.onProducts(msg.payload);
        }
        break;
      case 'CATEGORIES_UPDATED':
        if (listeners.onCategories && Array.isArray(msg.payload)) {
          listeners.onCategories(msg.payload);
        }
        break;
      case 'ANNOUNCEMENTS_UPDATED':
        if (listeners.onAnnouncements && Array.isArray(msg.payload)) {
          listeners.onAnnouncements(msg.payload);
        }
        break;
      case 'SETTINGS_UPDATED':
        if (listeners.onSettings && msg.payload) {
          listeners.onSettings(msg.payload);
        }
        break;
      case 'ORDERS_UPDATED':
        if (listeners.onOrders) {
          listeners.onOrders();
        }
        break;
    }
  };

  // 1. BroadcastChannel message listener
  const bcListener = (event: MessageEvent) => {
    handleMessage(event.data);
  };
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', bcListener);
  }

  // 2. Custom intra-tab event listener
  const customListener = (event: Event) => {
    const customEvt = event as CustomEvent<SyncMessage>;
    if (customEvt.detail) {
      handleMessage(customEvt.detail);
    }
  };
  window.addEventListener('aether_sync_event', customListener);

  // 3. Storage event listener (fires in other tabs when localStorage changes)
  const storageListener = (event: StorageEvent) => {
    if (!event.newValue) return;
    try {
      if (event.key === 'cached_products' || event.key === 'aether-products') {
        const parsed = JSON.parse(event.newValue);
        if (Array.isArray(parsed) && listeners.onProducts) {
          listeners.onProducts(parsed);
        }
      } else if (event.key === 'cached_categories') {
        const parsed = JSON.parse(event.newValue);
        if (Array.isArray(parsed) && listeners.onCategories) {
          listeners.onCategories(parsed);
        }
      } else if (event.key === 'cached_announcements') {
        const parsed = JSON.parse(event.newValue);
        if (Array.isArray(parsed) && listeners.onAnnouncements) {
          listeners.onAnnouncements(parsed);
        }
      } else if (event.key === 'admin_escrow_settings') {
        const parsed = JSON.parse(event.newValue);
        if (parsed && listeners.onSettings) {
          listeners.onSettings(parsed);
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  };
  window.addEventListener('storage', storageListener);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', bcListener);
    }
    window.removeEventListener('aether_sync_event', customListener);
    window.removeEventListener('storage', storageListener);
  };
}
