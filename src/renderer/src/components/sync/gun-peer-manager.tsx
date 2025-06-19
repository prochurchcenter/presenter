import { useState, useEffect } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert'

export function GunPeerManager() {
  const [peers, setPeers] = useState<string[]>([])
  const [newPeerUrl, setNewPeerUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [localIpAddress, setLocalIpAddress] = useState<string>('')

  // Get current IP address for sharing
  const getLocalIpAddress = async () => {
    try {
      const networkInterfaces = await window.electron.ipcRenderer.invoke('get-network-interfaces')
      // Find a suitable local network IP (usually starts with 192.168...)
      const localIp = networkInterfaces.find((ip: string) => ip.startsWith('192.168.'))
      if (localIp) {
        setLocalIpAddress(`http://${localIp}:8765/gun`)
      } else if (networkInterfaces.length > 0) {
        setLocalIpAddress(`http://${networkInterfaces[0]}:8765/gun`)
      }
    } catch (error) {
      console.error('Failed to get network interfaces:', error)
    }
  }

  // Load peers
  const loadPeers = async () => {
    try {
      const peerList = await window.api.gun.getPeers()
      setPeers(peerList)
    } catch (error) {
      console.error('Error loading peers:', error)
      setError('Failed to load peers')
    }
  }

  // Add a new peer
  const handleAddPeer = async () => {
    if (!newPeerUrl) {
      setError('Please enter a peer URL')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate URL format
      let peerUrlToAdd = newPeerUrl
      if (!peerUrlToAdd.startsWith('http://') && !peerUrlToAdd.startsWith('https://')) {
        peerUrlToAdd = `http://${peerUrlToAdd}`
      }
      if (!peerUrlToAdd.endsWith('/gun')) {
        peerUrlToAdd = peerUrlToAdd.endsWith('/') ? `${peerUrlToAdd}gun` : `${peerUrlToAdd}/gun`
      }

      const success = await window.api.gun.addPeer(peerUrlToAdd)
      
      if (success) {
        setSuccess(`Successfully connected to peer: ${peerUrlToAdd}`)
        setNewPeerUrl('')
        loadPeers() // Refresh the peer list
      } else {
        setError(`Failed to connect to peer: ${peerUrlToAdd}`)
      }
    } catch (error) {
      console.error('Error adding peer:', error)
      setError('Failed to add peer')
    } finally {
      setIsLoading(false)
    }
  }

  // Load peers on component mount
  useEffect(() => {
    loadPeers()
    getLocalIpAddress()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Database Sync</CardTitle>
        <CardDescription>
          Connect to another instance of this application on your local network for database synchronization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Connection status */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Your Connection Address</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Share this address with other instances to connect to this app:
          </p>
          <code className="px-2 py-1 bg-muted rounded">{localIpAddress || 'Detecting IP address...'}</code>
        </div>

        {/* Connected peers */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Connected Peers</h3>
          {peers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No peers connected</p>
          ) : (
            <ul className="space-y-2">
              {peers.map((peer, index) => (
                <li 
                  key={index} 
                  className="flex items-center justify-between p-2 rounded bg-muted"
                >
                  <span className="text-sm">{peer}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add new peer */}
        <div className="space-y-2">
          <Label htmlFor="peer-url">Add New Peer</Label>
          <div className="flex gap-2">
            <Input
              id="peer-url"
              placeholder="http://192.168.1.xxx:8765/gun"
              value={newPeerUrl}
              onChange={(e) => setNewPeerUrl(e.target.value)}
            />
            <Button onClick={handleAddPeer} disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the IP address of another instance running on your network
          </p>
        </div>

        {/* Error/success messages */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mt-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}