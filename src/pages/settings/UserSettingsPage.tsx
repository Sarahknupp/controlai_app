import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Lock, Bell, Shield, ArrowLeft, Key, UserCog, Cog, Bell as BellIcon } from 'lucide-react';
import { PasswordChangeForm } from '../../components/user/PasswordChangeForm';
import { Button } from '../../components/ui/button';
import { UserManagement } from '../../components/user/UserManagement';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const UserSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'password' | 'users' | 'security' | 'notifications'>('password');
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    requireStrongPasswords: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    loginAlerts: true,
    securityAlerts: true,
    systemUpdates: false,
  });
  
  const userHasManagementPermission = user?.role === 'admin' || user?.role === 'manager';
  
  const handleSecuritySettingChange = (name: string, value: boolean | number) => {
    setSecuritySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationSettingChange = (name: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveSecuritySettings = () => {
    // In a real app, this would be an API call
    toast.success('Security settings saved successfully');
  };
  
  const handleSaveNotificationSettings = () => {
    // In a real app, this would be an API call
    toast.success('Notification preferences saved successfully');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <h1 className="text-2xl font-semibold text-gray-900">
            User Settings
          </h1>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('password')}
              className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-center items-center">
                <Key className="h-4 w-4 mr-2" />
                <span>Change Password</span>
              </div>
            </button>
            
            {userHasManagementPermission && (
              <button
                onClick={() => setActiveTab('users')}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-center items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>User Management</span>
                </div>
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('security')}
              className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-center items-center">
                <Shield className="h-4 w-4 mr-2" />
                <span>Security Settings</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-center items-center">
                <Bell className="h-4 w-4 mr-2" />
                <span>Notifications</span>
              </div>
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'password' && (
            <div>
              <div className="max-w-xl mx-auto">
                <PasswordChangeForm 
                  onSuccess={() => {
                    toast.success('Password changed successfully!');
                  }}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'users' && userHasManagementPermission && (
            <UserManagement />
          )}
          
          {activeTab === 'security' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex items-center">
                  <Shield className="h-5 w-5 text-amber-600 mr-2" />
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Security Settings</h3>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Two-Factor Authentication</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Two-factor authentication adds an extra layer of security to your account.
                            </p>
                          </div>
                          <div className="relative inline-block w-12 h-6 ml-4">
                            <input
                              type="checkbox"
                              id="twoFactorEnabled"
                              className="opacity-0 w-0 h-0"
                              checked={securitySettings.twoFactorEnabled}
                              onChange={(e) => handleSecuritySettingChange('twoFactorEnabled', e.target.checked)}
                            />
                            <label
                              htmlFor="twoFactorEnabled"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ease-in-out ${
                                securitySettings.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                                  securitySettings.twoFactorEnabled ? 'transform translate-x-6' : ''
                                }`}
                              ></span>
                            </label>
                          </div>
                        </div>
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Strong Password Policy</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {securitySettings.requireStrongPasswords ? 'Required' : 'Not Required'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Enforce complex password requirements for all users.
                            </p>
                          </div>
                          <div className="relative inline-block w-12 h-6 ml-4">
                            <input
                              type="checkbox"
                              id="requireStrongPasswords"
                              className="opacity-0 w-0 h-0"
                              checked={securitySettings.requireStrongPasswords}
                              onChange={(e) => handleSecuritySettingChange('requireStrongPasswords', e.target.checked)}
                            />
                            <label
                              htmlFor="requireStrongPasswords"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ease-in-out ${
                                securitySettings.requireStrongPasswords ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                                  securitySettings.requireStrongPasswords ? 'transform translate-x-6' : ''
                                }`}
                              ></span>
                            </label>
                          </div>
                        </div>
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Maximum Login Attempts</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="flex items-center">
                          <select
                            id="maxLoginAttempts"
                            name="maxLoginAttempts"
                            className="block max-w-lg w-full shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm border-gray-300 rounded-md"
                            value={securitySettings.maxLoginAttempts}
                            onChange={(e) => handleSecuritySettingChange('maxLoginAttempts', parseInt(e.target.value))}
                          >
                            <option value="3">3 attempts</option>
                            <option value="5">5 attempts</option>
                            <option value="10">10 attempts</option>
                          </select>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Number of failed login attempts before account is temporarily locked.
                        </p>
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Session Timeout</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="flex items-center">
                          <select
                            id="sessionTimeout"
                            name="sessionTimeout"
                            className="block max-w-lg w-full shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm border-gray-300 rounded-md"
                            value={securitySettings.sessionTimeout}
                            onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
                          >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">60 minutes</option>
                            <option value="120">2 hours</option>
                          </select>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Automatically log out after this period of inactivity.
                        </p>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <Button
                    onClick={handleSaveSecuritySettings}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Save Security Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex items-center">
                  <BellIcon className="h-5 w-5 text-amber-600 mr-2" />
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Notification Preferences</h3>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Email Notifications</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {notificationSettings.emailNotifications ? 'Enabled' : 'Disabled'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Receive system notifications via email.
                            </p>
                          </div>
                          <div className="relative inline-block w-12 h-6 ml-4">
                            <input
                              type="checkbox"
                              id="emailNotifications"
                              className="opacity-0 w-0 h-0"
                              checked={notificationSettings.emailNotifications}
                              onChange={(e) => handleNotificationSettingChange('emailNotifications', e.target.checked)}
                            />
                            <label
                              htmlFor="emailNotifications"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ease-in-out ${
                                notificationSettings.emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                                  notificationSettings.emailNotifications ? 'transform translate-x-6' : ''
                                }`}
                              ></span>
                            </label>
                          </div>
                        </div>
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Login Alerts</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {notificationSettings.loginAlerts ? 'Enabled' : 'Disabled'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Get alerts when your account is accessed from a new device.
                            </p>
                          </div>
                          <div className="relative inline-block w-12 h-6 ml-4">
                            <input
                              type="checkbox"
                              id="loginAlerts"
                              className="opacity-0 w-0 h-0"
                              checked={notificationSettings.loginAlerts}
                              onChange={(e) => handleNotificationSettingChange('loginAlerts', e.target.checked)}
                            />
                            <label
                              htmlFor="loginAlerts"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ease-in-out ${
                                notificationSettings.loginAlerts ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                                  notificationSettings.loginAlerts ? 'transform translate-x-6' : ''
                                }`}
                              ></span>
                            </label>
                          </div>
                        </div>
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Security Alerts</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {notificationSettings.securityAlerts ? 'Enabled' : 'Disabled'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Receive alerts for important security events (password changes, etc.).
                            </p>
                          </div>
                          <div className="relative inline-block w-12 h-6 ml-4">
                            <input
                              type="checkbox"
                              id="securityAlerts"
                              className="opacity-0 w-0 h-0"
                              checked={notificationSettings.securityAlerts}
                              onChange={(e) => handleNotificationSettingChange('securityAlerts', e.target.checked)}
                            />
                            <label
                              htmlFor="securityAlerts"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ease-in-out ${
                                notificationSettings.securityAlerts ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                                  notificationSettings.securityAlerts ? 'transform translate-x-6' : ''
                                }`}
                              ></span>
                            </label>
                          </div>
                        </div>
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">System Updates</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {notificationSettings.systemUpdates ? 'Enabled' : 'Disabled'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Get notified about system updates and new features.
                            </p>
                          </div>
                          <div className="relative inline-block w-12 h-6 ml-4">
                            <input
                              type="checkbox"
                              id="systemUpdates"
                              className="opacity-0 w-0 h-0"
                              checked={notificationSettings.systemUpdates}
                              onChange={(e) => handleNotificationSettingChange('systemUpdates', e.target.checked)}
                            />
                            <label
                              htmlFor="systemUpdates"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 ease-in-out ${
                                notificationSettings.systemUpdates ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                                  notificationSettings.systemUpdates ? 'transform translate-x-6' : ''
                                }`}
                              ></span>
                            </label>
                          </div>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <Button
                    onClick={handleSaveNotificationSettings}
                  >
                    <BellIcon className="h-4 w-4 mr-1" />
                    Save Notification Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default UserSettingsPage;
