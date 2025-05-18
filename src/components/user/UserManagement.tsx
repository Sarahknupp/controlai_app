import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Users, RefreshCw, MoreHorizontal, Edit, Trash2, Clock, Mail, CheckCircle, XCircle } from 'lucide-react';
import { mockUserAccounts, mockUserRoles, mockUserAuditLogs, createAuditLog } from '../../data/mockUserManagement';
import { UserAccount, UserFilter, BulkAction } from '../../types/userManagement';
import { UserForm } from './UserForm';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import useAuth from '../../hooks/useAuth';
import { UserAuditLog } from './UserAuditLog';
import toast from 'react-hot-toast';

export const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [selectedUserForLogs, setSelectedUserForLogs] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [filter, setFilter] = useState<UserFilter>({
    search: '',
    role: '',
    status: 'all',
    sortBy: 'username',
    sortDirection: 'asc'
  });
  
  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(mockUserAccounts);
      setIsLoading(false);
    };
    
    loadData();
  }, [refreshKey]);
  
  // Filter and sort users
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        user => 
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.fullName.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply role filter
    if (filter.role) {
      result = result.filter(user => user.roleId === filter.role);
    }
    
    // Apply status filter
    if (filter.status !== 'all') {
      result = result.filter(user => 
        filter.status === 'active' ? user.isActive : !user.isActive
      );
    }
    
    // Apply sorting
    if (filter.sortBy) {
      result.sort((a, b) => {
        let valA = a[filter.sortBy as keyof UserAccount];
        let valB = b[filter.sortBy as keyof UserAccount];
        
        // Handle dates
        if (valA instanceof Date && valB instanceof Date) {
          valA = valA.getTime();
          valB = valB.getTime();
        }
        
        // Handle nullish values
        if (valA === null || valA === undefined) return filter.sortDirection === 'asc' ? -1 : 1;
        if (valB === null || valB === undefined) return filter.sortDirection === 'asc' ? 1 : -1;
        
        // Normal comparison
        if (typeof valA === 'string' && typeof valB === 'string') {
          return filter.sortDirection === 'asc' 
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        
        // Numeric comparison
        return filter.sortDirection === 'asc' 
          ? Number(valA) - Number(valB)
          : Number(valB) - Number(valA);
      });
    }
    
    setFilteredUsers(result);
  }, [users, filter]);
  
  const handleFilterChange = (name: keyof UserFilter, value: any) => {
    setFilter(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSort = (field: NonNullable<UserFilter['sortBy']>) => {
    setFilter(prev => ({
      ...prev,
      sortBy: field,
      sortDirection: prev.sortBy === field && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };
  
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };
  
  const handleBulkAction = async (action: BulkAction['action']) => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected');
      return;
    }
    
    try {
      // In a real app, this would be an API call
      // Simulate API call delay
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update users in state
      let updatedUsers = [...users];
      
      switch(action) {
        case 'activate':
          updatedUsers = updatedUsers.map(user => 
            selectedUsers.includes(user.id) ? { ...user, isActive: true } : user
          );
          toast.success(`${selectedUsers.length} user(s) activated successfully`);
          break;
        case 'deactivate':
          updatedUsers = updatedUsers.map(user => 
            selectedUsers.includes(user.id) ? { ...user, isActive: false } : user
          );
          toast.success(`${selectedUsers.length} user(s) deactivated successfully`);
          break;
        case 'delete':
          // Log deletion in audit trail
          selectedUsers.forEach(userId => {
            createAuditLog(
              userId,
              'delete',
              user?.id || '',
              `User deleted through bulk action`
            );
          });
          
          updatedUsers = updatedUsers.filter(user => !selectedUsers.includes(user.id));
          toast.success(`${selectedUsers.length} user(s) deleted successfully`);
          break;
        default:
          throw new Error('Invalid action');
      }
      
      setUsers(updatedUsers);
      setSelectedUsers([]);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!editingUser) return;
    
    try {
      // In a real app, this would be an API call
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create audit log
      createAuditLog(
        editingUser.id,
        'delete',
        user?.id || '',
        `User deleted by ${user?.name || 'system'}`
      );
      
      // Update users state
      setUsers(users.filter(u => u.id !== editingUser.id));
      setShowDeleteConfirm(false);
      setEditingUser(null);
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleViewAuditLogs = (userId: string) => {
    setSelectedUserForLogs(userId);
    setShowAuditLogs(true);
  };
  
  // Format date
  const formatDate = (date?: Date): string => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Users className="mr-2 h-6 w-6 text-amber-600" />
          User Management
        </h1>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddUser(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add User
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="Search by name, username, or email"
                value={filter.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                value={filter.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <option value="">All Roles</option>
                {mockUserRoles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                value={filter.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value as 'active' | 'inactive' | 'all')}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-amber-50 p-3 border-b border-amber-100 flex justify-between items-center">
            <span className="text-amber-800 text-sm font-medium">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleBulkAction('activate')}
                variant="outline"
                size="sm"
                className="border-green-500 text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Activate
              </Button>
              <Button
                onClick={() => handleBulkAction('deactivate')}
                variant="outline"
                size="sm"
                className="border-amber-500 text-amber-700 hover:bg-amber-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Deactivate
              </Button>
              <Button
                onClick={() => handleBulkAction('delete')}
                variant="outline"
                size="sm"
                className="border-red-500 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8 px-4">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
              <span className="mt-2 text-sm text-gray-500">Loading users...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                      onChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('username')}
                  >
                    Username
                    {filter.sortBy === 'username' && (
                      <span className="ml-1">{filter.sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('fullName')}
                  >
                    Full Name
                    {filter.sortBy === 'fullName' && (
                      <span className="ml-1">{filter.sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    {filter.sortBy === 'email' && (
                      <span className="ml-1">{filter.sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('roleName')}
                  >
                    Role
                    {filter.sortBy === 'roleName' && (
                      <span className="ml-1">{filter.sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('lastLogin')}
                  >
                    Last Login
                    {filter.sortBy === 'lastLogin' && (
                      <span className="ml-1">{filter.sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('isActive')}
                  >
                    Status
                    {filter.sortBy === 'isActive' && (
                      <span className="ml-1">{filter.sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-gray-500" />
                        <a href={`mailto:${user.email}`} className="text-blue-600 hover:text-blue-800">
                          {user.email}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {user.roleName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(user.lastLogin)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowAddUser(true);
                          }}
                          className="text-amber-600 hover:text-amber-800"
                          title="Edit User"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleViewAuditLogs(user.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Audit Logs"
                        >
                          <Clock className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Delete User"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredUsers.length === 0 && (
              <div className="py-8 px-4 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter to find what you&apos;re looking for.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add/Edit User Dialog */}
      {showAddUser && (
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            </DialogHeader>
            
            <UserForm 
              user={editingUser}
              onSubmit={(userData: Partial<UserAccount>) => {
                // In a real app, this would be an API call
                if (editingUser) {
                  // Update existing user
                  setUsers(users.map(u => 
                    u.id === userData.id ? { ...u, ...userData } as UserAccount : u
                  ));
                  createAuditLog(
                    userData.id || '',
                    'update',
                    user?.id || '',
                    `User updated by ${user?.name || 'system'}`
                  );
                  toast.success('User updated successfully');
                } else {
                  // Add new user
                  const newUser: UserAccount = {
                    ...userData as UserAccount,
                    id: `user-${Date.now()}`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: user?.id || '',
                    failedLoginAttempts: 0,
                    requirePasswordChange: true,
                  };
                  setUsers([...users, newUser]);
                  createAuditLog(
                    newUser.id,
                    'create',
                    user?.id || '',
                    `User created by ${user?.name || 'system'}`
                  );
                  toast.success('User created successfully');
                }
                setShowAddUser(false);
                setEditingUser(null);
              }}
              onCancel={() => {
                setShowAddUser(false);
                setEditingUser(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete user <span className="font-medium text-gray-900">{editingUser?.username}</span>? This action cannot be undone.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
              onClick={handleDeleteUser}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Audit Logs Dialog */}
      <Dialog open={showAuditLogs} onOpenChange={setShowAuditLogs}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>User Activity Logs</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {selectedUserForLogs && (
              <UserAuditLog userId={selectedUserForLogs} />
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowAuditLogs(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};