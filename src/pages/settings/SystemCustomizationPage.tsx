import React, { useState, useEffect, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useDropzone } from 'react-dropzone';
import { 
  Settings, 
  Upload, 
  Sun, 
  Moon, 
  Paintbrush, 
  Type, 
  Image, 
  XCircle, 
  Check, 
  RefreshCw,
  Save
} from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Slider } from '../../components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import { validateImage, ImageValidationOptions } from '../../utils/imageValidation';

interface SystemTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  isDarkMode: boolean;
}

interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  fontSize: 'small' | 'medium' | 'large';
  fontWeight: 'normal' | 'medium' | 'bold';
  lineHeight: number; // as percentage
}

interface LogoSettings {
  url: string | null;
  width: number;
  height: number;
  padding: number;
}

// Logo validation options
const LOGO_VALIDATION_OPTIONS: ImageValidationOptions = {
  maxWidth: 400,
  maxHeight: 200,
  maxSizeInBytes: 2 * 1024 * 1024, // 2MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/svg+xml']
};

// Helper function to cleanup file input
const cleanupFileInput = (input: HTMLInputElement | null) => {
  if (input) {
    input.value = '';
  }
};

const SystemCustomizationPage: React.FC = () => {
  // State for theme
  const [theme, setTheme] = useState<SystemTheme>({
    primaryColor: '#F59E0B', // amber-600
    secondaryColor: '#3B82F6', // blue-500
    accentColor: '#10B981', // emerald-500
    textColor: '#1F2937', // gray-800
    backgroundColor: '#F9FAFB', // gray-50
    isDarkMode: false,
  });

  // State for typography
  const [typography, setTypography] = useState<TypographySettings>({
    headingFont: 'Inter',
    bodyFont: 'Roboto',
    fontSize: 'medium',
    fontWeight: 'normal',
    lineHeight: 150,
  });

  // State for logo
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    url: localStorage.getItem('companyLogo'),
    width: 200,
    height: 60,
    padding: 12,
  });

  // State for name display toggle
  const [showUserNames, setShowUserNames] = useState<boolean>(
    localStorage.getItem('showUserNames') === 'true'
  );

  // State for active color picker
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  // State for preview theme
  const [previewTheme, setPreviewTheme] = useState<SystemTheme | null>(null);

  // State for preset themes
  const presetThemes = [
    {
      name: 'Default',
      theme: {
        primaryColor: '#F59E0B', // amber-600
        secondaryColor: '#3B82F6', // blue-500
        accentColor: '#10B981', // emerald-500
        textColor: '#1F2937', // gray-800
        backgroundColor: '#F9FAFB', // gray-50
        isDarkMode: false,
      }
    },
    {
      name: 'Dark Mode',
      theme: {
        primaryColor: '#F59E0B', // amber-600
        secondaryColor: '#3B82F6', // blue-500
        accentColor: '#10B981', // emerald-500
        textColor: '#E5E7EB', // gray-200
        backgroundColor: '#1F2937', // gray-800
        isDarkMode: true,
      }
    },
    {
      name: 'Green',
      theme: {
        primaryColor: '#059669', // emerald-600
        secondaryColor: '#0891B2', // cyan-600
        accentColor: '#F59E0B', // amber-500
        textColor: '#1F2937', // gray-800
        backgroundColor: '#ECFDF5', // emerald-50
        isDarkMode: false,
      }
    },
    {
      name: 'Blue',
      theme: {
        primaryColor: '#2563EB', // blue-600
        secondaryColor: '#7C3AED', // violet-600
        accentColor: '#F97316', // orange-500
        textColor: '#1F2937', // gray-800
        backgroundColor: '#EFF6FF', // blue-50
        isDarkMode: false,
      }
    },
    {
      name: 'Purple',
      theme: {
        primaryColor: '#7C3AED', // violet-600
        secondaryColor: '#EC4899', // pink-500
        accentColor: '#3B82F6', // blue-500
        textColor: '#1F2937', // gray-800
        backgroundColor: '#F5F3FF', // violet-50
        isDarkMode: false,
      }
    },
  ];

  // Font families
  const fontFamilies = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Raleway', label: 'Raleway' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' }
  ];

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('systemTheme');
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }

    const savedTypography = localStorage.getItem('typography');
    if (savedTypography) {
      setTypography(JSON.parse(savedTypography));
    }

    const savedLogo = localStorage.getItem('logoSettings');
    if (savedLogo) {
      setLogoSettings(JSON.parse(savedLogo));
    }
  }, []);

  // Apply theme (immediate effect)
  useEffect(() => {
    // Apply global CSS variables for theme colors
    document.documentElement.style.setProperty('--color-primary', theme.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', theme.secondaryColor);
    document.documentElement.style.setProperty('--color-accent', theme.accentColor);
    document.documentElement.style.setProperty('--color-text', theme.textColor);
    document.documentElement.style.setProperty('--color-background', theme.backgroundColor);

    // Apply dark mode
    if (theme.isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [theme]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('systemTheme', JSON.stringify(theme));
    localStorage.setItem('typography', JSON.stringify(typography));
    localStorage.setItem('logoSettings', JSON.stringify(logoSettings));
    localStorage.setItem('showUserNames', showUserNames.toString());
  }, [theme, typography, logoSettings, showUserNames]);

  // Handle logo upload with enhanced error handling and cleanup
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles?.length) return;

    const file = acceptedFiles[0];
    let fileReader: FileReader | null = null;

    try {
      const validationResult = await validateImage(file, LOGO_VALIDATION_OPTIONS);
      
      if (!validationResult.isValid) {
        toast.error(validationResult.error || 'Invalid logo file');
        return;
      }

      fileReader = new FileReader();
      
      const loadPromise = new Promise<string>((resolve, reject) => {
        fileReader!.onload = () => {
          const result = fileReader?.result;
          if (typeof result === 'string') {
            resolve(result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        fileReader!.onerror = () => reject(fileReader?.error || new Error('Failed to read file'));
        fileReader!.readAsDataURL(file);
      });

      const dataUrl = await loadPromise;
      
      setLogoSettings(prev => ({
        ...prev,
        url: dataUrl
      }));
      localStorage.setItem('companyLogo', dataUrl);
      toast.success('Logo uploaded successfully!');

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error processing logo file');
    } finally {
      if (fileReader) {
        fileReader.abort();
      }
      // Cleanup any file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => cleanupFileInput(input as HTMLInputElement));
    }
  }, []);

  // Enhanced dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/svg+xml': ['.svg']
    },
    maxFiles: 1,
    multiple: false,
    onDropRejected: () => {
      toast.error('Invalid file type or too many files');
    },
    onError: (err) => {
      toast.error(err.message || 'Error uploading file');
    }
  });

  // Enhanced logo removal with cleanup
  const handleLogoRemoval = useCallback(() => {
    setLogoSettings(prev => ({ ...prev, url: null }));
    localStorage.removeItem('companyLogo');
    toast.success('Logo removed successfully');
  }, []);

  // Handle theme change
  const handleColorChange = (color: string) => {
    if (!activeColorPicker) return;
    
    setTheme(prev => ({
      ...prev,
      [activeColorPicker]: color
    }));
  };

  // Load preset theme
  const loadPresetTheme = (preset: typeof presetThemes[0]) => {
    setPreviewTheme(preset.theme);
    
    // Show preview for 2 seconds then either apply or revert
    setTimeout(() => {
      setPreviewTheme(null);
    }, 2000);
  };

  // Apply preset theme
  const applyPresetTheme = (preset: typeof presetThemes[0]) => {
    setTheme(preset.theme);
    setPreviewTheme(null);
    toast.success(`Applied "${preset.name}" theme!`);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setTheme(presetThemes[0].theme);
    setTypography({
      headingFont: 'Inter',
      bodyFont: 'Roboto',
      fontSize: 'medium',
      fontWeight: 'normal',
      lineHeight: 150,
    });
    localStorage.removeItem('companyLogo');
    setLogoSettings({
      url: null,
      width: 200,
      height: 60,
      padding: 12,
    });
    setShowUserNames(true);
    localStorage.setItem('showUserNames', 'true');
    toast.success("Reset all settings to defaults");
  };

  // Save current settings
  const saveSettings = () => {
    localStorage.setItem('systemTheme', JSON.stringify(theme));
    localStorage.setItem('typography', JSON.stringify(typography));
    localStorage.setItem('logoSettings', JSON.stringify(logoSettings));
    localStorage.setItem('showUserNames', showUserNames.toString());
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Settings className="mr-2 h-6 w-6 text-amber-600" />
          System Customization
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Logo, name display */}
        <div className="lg:col-span-1 space-y-6">
          {/* Logo settings card */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
              <div className="flex items-center">
                <Image className="h-5 w-5 text-amber-600 mr-2" />
                <h3 className="font-medium text-amber-800">Logo Management</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Logo preview */}
              <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-50" style={{ minHeight: '120px' }}>
                {logoSettings.url ? (
                  <div className="relative">
                    <img 
                      src={logoSettings.url} 
                      alt="Company Logo" 
                      style={{
                        maxWidth: `${logoSettings.width}px`,
                        maxHeight: `${logoSettings.height}px`,
                        padding: `${logoSettings.padding}px`
                      }}
                      className="object-contain"
                      onError={() => {
                        toast.error('Error loading logo');
                        handleLogoRemoval();
                      }}
                    />
                    <button 
                      onClick={handleLogoRemoval}
                      className="absolute -top-2 -right-2 bg-red-100 rounded-full text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div 
                    {...getRootProps()} 
                    className={`w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-500 hover:bg-amber-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Drag & drop logo or click to select</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG (max 2MB)</p>
                  </div>
                )}
              </div>

              {/* Logo dimensions */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label htmlFor="logo-width">Width (px)</Label>
                    <span className="text-xs text-gray-500">{logoSettings.width}px</span>
                  </div>
                  <Slider
                    id="logo-width"
                    min={50}
                    max={400}
                    step={5}
                    value={[logoSettings.width]}
                    onValueChange={(value) => setLogoSettings(prev => ({ ...prev, width: value[0] }))}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label htmlFor="logo-height">Height (px)</Label>
                    <span className="text-xs text-gray-500">{logoSettings.height}px</span>
                  </div>
                  <Slider
                    id="logo-height"
                    min={30}
                    max={200}
                    step={5}
                    value={[logoSettings.height]}
                    onValueChange={(value) => setLogoSettings(prev => ({ ...prev, height: value[0] }))}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label htmlFor="logo-padding">Padding (px)</Label>
                    <span className="text-xs text-gray-500">{logoSettings.padding}px</span>
                  </div>
                  <Slider
                    id="logo-padding"
                    min={0}
                    max={40}
                    step={2}
                    value={[logoSettings.padding]}
                    onValueChange={(value) => setLogoSettings(prev => ({ ...prev, padding: value[0] }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Name display toggle card */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-amber-600 mr-2" />
                <h3 className="font-medium text-amber-800">Interface Settings</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-user-names" className="text-base">Show User Names</Label>
                  <p className="text-sm text-gray-500 mt-1">Display user names in the sidebar and navigation</p>
                </div>
                <Switch
                  id="show-user-names"
                  checked={showUserNames}
                  onCheckedChange={setShowUserNames}
                />
              </div>

              {/* User name display preview */}
              <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                <div className="flex items-center bg-white p-3 rounded-md border border-gray-200">
                  <div className="h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center text-white">
                    A
                  </div>
                  <div className={cn(
                    "ml-3 transition-opacity duration-300", 
                    showUserNames ? "opacity-100" : "opacity-0"
                  )}>
                    <p className="font-medium text-gray-900">Admin User</p>
                    <p className="text-xs text-amber-600">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center and right columns: Color and typography settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme settings card */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
              <div className="flex items-center">
                <Paintbrush className="h-5 w-5 text-amber-600 mr-2" />
                <h3 className="font-medium text-amber-800">Theme Customization</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Color pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Primary Color */}
                <div className="space-y-2">
                  <Label className="text-sm">Primary Color</Label>
                  <div
                    className="h-12 rounded-md cursor-pointer border border-gray-200 transition-all hover:shadow-md"
                    style={{ backgroundColor: theme.primaryColor }}
                    onClick={() => setActiveColorPicker(activeColorPicker === 'primaryColor' ? null : 'primaryColor')}
                  ></div>
                  {activeColorPicker === 'primaryColor' && (
                    <div className="mt-2 relative z-10">
                      <HexColorPicker 
                        color={theme.primaryColor} 
                        onChange={handleColorChange} 
                      />
                      <div className="mt-2 flex items-center">
                        <Input
                          value={theme.primaryColor}
                          onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="text-sm h-7"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Secondary Color */}
                <div className="space-y-2">
                  <Label className="text-sm">Secondary Color</Label>
                  <div
                    className="h-12 rounded-md cursor-pointer border border-gray-200 transition-all hover:shadow-md"
                    style={{ backgroundColor: theme.secondaryColor }}
                    onClick={() => setActiveColorPicker(activeColorPicker === 'secondaryColor' ? null : 'secondaryColor')}
                  ></div>
                  {activeColorPicker === 'secondaryColor' && (
                    <div className="mt-2 relative z-10">
                      <HexColorPicker 
                        color={theme.secondaryColor} 
                        onChange={handleColorChange} 
                      />
                      <div className="mt-2 flex items-center">
                        <Input
                          value={theme.secondaryColor}
                          onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="text-sm h-7"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Accent Color */}
                <div className="space-y-2">
                  <Label className="text-sm">Accent Color</Label>
                  <div
                    className="h-12 rounded-md cursor-pointer border border-gray-200 transition-all hover:shadow-md"
                    style={{ backgroundColor: theme.accentColor }}
                    onClick={() => setActiveColorPicker(activeColorPicker === 'accentColor' ? null : 'accentColor')}
                  ></div>
                  {activeColorPicker === 'accentColor' && (
                    <div className="mt-2 relative z-10">
                      <HexColorPicker 
                        color={theme.accentColor} 
                        onChange={handleColorChange} 
                      />
                      <div className="mt-2 flex items-center">
                        <Input
                          value={theme.accentColor}
                          onChange={(e) => setTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="text-sm h-7"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                  <Label className="text-sm">Text Color</Label>
                  <div
                    className="h-12 rounded-md cursor-pointer border border-gray-200 transition-all hover:shadow-md"
                    style={{ backgroundColor: theme.textColor }}
                    onClick={() => setActiveColorPicker(activeColorPicker === 'textColor' ? null : 'textColor')}
                  ></div>
                  {activeColorPicker === 'textColor' && (
                    <div className="mt-2 relative z-10">
                      <HexColorPicker 
                        color={theme.textColor} 
                        onChange={handleColorChange} 
                      />
                      <div className="mt-2 flex items-center">
                        <Input
                          value={theme.textColor}
                          onChange={(e) => setTheme(prev => ({ ...prev, textColor: e.target.value }))}
                          className="text-sm h-7"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Background Color */}
                <div className="space-y-2">
                  <Label className="text-sm">Background Color</Label>
                  <div
                    className="h-12 rounded-md cursor-pointer border border-gray-200 transition-all hover:shadow-md"
                    style={{ backgroundColor: theme.backgroundColor }}
                    onClick={() => setActiveColorPicker(activeColorPicker === 'backgroundColor' ? null : 'backgroundColor')}
                  ></div>
                  {activeColorPicker === 'backgroundColor' && (
                    <div className="mt-2 relative z-10">
                      <HexColorPicker 
                        color={theme.backgroundColor} 
                        onChange={handleColorChange} 
                      />
                      <div className="mt-2 flex items-center">
                        <Input
                          value={theme.backgroundColor}
                          onChange={(e) => setTheme(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="text-sm h-7"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dark Mode Toggle */}
                <div className="space-y-2">
                  <Label className="text-sm">Mode</Label>
                  <div className="flex items-center space-x-2 h-12">
                    <Button 
                      variant={!theme.isDarkMode ? "default" : "outline"}
                      onClick={() => setTheme(prev => ({ ...prev, isDarkMode: false }))}
                      className="flex-1"
                    >
                      <Sun className="h-4 w-4 mr-1" />
                      Light
                    </Button>
                    <Button 
                      variant={theme.isDarkMode ? "default" : "outline"}
                      onClick={() => setTheme(prev => ({ ...prev, isDarkMode: true }))}
                      className="flex-1"
                    >
                      <Moon className="h-4 w-4 mr-1" />
                      Dark
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preset themes */}
              <div className="space-y-3">
                <Label className="text-sm">Preset Themes</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {presetThemes.map((preset, index) => (
                    <div 
                      key={index}
                      className={`${
                        previewTheme === preset.theme ? 'ring-2 ring-amber-500' : 'hover:border-amber-500'
                      } p-3 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col items-center cursor-pointer transition-all`}
                      onClick={() => loadPresetTheme(preset)}
                      onDoubleClick={() => applyPresetTheme(preset)}
                    >
                      <div className="flex space-x-1 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: preset.theme.primaryColor }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: preset.theme.secondaryColor }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: preset.theme.accentColor }}
                        ></div>
                      </div>
                      <div className="text-sm font-medium">{preset.name}</div>
                      <div className="text-xs mt-1 text-gray-500">{preset.theme.isDarkMode ? 'Dark' : 'Light'}</div>
                      
                      <button 
                        className="mt-2 text-xs flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          applyPresetTheme(preset);
                        }}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theme preview */}
              <div className="space-y-3">
                <Label className="text-sm">Preview</Label>
                <div 
                  className={`p-4 rounded-lg border shadow-sm transition-colors ${
                    (previewTheme || theme).isDarkMode ? 'border-gray-700 shadow-md' : 'border-gray-200'
                  }`}
                  style={{ 
                    backgroundColor: (previewTheme || theme).backgroundColor,
                    color: (previewTheme || theme).textColor
                  }}
                >
                  <h3 
                    className="text-lg font-medium mb-2"
                    style={{ color: (previewTheme || theme).primaryColor }}
                  >
                    Theme Preview
                  </h3>
                  <p className="mb-3" style={{ color: (previewTheme || theme).textColor }}>
                    This is how your application will look with the selected colors and theme.
                  </p>
                  <div className="flex space-x-2">
                    <button 
                      className="px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
                      style={{ 
                        backgroundColor: (previewTheme || theme).primaryColor,
                        color: '#ffffff',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      Primary Button
                    </button>
                    <button 
                      className="px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
                      style={{ 
                        backgroundColor: (previewTheme || theme).secondaryColor,
                        color: '#ffffff',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      Secondary Button
                    </button>
                    <button 
                      className="px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
                      style={{ 
                        backgroundColor: (previewTheme || theme).accentColor,
                        color: '#ffffff',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      Accent Button
                    </button>
                  </div>
                </div>
                {previewTheme && (
                  <div className="text-center">
                    <span className="text-xs text-gray-500">Preview active. Double-click a theme to apply it.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Typography settings card */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
              <div className="flex items-center">
                <Type className="h-5 w-5 text-amber-600 mr-2" />
                <h3 className="font-medium text-amber-800">Typography Settings</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Font family selections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heading-font">Heading Font</Label>
                  <Select
                    value={typography.headingFont}
                    onValueChange={(value) => setTypography(prev => ({ ...prev, headingFont: value }))}
                  >
                    <SelectTrigger id="heading-font">
                      <SelectValue placeholder="Select a font..." />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map(font => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body-font">Body Font</Label>
                  <Select
                    value={typography.bodyFont}
                    onValueChange={(value) => setTypography(prev => ({ ...prev, bodyFont: value }))}
                  >
                    <SelectTrigger id="body-font">
                      <SelectValue placeholder="Select a font..." />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map(font => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Font size */}
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <div className="flex items-center space-x-4">
                  <Button 
                    variant={typography.fontSize === 'small' ? "default" : "outline"}
                    onClick={() => setTypography(prev => ({ ...prev, fontSize: 'small' }))}
                    className="flex-1"
                  >
                    Small
                  </Button>
                  <Button 
                    variant={typography.fontSize === 'medium' ? "default" : "outline"}
                    onClick={() => setTypography(prev => ({ ...prev, fontSize: 'medium' }))}
                    className="flex-1"
                  >
                    Medium
                  </Button>
                  <Button 
                    variant={typography.fontSize === 'large' ? "default" : "outline"}
                    onClick={() => setTypography(prev => ({ ...prev, fontSize: 'large' }))}
                    className="flex-1"
                  >
                    Large
                  </Button>
                </div>
              </div>

              {/* Font weight */}
              <div className="space-y-2">
                <Label htmlFor="font-weight">Font Weight</Label>
                <div className="flex items-center space-x-4">
                  <Button 
                    variant={typography.fontWeight === 'normal' ? "default" : "outline"}
                    onClick={() => setTypography(prev => ({ ...prev, fontWeight: 'normal' }))}
                    className="flex-1"
                  >
                    Normal
                  </Button>
                  <Button 
                    variant={typography.fontWeight === 'medium' ? "default" : "outline"}
                    onClick={() => setTypography(prev => ({ ...prev, fontWeight: 'medium' }))}
                    className="flex-1"
                  >
                    Medium
                  </Button>
                  <Button 
                    variant={typography.fontWeight === 'bold' ? "default" : "outline"}
                    onClick={() => setTypography(prev => ({ ...prev, fontWeight: 'bold' }))}
                    className="flex-1"
                  >
                    Bold
                  </Button>
                </div>
              </div>

              {/* Line height */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="line-height">Line Height</Label>
                  <span className="text-xs text-gray-500">{typography.lineHeight}%</span>
                </div>
                <Slider
                  id="line-height"
                  min={100}
                  max={200}
                  step={5}
                  value={[typography.lineHeight]}
                  onValueChange={(value) => setTypography(prev => ({ ...prev, lineHeight: value[0] }))}
                />
              </div>

              {/* Typography preview */}
              <div className="mt-6 space-y-3">
                <Label className="text-sm">Typography Preview</Label>
                <div 
                  className="p-4 rounded-lg border border-gray-200"
                  style={{ 
                    backgroundColor: theme.backgroundColor,
                  }}
                >
                  <h3 
                    className="text-xl mb-3"
                    style={{ 
                      fontFamily: typography.headingFont,
                      color: theme.textColor,
                      fontWeight: typography.fontWeight === 'bold' ? 700 : typography.fontWeight === 'medium' ? 500 : 400,
                      fontSize: typography.fontSize === 'large' ? '1.25rem' : typography.fontSize === 'medium' ? '1.125rem' : '1rem'
                    }}
                  >
                    Typography Preview (Heading)
                  </h3>
                  <p
                    style={{ 
                      fontFamily: typography.bodyFont,
                      color: theme.textColor,
                      fontWeight: typography.fontWeight === 'bold' ? 700 : typography.fontWeight === 'medium' ? 500 : 400,
                      fontSize: typography.fontSize === 'large' ? '1rem' : typography.fontSize === 'medium' ? '0.9rem' : '0.8rem',
                      lineHeight: `${typography.lineHeight}%`
                    }}
                  >
                    This is a sample paragraph to preview the body text. It demonstrates how the body text will appear with the selected font family, size, weight, and line height settings. Good typography improves readability and user experience throughout the application.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Accessibility and saving */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-amber-600 mr-2" />
                <h3 className="font-medium text-amber-800">Accessibility & Advanced Settings</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Contrast verification */}
              <div className="space-y-3">
                <Label className="text-sm">Contrast Verification</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="p-4 rounded border"
                    style={{ 
                      backgroundColor: theme.backgroundColor,
                      color: theme.textColor,
                      borderColor: theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div className="text-sm">Background / Text</div>
                    <div className="mt-2 text-lg font-medium">Sample Text</div>
                  </div>

                  <div 
                    className="p-4 rounded border"
                    style={{ 
                      backgroundColor: theme.primaryColor,
                      color: '#ffffff',
                      borderColor: 'transparent'
                    }}
                  >
                    <div className="text-sm">Primary / White</div>
                    <div className="mt-2 text-lg font-medium">Sample Text</div>
                  </div>
                </div>
              </div>

              {/* Auto-save toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Save Automatically</Label>
                  <p className="text-sm text-gray-500 mt-1">Automatically save changes as you make them</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={true}
                  onCheckedChange={() => {
                    toast.success("Auto-save is always enabled");
                  }}
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="mt-4 flex items-center justify-end space-x-3">
                  <Button variant="outline" onClick={resetToDefaults}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Settings
                  </Button>
                  <Button onClick={saveSettings}>
                    <Save className="h-4 w-4 mr-2" />
                    Save All Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SystemCustomizationPage;
