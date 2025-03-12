import { create } from 'zustand'

import { Service, ServiceItem, ServiceItemReference, PreviewSettings } from "@renderer/types/service"
interface ServiceState {
  currentItem: any,
  currentSection: any,
  currentService: Service | null,
  services: Service[],
  // Cache of loaded items
  itemsCache: Record<string, ServiceItem>,
  // Currently loaded and resolved items for the current service
  resolvedItems: ServiceItem[],
  // Current active item
  activeItem: ServiceItem | null,
  settings: PreviewSettings,
  // Set active item
  setActiveItem: (item: ServiceItem) => void,
  // Set current service
  setCurrentService: (service: Service) => void,
  // Set services list
  setServices: (services: Service[]) => void,
  // Set resolved items for current service
  setResolvedItems: (items: ServiceItem[]) => void,
  // Set current item for presentation
  setCurrentItem: (item: any) => void,
  // Update preview settings
  updatePreviewSettings: (settings: Partial<PreviewSettings>) => void,
  // Update general settings
  updateSettings: (settings: any) => void,
  // Set settings
  setSettings: (settings: PreviewSettings) => void,
  // Load active service
  loadActiveService: () => Promise<boolean>,
  // Refresh current service (re-load all items)
  refreshCurrentService: () => Promise<void>,
  // Load item by reference
  loadItemByReference: (ref: ServiceItemReference) => Promise<ServiceItem | null>,
  // Resolve items for a service
  resolveServiceItems: (service: Service) => Promise<ServiceItem[]>,
  // Cache an item
  cacheItem: (item: ServiceItem) => void,
  // Invalidate a cache item
  invalidateCacheItem: (type: string, id: string) => void,
}

// Default empty settings to avoid null checks
const defaultSettings: PreviewSettings = {
  fontSize: 24,
  fontPosition: "center",
  fontFamily: "Arial",
  textEffect: "none",
  textColor: "#ffffff",
  highlightColor: "rgba(255,255,0,0.3)",
  videoSpeed: 1,
  videoMuted: false,
  background: {
    type: "image",
    url: "",
  },
  textAlign: "center",
};

export const useServiceStore = create<ServiceState>((set, get) => ({
    // Initialize with empty data but provide basic structure to avoid errors
    services: [],
    currentService: null,
    currentItem: null,
    currentSection: null,
    itemsCache: {},
    resolvedItems: [],
    activeItem: null,
    settings: defaultSettings,
    setSettings: (settings: any) => {
        // Handle video background
        if (settings.background?.type === 'video' && settings.background.url?.startsWith('blob:')) {
            // Send message to main process to save the video
            window.electron?.ipcRenderer.invoke('save-video', settings.background.url)
                .then((savedPath: string) => {
                    const updatedSettings = {
                        ...settings,
                        background: {
                            ...settings.background,
                            url: savedPath
                        }
                    };
                    set((state) => ({ 
                        settings: updatedSettings,
                        activeItem: state.activeItem ? { ...state.activeItem, previewSettings: updatedSettings } : null
                    }));
                    window.electron?.ipcRenderer.send('settings-update', updatedSettings);
                });
        } else {
            set((state) => ({ 
                settings,
                activeItem: state.activeItem ? { ...state.activeItem, previewSettings: settings } : null
            }));
            window.electron?.ipcRenderer.send('settings-update', settings);
        }
    },
    setServices: (services: Service[]) => set({ services }),
    
    cacheItem: (item: ServiceItem) => {
      if (!item || !item.id) return;
      
      set(state => ({ 
        itemsCache: {
          ...state.itemsCache,
          [`${item.type}:${item.id}`]: item
        }
      }));
    },
    
    // Method to invalidate a specific item in the cache
    invalidateCacheItem: (type: string, id: string) => {
      const cacheKey = `${type}:${id}`;
      console.log(`Invalidating cache for ${cacheKey}`);
      
      set(state => {
        // Create a new cache object without the specified item
        const newCache = { ...state.itemsCache };
        delete newCache[cacheKey];
        
        console.log(`Cache item ${cacheKey} removed. Cache now has ${Object.keys(newCache).length} items.`);
        return { itemsCache: newCache };
      });
    },
    
    loadItemByReference: async (ref: ServiceItemReference) => {
      if (!ref || !window.electron) return null;
      
      const cacheKey = `${ref.type}:${ref.id}`;
      const cachedItem = get().itemsCache[cacheKey];
      
      // Return from cache if available
      if (cachedItem) {
        console.log(`Using cached item for ${cacheKey}`);
        return cachedItem;
      }
      
      console.log(`Cache miss for ${cacheKey}, loading from database...`);
      
      // Otherwise load from database
      try {
        const result = await window.electron.ipcRenderer.invoke('db-get-item', { 
          type: ref.type, 
          id: ref.id 
        });
        
        if (result.success && result.data) {
          const item = result.data;
          console.log(`Successfully loaded ${cacheKey} from database`);
          
          // Apply any custom settings from the reference
          if (ref.customSettings) {
            item.previewSettings = {
              ...item.previewSettings,
              ...ref.customSettings
            };
          }
          
          // Cache the item for future use
          get().cacheItem(item);
          
          return item;
        }
      } catch (error) {
        console.error(`Failed to load item ${ref.type}:${ref.id}:`, error);
      }
      
      console.warn(`Failed to load item ${cacheKey} from database`);
      return null;
    },
    
    resolveServiceItems: async (service: Service) => {
      if (!service || !service.items) return [];
      
      try {
        // Load all items in parallel
        const itemsPromises = service.items.map(ref => get().loadItemByReference(ref));
        const loadedItems = await Promise.all(itemsPromises);
        
        // Filter out any null items
        return loadedItems.filter(item => item !== null) as ServiceItem[];
      } catch (error) {
        console.error('Error resolving service items:', error);
        return [];
      }
    },
    
    setResolvedItems: (items: ServiceItem[]) => set({ resolvedItems: items }),
    
    setCurrentService: async (service: Service) => {
      // First, set the current service reference
      set({ currentService: service });
      
      // Save current service ID to localStorage
      if (service?.id) {
        localStorage.setItem('currentServiceId', service.id);
      }
      
      // Then resolve all items in the service
      const resolvedItems = await get().resolveServiceItems(service);
      
      // Update the state with resolved items
      set({
        resolvedItems,
        activeItem: resolvedItems[0] || null,
        currentItem: resolvedItems[0] || null,
        currentSection: resolvedItems[0]?.content?.[0] || null,
        settings: resolvedItems[0]?.previewSettings || defaultSettings
      });
    },
    
    setActiveItem: (item: ServiceItem) => {
      if (!item) return;
      
      set({ 
        activeItem: item,
        settings: item.previewSettings || defaultSettings
      });
    },
    
    setCurrentItem: (item: any) => {
      if (!item) return;
      
      set({ currentItem: item });
      // Send to presenter window
      window.electron?.ipcRenderer.send('update-presenter', {
        ...item,
        timestamp: performance.now()
      });
    },
    
    updatePreviewSettings: (settings: Partial<PreviewSettings>) => set((state) => {
      if (!state.activeItem) return {};
      
      // Convert blob URLs to proper file URLs
      if (settings.background?.type === 'video' && settings.background.url?.startsWith('blob:')) {
        settings.background.url = settings.background.url.replace(/^blob:/, '');
      }
      
      const updatedSettings = { 
        ...state.activeItem.previewSettings, 
        ...settings 
      };
      
      return {
        activeItem: { 
          ...state.activeItem, 
          previewSettings: updatedSettings 
        }
      };
    }),
    
    updateSettings: (settings: any) => set((state) => {
      if (!state.activeItem) return {};
      return {
        activeItem: { ...state.activeItem, ...settings }
      };
    }),
    
    refreshCurrentService: async () => {
      console.log('Refreshing current service...');
      const { currentService } = get();
      if (currentService) {
        console.log(`Current service: ${currentService.name}, ID: ${currentService.id}`);
        
        // Re-resolve all items to get fresh data
        const resolvedItems = await get().resolveServiceItems(currentService);
        console.log(`Resolved ${resolvedItems.length} items for refresh`);
        
        // Store active item IDs before refresh
        const activeItemId = get().activeItem?.id;
        const currentItemId = get().currentItem?.id;
        
        // Find the updated versions of current items
        const newActiveItem = resolvedItems.find(item => item.id === activeItemId) || resolvedItems[0] || null;
        const newCurrentItem = resolvedItems.find(item => item.id === currentItemId) || resolvedItems[0] || null;
        
        console.log(`Updating state with fresh data. Active Item: ${newActiveItem?.title}, Current Item: ${newCurrentItem?.title}`);
        
        // Update the state with freshly resolved items
        set({
          resolvedItems,
          activeItem: newActiveItem,
          currentItem: newCurrentItem,
        });
        
        // Update settings if active item changed
        if (newActiveItem) {
          set({ settings: newActiveItem.previewSettings || defaultSettings });
        }
        
        console.log('Current service refreshed successfully');
      } else {
        console.log('No current service to refresh');
      }
    },
    
    loadActiveService: async () => {
      if (!window.electron) return false;
      
      try {
        // Load all services first, regardless of whether we have a current service ID
        const result = await window.electron.ipcRenderer.invoke('db-get-all-items', { type: 'service' });
        const services = result.success ? result.data : [];
        
        // Always update the services list
        set({ services });
        
        // Get current service ID from local storage
        const currentServiceId = localStorage.getItem('currentServiceId');
        
        // If we have a specific service ID, try to load it
        if (currentServiceId) {
          const currentService = services.find((s: Service) => s.id === currentServiceId);
          if (currentService) {
            // Set it as the active service
            await get().setCurrentService(currentService);
            return true;
          }
        }
        
        // If we have any services, load the first one
        if (services.length > 0) {
          await get().setCurrentService(services[0]);
          return true;
        }
        
        // If we have no services, clear any current service data to show empty state
        set({ 
          currentService: null,
          resolvedItems: [],
          activeItem: null,
          currentItem: null,
          currentSection: null
        });
      } catch (error) {
        console.error('Failed to load active service:', error);
      }
      
      return false;
    },
}))

