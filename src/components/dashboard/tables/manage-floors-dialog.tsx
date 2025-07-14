
"use client"

import { useState } from "react"
import { PlusCircle, Trash2, Building } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useFloors } from "@/context/floor-context"

export function ManageFloorsDialog() {
  const { floors, addFloor, deleteFloor } = useFloors()
  const [newFloorName, setNewFloorName] = useState("")
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleAddFloor = () => {
    if (newFloorName.trim() === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Floor name cannot be empty.",
      })
      return
    }
    if (floors.includes(newFloorName.trim())) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This floor already exists.",
      })
      return
    }
    addFloor(newFloorName.trim())
    setNewFloorName("")
    toast({
      title: "Success",
      description: `Floor "${newFloorName.trim()}" has been added.`,
    })
  }

  const handleDeleteFloor = (floorNameToDelete: string) => {
    // We'll need to check if any tables are on this floor before deleting.
    // For now, we'll just delete it.
    deleteFloor(floorNameToDelete)
    toast({
      title: "Success",
      description: `Floor "${floorNameToDelete}" has been deleted.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Building className="h-4 w-4" />
          Manage Floors
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Floors</DialogTitle>
          <DialogDescription>
            Add or remove service areas from your establishment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Input
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
              placeholder="New floor name"
              onKeyDown={(e) => e.key === 'Enter' && handleAddFloor()}
            />
            <Button type="button" size="sm" onClick={handleAddFloor}>
              <PlusCircle className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Existing Floors</h4>
            <div className="max-h-60 overflow-y-auto space-y-2 rounded-md border p-2">
                {floors.length > 0 ? (
                    floors.map((floor) => (
                    <div
                        key={floor}
                        className="flex items-center justify-between rounded-md p-2 bg-muted/50"
                    >
                        <span>{floor}</span>
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDeleteFloor(floor)}
                        >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center p-4">No floors added yet.</p>
                )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
