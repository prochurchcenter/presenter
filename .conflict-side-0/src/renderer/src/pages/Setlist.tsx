import { useState, useEffect } from 'react';
import { CalendarIcon, Plus, Music, FileText, Trash2, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Service, ServiceItem, ServiceItemReference, PreviewSettings } from '@/types/service';
import { useDatabase } from '@/hooks/use-database';
import PreviewSettingsForm from '@/components/preview/preview-settings-form';
import { v4 as uuidv4 } from 'uuid';

export function Setlist() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showNewServiceDialog, setShowNewServiceDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<{songs: ServiceItem[], presentations: ServiceItem[]}>({
    songs: [],
    presentations: []
  });
  
  const { getAllItems, saveItem, deleteItem } = useDatabase();
  const { toast } = useToast();

  useEffect(() => {
    loadServices();
    loadCollections();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const servicesData = await getAllItems('service');
      if (servicesData && Array.isArray(servicesData)) {
        setServices(servicesData);
        if (servicesData.length > 0 && !selectedService) {
          setSelectedService(servicesData[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load services:', error);
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const [songs, presentations] = await Promise.all([
        getAllItems('song'),
        getAllItems('presentation')
      ]);
      
      setCollections({
        songs: songs || [],
        presentations: presentations || []
      });
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const handleCreateService = async (name: string, date: Date) => {
    const newService: Service = {
      id: uuidv4(),
      name,
      date: format(date, 'yyyy-MM-dd'),
      items: []
    };

    try {
      await saveItem({
        type: 'service',
        ...newService
      });
      
      setServices([...services, newService]);
      setSelectedService(newService);
      setShowNewServiceDialog(false);
      
      toast({
        title: 'Success',
        description: 'Service created successfully'
      });
    } catch (error) {
      console.error('Failed to create service:', error);
      toast({
        title: 'Error',
        description: 'Failed to create service',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await deleteItem('service', serviceId);
      
      const updatedServices = services.filter(service => service.id !== serviceId);
      setServices(updatedServices);
      
      if (selectedService?.id === serviceId) {
        setSelectedService(updatedServices.length > 0 ? updatedServices[0] : null);
      }
      
      toast({
        title: 'Success',
        description: 'Service deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive'
      });
    }
  };

  const handleAddItemToService = async (item: ServiceItem) => {
    if (!selectedService) return;
    
    try {
      const updatedService = {
        ...selectedService,
        items: [...selectedService.items, item]
      };
      
      await saveItem({
        type: 'service',
        ...updatedService
      });
      
      setSelectedService(updatedService);
      
      // Update services list
      setServices(services.map(service => 
        service.id === updatedService.id ? updatedService : service
      ));
      
      setShowAddItemDialog(false);
      
      toast({
        title: 'Success',
        description: `${item.title} added to service`
      });
    } catch (error) {
      console.error('Failed to add item to service:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to service',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveItem = async (itemIndex: number) => {
    if (!selectedService) return;
    
    try {
      const updatedItems = [...selectedService.items];
      updatedItems.splice(itemIndex, 1);
      
      const updatedService = {
        ...selectedService,
        items: updatedItems
      };
      
      await saveItem({
        type: 'service',
        ...updatedService
      });
      
      setSelectedService(updatedService);
      
      // Update services list
      setServices(services.map(service => 
        service.id === updatedService.id ? updatedService : service
      ));
      
      toast({
        title: 'Success',
        description: 'Item removed from service'
      });
    } catch (error) {
      console.error('Failed to remove item from service:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive'
      });
    }
  };

  const handleMoveItem = async (itemIndex: number, direction: 'up' | 'down') => {
    if (!selectedService) return;
    
    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (newIndex < 0 || newIndex >= selectedService.items.length) return;
    
    try {
      const updatedItems = [...selectedService.items];
      const [removed] = updatedItems.splice(itemIndex, 1);
      updatedItems.splice(newIndex, 0, removed);
      
      const updatedService = {
        ...selectedService,
        items: updatedItems
      };
      
      await saveItem({
        type: 'service',
        ...updatedService
      });
      
      setSelectedService(updatedService);
      
      // Update services list
      setServices(services.map(service => 
        service.id === updatedService.id ? updatedService : service
      ));
    } catch (error) {
      console.error('Failed to move item:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder items',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Setlists</h1>
        <Dialog open={showNewServiceDialog} onOpenChange={setShowNewServiceDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <NewServiceForm onSubmit={handleCreateService} onCancel={() => setShowNewServiceDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Services List */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>Select a service to manage</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              {isLoading ? (
                <div className="flex justify-center p-4">Loading services...</div>
              ) : services && services.length > 0 ? (
                <div className="space-y-1">
                  {services.map(service => (
                    <ServiceListItem 
                      key={service.id}
                      service={service}
                      isSelected={selectedService?.id === service.id}
                      onSelect={() => setSelectedService(service)}
                      onDelete={() => handleDeleteService(service.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  No services found
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Service Details */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          {selectedService ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedService.name}</CardTitle>
                    <CardDescription>
                      {selectedService.date}
                    </CardDescription>
                  </div>
                  <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <AddItemForm 
                        collections={collections}
                        onAddItem={handleAddItemToService}
                        onCancel={() => setShowAddItemDialog(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {selectedService.items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedService.items.map((item, index) => (
                      <SetlistItem 
                        key={`${item.id}-${index}`}
                        item={item}
                        index={index}
                        isFirst={index === 0}
                        isLast={index === selectedService.items.length - 1}
                        onRemove={() => handleRemoveItem(index)}
                        onMoveUp={() => handleMoveItem(index, 'up')}
                        onMoveDown={() => handleMoveItem(index, 'down')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 border rounded-md text-muted-foreground">
                    No items in this service. Click "Add Item" to add songs or presentations.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 border rounded-md text-muted-foreground">
              <p className="mb-4">Select a service or create a new one to get started</p>
              <Button variant="outline" onClick={() => setShowNewServiceDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Service
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface NewServiceFormProps {
  onSubmit: (name: string, date: Date) => void;
  onCancel: () => void;
}

function NewServiceForm({ onSubmit, onCancel }: NewServiceFormProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name, date);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Create New Service</DialogTitle>
        <DialogDescription>
          Add a new service with a name and date.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Service Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sunday Morning Service"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          Create Service
        </Button>
      </DialogFooter>
    </form>
  );
}

interface ServiceListItemProps {
  service: Service;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function ServiceListItem({ service, isSelected, onSelect, onDelete }: ServiceListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 rounded-md cursor-pointer",
        isSelected ? "bg-muted" : "hover:bg-muted/50"
      )}
      onClick={onSelect}
    >
      <div className="flex flex-col">
        <span className="font-medium">{service.name}</span>
        <span className="text-xs text-muted-foreground">{service.date}</span>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(); }}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface SetlistItemProps {
  item: ServiceItem | ServiceItemReference;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SetlistItem({ item, index, isFirst, isLast, onRemove, onMoveUp, onMoveDown }: SetlistItemProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
          {index + 1}
        </div>
        
        {item.type === 'song' ? (
          <Music className="h-5 w-5 text-blue-500" />
        ) : (
          <FileText className="h-5 w-5 text-amber-500" />
        )}
        
        <div>
          <div className="font-medium">{'title' in item ? item.title : `${item.type} item`}</div>
          <div className="text-xs text-muted-foreground">{item.type}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isFirst}
          onClick={onMoveUp}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isLast}
          onClick={onMoveDown}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface AddItemFormProps {
  collections: {
    songs: ServiceItem[];
    presentations: ServiceItem[];
  };
  onAddItem: (item: ServiceItem) => void;
  onCancel: () => void;
}

function AddItemForm({ collections, onAddItem, onCancel }: AddItemFormProps) {
  const [activeTab, setActiveTab] = useState<'songs' | 'presentations'>('songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(null);
  const [previewSettings, setPreviewSettings] = useState<PreviewSettings | null>(null);
  const [formStep, setFormStep] = useState<'select' | 'preview'>('select');
  
  const filteredItems = (activeTab === 'songs' ? collections.songs : collections.presentations)
    .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const handleSelectItem = (item: ServiceItem) => {
    setSelectedItem(item);
    setPreviewSettings(item.previewSettings);
    setFormStep('preview');
  };
  
  const handleAddItemWithSettings = () => {
    if (!selectedItem || !previewSettings) return;
    
    const itemWithNewSettings = {
      ...selectedItem,
      previewSettings: previewSettings
    };
    
    onAddItem(itemWithNewSettings);
  };
  
  return (
    <div>
      <DialogHeader>
        <DialogTitle>Add Item to Service</DialogTitle>
        <DialogDescription>
          {formStep === 'select' 
            ? 'Select songs or presentations to add to your service.' 
            : 'Customize preview settings for this item.'}
        </DialogDescription>
      </DialogHeader>
      
      {formStep === 'select' ? (
        <div className="py-4">
          <div className="flex border-b mb-4">
            <button
              className={cn(
                "px-4 py-2 font-medium text-sm",
                activeTab === 'songs' ? "border-b-2 border-primary" : "text-muted-foreground"
              )}
              onClick={() => setActiveTab('songs')}
            >
              Songs
            </button>
            <button
              className={cn(
                "px-4 py-2 font-medium text-sm",
                activeTab === 'presentations' ? "border-b-2 border-primary" : "text-muted-foreground"
              )}
              onClick={() => setActiveTab('presentations')}
            >
              Presentations
            </button>
          </div>
          
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          
          <div className="h-[300px] overflow-y-auto border rounded-md p-2">
            {filteredItems.length > 0 ? (
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="flex items-center gap-3">
                      {item.type === 'song' ? (
                        <Music className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-amber-500" />
                      )}
                      <span>{item.title}</span>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No items found
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-4">
          {selectedItem && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                {selectedItem.type === 'song' ? (
                  <Music className="h-5 w-5 text-blue-500" />
                ) : (
                  <FileText className="h-5 w-5 text-amber-500" />
                )}
                <span className="font-medium">{selectedItem.title}</span>
              </div>
              
              <div className="border-t pt-4 mt-2">
                <h3 className="text-sm font-medium mb-4">Preview Settings</h3>
                {previewSettings && (
                  <PreviewSettingsForm 
                    initialSettings={previewSettings}
                    onChange={setPreviewSettings}
                    compact={true}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      <DialogFooter>
        {formStep === 'preview' ? (
          <div className="flex justify-between w-full">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setFormStep('select')}
            >
              Back
            </Button>
            <div className="space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleAddItemWithSettings}
              >
                Add to Service
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </DialogFooter>
    </div>
  );
}

export default Setlist;