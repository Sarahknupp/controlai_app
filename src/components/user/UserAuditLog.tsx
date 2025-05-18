import React, { useEffect, useState } from 'react';
import { mockUserAuditLogs, mockUserAccounts } from '../../data/mockUserManagement';
import { UserAuditLog as UserAuditLogType } from '../../types/userManagement';
import { RefreshCw, User, CheckCircle, XCircle, Edit, Lock, Key, LogIn, LogOut, AlertTriangle, Trash2, UserPlus } from 'lucide-react';

interface UserAuditLogProps {
  userId: string;
}

export const UserAuditLog: React.FC<UserAuditLogProps> = ({ userId }) => {
  const [logs, setLogs] = useState<UserAuditLogType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<string>('');
  
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get logs for this user
        const userLogs = mockUserAuditLogs.filter(log => log.userId === userId);
        
        // Sort by newest first
        userLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setLogs(userLogs);
        
        // Get user info
        const userInfo = mockUserAccounts.find(u => u.id === userId);
        if (userInfo) {
          setUser(userInfo.username);
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLogs();
  }, [userId]);
  
  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };
  
  const getActionIcon = (action: UserAuditLogType['action']) => {
    switch (action) {
      case 'login':
        return <LogIn className="h-5 w-5 text-green-500" />;
      case 'logout':
        return <LogOut className="h-5 w-5 text-blue-500" />;
      case 'create':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'update':
        return <Edit className="h-5 w-5 text-amber-500" />;
      case 'delete':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      case 'password_change':
        return <Key className="h-5 w-5 text-purple-500" />;
      case 'role_change':
        return <User className="h-5 w-5 text-indigo-500" />;
      case 'status_change':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Lock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getActionText = (action: UserAuditLogType['action']): string => {
    switch (action) {
      case 'login':
        return 'Logged in';
      case 'logout':
        return 'Logged out';
      case 'create':
        return 'Account created';
      case 'update':
        return 'Account updated';
      case 'delete':
        return 'Account deleted';
      case 'password_change':
        return 'Password changed';
      case 'role_change':
        return 'Role changed';
      case 'status_change':
        return 'Status changed';
      default:
        return action.replace('_', ' ');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Audit Log for {user}</h3>
      </div>
      
      {logs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <Lock className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">No activity logs found for this user.</p>
        </div>
      ) : (
        <div className="relative border rounded-md divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {logs.map((log) => {
            const performedByUser = mockUserAccounts.find(u => u.id === log.performedBy);
            
            return (
              <div key={log.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {getActionText(log.action)}
                    </div>
                    {log.details && (
                      <div className="mt-1 text-sm text-gray-500">{log.details}</div>
                    )}
                    <div className="mt-2 text-xs text-gray-500 flex flex-wrap items-center gap-x-3">
                      <span>{formatDateTime(log.timestamp)}</span>
                      {performedByUser && (
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {performedByUser.username}
                        </span>
                      )}
                      {log.ipAddress && (
                        <span>IP: {log.ipAddress}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};