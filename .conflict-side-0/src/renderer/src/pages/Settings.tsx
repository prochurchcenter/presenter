
import { GunPeerManager } from '@renderer/components/sync/gun-peer-manager'

export function Settings() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-primary text-3xl font-bold mb-6">Settings</h1>
            
            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-4">Database Synchronization</h2>
                    <GunPeerManager />
                </section>
                
                {/* Other settings sections can be added here */}
            </div>
        </div>
    )
}