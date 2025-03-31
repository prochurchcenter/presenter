import { useState, useEffect } from 'react';
import { PlusCircle, Music, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceItem } from '@/types/service';
import { useDatabase } from '@/hooks/use-database';
import CollectionDetail from '@/components/collection/collection-detail';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import CreateItemForm from '@/components/collection/create-item-form';
import { useToast } from '@/components/ui/use-toast';

export function Collection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('songs');
  const [collections, setCollections] = useState<ServiceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ServiceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { getAllItems, deleteItem, getAllResult } = useDatabase();
  const { toast } = useToast();

  useEffect(() => {
    loadCollections();
  }, [activeTab]);

  useEffect(() => {
    filterItems();
  }, [searchQuery, collections]);

  const loadCollections = async () => {
    const itemType = activeTab === 'songs' ? 'song' : 'presentation';
    const items = await getAllItems(itemType);
    setCollections(items || []);
  };

  const filterItems = () => {
    if (!searchQuery.trim()) {
      setFilteredItems(collections);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = collections.filter((item) => 
      item.title.toLowerCase().includes(query)
    );
    setFilteredItems(filtered);
  };

  const handleItemClick = (item: ServiceItem) => {
    setSelectedItem(item);
  };

  const handleDeleteItem = async (item: ServiceItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      await deleteItem(item.type as 'song' | 'presentation', item.id);
      await loadCollections();
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      }
      toast({ title: "Deleted", description: `${item.title} has been deleted.` });
    }
  };

  const handleCreateSuccess = () => {
    setIsAddDialogOpen(false);
    loadCollections();
    toast({ title: "Success", description: "Item created successfully." });
  };

  const handleUpdateSuccess = () => {
    loadCollections();
    toast({ title: "Success", description: "Item updated successfully." });
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Collection List Panel */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="flex items-center p-4 sticky top-0 bg-background z-10">
          <Input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CreateItemForm 
                type={activeTab === 'songs' ? 'song' : 'presentation'} 
                onSuccess={handleCreateSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="songs" className="flex-1">Songs</TabsTrigger>
              <TabsTrigger value="presentations" className="flex-1">Presentations</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="songs" className="mt-0">
            <div className="space-y-1 p-2">
              {getAllResult.loading ? (
                <div className="flex justify-center p-4">Loading songs...</div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => handleItemClick(item)}
                  >
                    <Music className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="truncate">{item.title}</div>
                  </Button>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  {searchQuery ? 'No matching songs found' : 'No songs found'}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="presentations" className="mt-0">
            <div className="space-y-1 p-2">
              {getAllResult.loading ? (
                <div className="flex justify-center p-4">Loading presentations...</div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => handleItemClick(item)}
                  >
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="truncate">{item.title}</div>
                  </Button>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  {searchQuery ? 'No matching presentations found' : 'No presentations found'}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail View */}
      <div className="flex-1 overflow-y-auto">
        {selectedItem ? (
          <CollectionDetail 
            item={selectedItem} 
            onDelete={() => handleDeleteItem(selectedItem)}
            onUpdate={handleUpdateSuccess}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <FileText className="h-16 w-16 mb-4 opacity-30" />
            <p>Select an item to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Collection;