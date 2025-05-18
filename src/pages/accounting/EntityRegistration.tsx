import React, { useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Plus, Edit, Trash } from 'lucide-react';

const EntityRegistration: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [entities, setEntities] = useState([
    { id: 1, name: 'Supplier A', type: 'Supplier', document: '12.345.678/0001-90', contact: 'contact@suppliera.com' },
    { id: 2, name: 'Client B', type: 'Client', document: '98.765.432/0001-10', contact: 'info@clientb.com' },
    { id: 3, name: 'Partner C', type: 'Partner', document: '45.678.901/0001-23', contact: 'support@partnerc.com' },
  ]);
  const [currentEntity, setCurrentEntity] = useState({ id: 0, name: '', type: '', document: '', contact: '' });
  
  const handleOpenDialog = (entity = { id: 0, name: '', type: '', document: '', contact: '' }) => {
    setCurrentEntity(entity);
    setIsDialogOpen(true);
  };

  const handleSaveEntity = () => {
    if (currentEntity.id === 0) {
      // Add new entity
      setEntities([...entities, { ...currentEntity, id: Date.now() }]);
    } else {
      // Update existing entity
      setEntities(entities.map(entity => 
        entity.id === currentEntity.id ? currentEntity : entity
      ));
    }
    setIsDialogOpen(false);
  };

  const handleDeleteEntity = (id: number) => {
    setEntities(entities.filter(entity => entity.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Entity Registration</h1>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Entity
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entities.map((entity) => (
              <TableRow key={entity.id}>
                <TableCell className="font-medium">{entity.name}</TableCell>
                <TableCell>{entity.type}</TableCell>
                <TableCell>{entity.document}</TableCell>
                <TableCell>{entity.contact}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(entity)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteEntity(entity.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentEntity.id === 0 ? 'Add New Entity' : 'Edit Entity'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={currentEntity.name}
                onChange={(e) => setCurrentEntity({...currentEntity, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Input
                id="type"
                value={currentEntity.type}
                onChange={(e) => setCurrentEntity({...currentEntity, type: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document" className="text-right">Document</Label>
              <Input
                id="document"
                value={currentEntity.document}
                onChange={(e) => setCurrentEntity({...currentEntity, document: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-right">Contact</Label>
              <Input
                id="contact"
                value={currentEntity.contact}
                onChange={(e) => setCurrentEntity({...currentEntity, contact: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEntity}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default EntityRegistration;
