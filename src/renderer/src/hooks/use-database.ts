import { useState, useCallback } from 'react'
import { useServiceStore } from '@renderer/store/useServiceStore'

type ItemType = 'song' | 'presentation' | 'service' | 'settings'

interface DatabaseItem {
  id: string
  type: ItemType
  [key: string]: string | ItemType
}

interface DatabaseResult<T> {
  loading: boolean
  error: string | null
  data: T | null
}

interface IUseDatabase {
  saveItem: (item: DatabaseItem) => Promise<string | null>
  getItem: (type: ItemType, id: string) => Promise<DatabaseItem | null>
  getAllItems: (type: ItemType) => Promise<DatabaseItem[] | null>
  deleteItem: (type: ItemType, id: string) => Promise<boolean>
  saveResult: DatabaseResult<string>
  getResult: DatabaseResult<DatabaseItem>
  getAllResult: DatabaseResult<DatabaseItem[]>
  deleteResult: DatabaseResult<boolean>
}

// Generic type for API responses
interface ApiResponse<T> {
  success: boolean
  data?: T
  id?: string
  error?: string
}

export function useDatabase(): IUseDatabase {
  const [saveResult, setSaveResult] = useState<DatabaseResult<string>>({
    loading: false,
    error: null,
    data: null
  })

  const [getResult, setGetResult] = useState<DatabaseResult<DatabaseItem>>({
    loading: false,
    error: null,
    data: null
  })

  const [getAllResult, setGetAllResult] = useState<DatabaseResult<DatabaseItem[]>>({
    loading: false,
    error: null,
    data: null
  })

  const [deleteResult, setDeleteResult] = useState<DatabaseResult<boolean>>({
    loading: false,
    error: null,
    data: null
  })

  // Helper function to handle API calls
  const executeDbOperation = async <T, R>(
    operation: string,
    params: Record<string, unknown>,
    setResult: React.Dispatch<React.SetStateAction<DatabaseResult<R>>>,
    transformResult?: (data: T) => R
  ): Promise<R | null> => {
    if (!window.electron) {
      setResult({
        loading: false,
        error: 'Electron not available',
        data: null
      })
      return null
    }

    setResult({
      loading: true,
      error: null,
      data: null
    })

    try {
      const result = (await window.electron.ipcRenderer.invoke(operation, params)) as ApiResponse<T>

      if (result.success) {
        const transformedData = transformResult
          ? transformResult(result.data as T)
          : ((result.id || result.data) as unknown as R)

        setResult({
          loading: false,
          error: null,
          data: transformedData
        })
        return transformedData
      } else {
        setResult({
          loading: false,
          error: result.error || 'Unknown error',
          data: null
        })
        return null
      }
    } catch (error) {
      setResult({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      })
      return null
    }
  }

  // Save an item to the database
  const saveItem = useCallback(async (item: DatabaseItem) => {
    const { invalidateCacheItem } = useServiceStore.getState()

    const result = await executeDbOperation<{ id: string }, string>(
      'db-save-item',
      { type: item.type, id: item.id, data: item },
      setSaveResult,
      (data) => data.id
    )

    // Invalidate the cache for this item to force a refresh
    if (result && (item.type === 'song' || item.type === 'presentation')) {
      invalidateCacheItem(item.type, item.id)
    }

    return result
  }, [])

  // Get a single item from the database
  const getItem = useCallback(async (type: ItemType, id: string) => {
    return executeDbOperation<DatabaseItem, DatabaseItem>(
      'db-get-item',
      { type, id },
      setGetResult,
      (data) => data
    )
  }, [])

  // Get all items of a specific type
  const getAllItems = useCallback(async (type: ItemType) => {
    return (
      executeDbOperation<DatabaseItem[], DatabaseItem[]>(
        'db-get-all-items',
        { type },
        setGetAllResult,
        (data) => data || []
      ) || []
    )
  }, [])

  // Delete an item from the database
  const deleteItem = useCallback(async (type: ItemType, id: string): Promise<boolean> => {
    const result = await executeDbOperation<boolean, boolean>(
      'db-delete-item',
      { type, id },
      setDeleteResult,
      () => true
    )
    return result !== null ? result : false
  }, [])

  return {
    saveItem,
    getItem,
    getAllItems,
    deleteItem,
    saveResult,
    getResult,
    getAllResult,
    deleteResult
  }
}
