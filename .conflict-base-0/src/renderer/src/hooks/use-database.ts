import { useState, useCallback } from 'react';
import { useServiceStore } from '@renderer/store/useServiceStore';

type ItemType = 'song' | 'presentation' | 'service' | 'settings';

interface DatabaseItem {
  id: string;
  type: ItemType;
  [key: string]: any;
}

interface DatabaseResult<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

export function useDatabase() {
  const [saveResult, setSaveResult] = useState<DatabaseResult<string>>({
    loading: false,
    error: null,
    data: null
  });

  const [getResult, setGetResult] = useState<DatabaseResult<any>>({
    loading: false,
    error: null,
    data: null
  });

  const [getAllResult, setGetAllResult] = useState<DatabaseResult<any[]>>({
    loading: false,
    error: null,
    data: null
  });

  const [deleteResult, setDeleteResult] = useState<DatabaseResult<boolean>>({
    loading: false,
    error: null,
    data: null
  });

  // Save an item to the database
  const saveItem = useCallback(async (item: DatabaseItem) => {
    // Get access to the service store
    const { invalidateCacheItem } = useServiceStore.getState();
    
    if (!window.electron) {
      setSaveResult({
        loading: false,
        error: 'Electron not available',
        data: null
      });
      return null;
    }

    setSaveResult({
      loading: true,
      error: null,
      data: null
    });

    try {
      const result = await window.electron.ipcRenderer.invoke('db-save-item', {
        type: item.type,
        id: item.id,
        data: item
      });

      if (result.success) {
        // Invalidate the cache for this item to force a refresh
        if (item.type === 'song' || item.type === 'presentation') {
          invalidateCacheItem(item.type, item.id);
        }
        
        setSaveResult({
          loading: false,
          error: null,
          data: result.id
        });
        return result.id;
      } else {
        setSaveResult({
          loading: false,
          error: result.error || 'Unknown error',
          data: null
        });
        return null;
      }
    } catch (error) {
      setSaveResult({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      });
      return null;
    }
  }, []);

  // Get a single item from the database
  const getItem = useCallback(async (type: ItemType, id: string) => {
    if (!window.electron) {
      setGetResult({
        loading: false,
        error: 'Electron not available',
        data: null
      });
      return null;
    }

    setGetResult({
      loading: true,
      error: null,
      data: null
    });

    try {
      const result = await window.electron.ipcRenderer.invoke('db-get-item', { type, id });

      if (result.success) {
        setGetResult({
          loading: false,
          error: null,
          data: result.data
        });
        return result.data;
      } else {
        setGetResult({
          loading: false,
          error: result.error || 'Unknown error',
          data: null
        });
        return null;
      }
    } catch (error) {
      setGetResult({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      });
      return null;
    }
  }, []);

  // Get all items of a specific type
  const getAllItems = useCallback(async (type: ItemType) => {
    if (!window.electron) {
      setGetAllResult({
        loading: false,
        error: 'Electron not available',
        data: null
      });
      return [];
    }

    setGetAllResult({
      loading: true,
      error: null,
      data: null
    });

    try {
      const result = await window.electron.ipcRenderer.invoke('db-get-all-items', { type });

      if (result.success) {
        setGetAllResult({
          loading: false,
          error: null,
          data: result.data
        });
        return result.data;
      } else {
        setGetAllResult({
          loading: false,
          error: result.error || 'Unknown error',
          data: []
        });
        return [];
      }
    } catch (error) {
      setGetAllResult({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      });
      return [];
    }
  }, []);

  // Delete an item from the database
  const deleteItem = useCallback(async (type: ItemType, id: string) => {
    if (!window.electron) {
      setDeleteResult({
        loading: false,
        error: 'Electron not available',
        data: null
      });
      return false;
    }

    setDeleteResult({
      loading: true,
      error: null,
      data: null
    });

    try {
      const result = await window.electron.ipcRenderer.invoke('db-delete-item', { type, id });

      if (result.success) {
        setDeleteResult({
          loading: false,
          error: null,
          data: true
        });
        return true;
      } else {
        setDeleteResult({
          loading: false,
          error: result.error || 'Unknown error',
          data: false
        });
        return false;
      }
    } catch (error) {
      setDeleteResult({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: false
      });
      return false;
    }
  }, []);

  return {
    saveItem,
    getItem,
    getAllItems,
    deleteItem,
    saveResult,
    getResult,
    getAllResult,
    deleteResult
  };
}