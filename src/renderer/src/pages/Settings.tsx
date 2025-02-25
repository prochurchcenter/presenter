import { Button } from "@renderer/components/ui/button"
import { Link } from "react-router-dom"

export function Settings() {
    return (
        <div>
            <h1 className="text-primary text-3xl font-bold mb-4">Settings</h1>
            <Link to="/">   <Button>Go to Home </Button></Link>
        </div>
    )
}