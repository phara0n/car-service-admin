import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCustomers, removeCustomer } from '../../store/slices/customerSlice';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Car, 
  FilterX, 
  MapPin,
  Trash2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import CustomerCarsModal from './CustomerCarsModal';
import DeleteConfirmation from '../ui/delete-confirmation';
import { toast } from 'react-toastify';

const CustomersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { customers, loading, error } = useAppSelector(state => state.customers);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [carsModalOpen, setCarsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: number; name: string } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);
  
  // Function to handle opening the cars modal
  const handleOpenCarsModal = (customerId: number, customerName: string) => {
    setSelectedCustomer({ id: customerId, name: customerName });
    setCarsModalOpen(true);
  };
  
  // Function to handle deleting a customer
  const handleDeleteCustomer = (customerId: number, customerName: string) => {
    setCustomerToDelete({ id: customerId, name: customerName });
    setDeleteConfirmOpen(true);
  };
  
  // Function to confirm deletion
  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(removeCustomer(customerToDelete.id)).unwrap();
      toast.success(`${customerToDelete.name} has been deleted successfully.`);
      setDeleteConfirmOpen(false);
    } catch (error) {
      toast.error(`Failed to delete customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Filter and search customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      searchTerm === '' || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesRegion = 
      filterRegion === 'all' || 
      (customer.region_code && customer.region_code.toLowerCase() === filterRegion.toLowerCase());
    
    return matchesSearch && matchesRegion;
  });
  
  // Sort customers: name alphabetically
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
  
  // Get unique region codes for filter dropdown
  const uniqueRegions = Array.from(
    new Set(
      customers
        .filter(c => c.region_code)
        .map(c => c.region_code)
    )
  ).filter(Boolean) as string[];
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleRegionFilterChange = (value: string) => {
    setFilterRegion(value);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRegion('all');
  };
  
  if (loading && customers.length === 0) {
    return <div className="flex items-center justify-center h-40">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      <span className="ml-3 text-muted-foreground">Loading customers...</span>
    </div>;
  }
  
  if (error) {
    return <div className="p-6 text-center text-destructive">Error loading customers: {error}</div>;
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="dashboard-section-title">Customers</h1>
        <Button asChild>
          <Link to="/customers/add" className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add New Customer</span>
          </Link>
        </Button>
      </div>
      
      <Card className="dashboard-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
          <div className="md:col-span-7 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              className="pl-10"
              placeholder="Search by name, email or phone"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          {uniqueRegions.length > 0 && (
            <div className="md:col-span-4">
              <Select value={filterRegion} onValueChange={handleRegionFilterChange}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-muted-foreground" />
                    <SelectValue placeholder="All Regions" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {uniqueRegions.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {(searchTerm || filterRegion !== 'all') && (
            <div className="md:col-span-1 flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClearFilters}
                aria-label="Clear filters"
              >
                <FilterX size={18} />
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {sortedCustomers.length === 0 ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">No customers found matching your criteria.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-card">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</th>
                  {uniqueRegions.length > 0 && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tunisia Info</th>
                  )}
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {sortedCustomers.map((customer) => (
                  <tr key={customer.id} className="bg-card hover:bg-accent/5 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {customer.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {customer.id}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{customer.email}</div>
                      <div className="text-sm">{customer.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm line-clamp-2">{customer.address}</div>
                    </td>
                    {uniqueRegions.length > 0 && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {customer.national_id && (
                          <div className="text-sm">
                            <span className="font-medium">National ID:</span> {customer.national_id}
                          </div>
                        )}
                        {customer.region_code && (
                          <div className="text-sm">
                            <span className="font-medium">Region:</span> {customer.region_code}
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <Button variant="outline" size="sm" asChild className="h-8">
                          <Link to={`/customers/${customer.id}`} className="flex items-center gap-1">
                            <Eye size={14} />
                            <span>View</span>
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="h-8">
                          <Link to={`/customers/${customer.id}/edit`} className="flex items-center gap-1">
                            <Edit size={14} />
                            <span>Edit</span>
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="h-8">
                          <Link to={`/cars?customer=${customer.id}`} className="flex items-center gap-1" onClick={(e) => { e.preventDefault(); handleOpenCarsModal(customer.id, customer.name); }}>
                            <Car size={14} />
                            <span>Cars</span>
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 flex items-center gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="text-sm text-muted-foreground">
        Showing {sortedCustomers.length} of {customers.length} customers
      </div>
      
      {/* Customer Cars Modal */}
      {selectedCustomer && (
        <CustomerCarsModal
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          open={carsModalOpen}
          onOpenChange={setCarsModalOpen}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <DeleteConfirmation
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={confirmDeleteCustomer}
          title="Delete Customer"
          description="Are you sure you want to delete this customer? This action cannot be undone and will also delete all cars associated with this customer."
          isLoading={isDeleting}
          itemName={customerToDelete.name}
        />
      )}
    </div>
  );
};

export default CustomersList; 