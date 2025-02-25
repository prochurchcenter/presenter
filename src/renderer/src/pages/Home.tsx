import { Button } from "@renderer/components/ui/button"
import { Link } from "react-router-dom"

export function Home() {
    const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')


    return (
        <div>
            <h1 className="text-primary text-3xl font-bold mb-4">Home</h1>
            <Link to="/settings">   <Button onClick={ipcHandle}>Go to settings </Button></Link>

        </div>
    )
}