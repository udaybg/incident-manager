import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/index.js';
import { Button } from './ui/index.js';
import { Input } from './ui/index.js';
import { Textarea } from './ui/index.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/index.js';
import { Badge } from './ui/index.js';
import { Alert, AlertDescription } from './ui/index.js';
import { Plus, X, Save, Download, Upload } from 'lucide-react';
import { INCIDENT_CONFIG } from '../config/incidentConfig.js';

const ConfigEditor = ({ onClose }) => {
  const [config, setConfig] = useState(JSON.parse(JSON.stringify(INCIDENT_CONFIG)));
  const [notifications, setNotifications] = useState([]);

  // Helper function to add notification
  const addNotification = (type, message) => {
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type,
      message
    }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 3000);
  };

  // Update config value
  const updateConfig = (path, value) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  // Add new item to array
  const addArrayItem = (path, item) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = [...(current[keys[keys.length - 1]] || []), item];
      return newConfig;
    });
  };

  // Remove item from array
  const removeArrayItem = (path, index) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = current[keys[keys.length - 1]].filter((_, i) => i !== index);
      return newConfig;
    });
  };

  // Export configuration
  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'incident-config.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    addNotification('success', 'Configuration exported successfully');
  };

  // Import configuration
  const importConfig = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target.result);
          setConfig(importedConfig);
          addNotification('success', 'Configuration imported successfully');
        } catch (error) {
          addNotification('error', 'Invalid configuration file');
        }
      };
      reader.readAsText(file);
    }
  };

  // Save configuration (in real app, this would send to backend)
  const saveConfig = () => {
    // In a real application, you would send this to your backend
    // For now, we'll just show it in the console and update localStorage
    console.log('Updated Configuration:', config);
    localStorage.setItem('incident-config', JSON.stringify(config));
    addNotification('success', 'Configuration saved! (Note: Refresh page to see changes)');
  };

  // Array editor component
  const ArrayEditor = ({ title, items, path, itemTemplate }) => {
    const [newItem, setNewItem] = useState(itemTemplate);

    const handleAddItem = () => {
      if (newItem.value && newItem.label) {
        addArrayItem(path, { ...newItem });
        setNewItem(itemTemplate);
      }
    };

    return (
      <div className="space-y-4">
        <h4 className="font-medium">{title}</h4>
        
        {/* Existing items */}
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-gray-500">Value: {item.value}</div>
                {item.description && (
                  <div className="text-sm text-gray-400">{item.description}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem(path, index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new item */}
        <div className="p-3 border border-dashed border-gray-300 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <Input
              placeholder="Value"
              value={newItem.value}
              onChange={(e) => setNewItem(prev => ({ ...prev, value: e.target.value }))}
            />
            <Input
              placeholder="Label"
              value={newItem.label}
              onChange={(e) => setNewItem(prev => ({ ...prev, label: e.target.value }))}
            />
          </div>
          {itemTemplate.description !== undefined && (
            <Input
              placeholder="Description (optional)"
              value={newItem.description || ''}
              onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              className="mb-2"
            />
          )}
          <Button onClick={handleAddItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add {title.slice(0, -1)}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Configuration Editor</h2>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".json"
                onChange={importConfig}
                className="hidden"
                id="import-config"
              />
              <Button variant="outline" onClick={() => document.getElementById('import-config').click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" onClick={exportConfig}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={saveConfig}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notifications */}
          {notifications.map(notification => (
            <Alert key={notification.id} variant={notification.type === 'error' ? 'destructive' : 'default'} className="mb-4">
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          ))}

          {/* Configuration Tabs */}
          <Tabs defaultValue="levels">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="levels">Levels & Scopes</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="scoring">Priority Scoring</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Levels & Scopes Tab */}
            <TabsContent value="levels">
              <div className="space-y-6">
                <ArrayEditor
                  title="Severity Levels"
                  items={config.severityLevels}
                  path="severityLevels"
                  itemTemplate={{ value: '', label: '', description: '' }}
                />
                
                <ArrayEditor
                  title="Scope Levels"
                  items={config.scopeLevels}
                  path="scopeLevels"
                  itemTemplate={{ value: '', label: '', description: '' }}
                />
                
                <ArrayEditor
                  title="Impact Areas"
                  items={config.impactAreas}
                  path="impactAreas"
                  itemTemplate={{ value: '', label: '', description: '' }}
                />
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories">
              <div className="space-y-6">
                <ArrayEditor
                  title="Root Cause Categories"
                  items={config.rootCauseCategories}
                  path="rootCauseCategories"
                  itemTemplate={{ value: '', label: '' }}
                />
                
                <ArrayEditor
                  title="Impact Levels"
                  items={config.impactLevels}
                  path="impactLevels"
                  itemTemplate={{ value: '', label: '' }}
                />
              </div>
            </TabsContent>

            {/* Priority Scoring Tab */}
            <TabsContent value="scoring">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Priority Scoring Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Level Scores */}
                    <div>
                      <h4 className="font-medium mb-2">Level Scores</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {Object.entries(config.priorityScoring.levelScores).map(([level, score]) => (
                          <div key={level} className="flex items-center gap-2">
                            <span className="text-sm">{level}:</span>
                            <Input
                              type="number"
                              value={score}
                              onChange={(e) => updateConfig(`priorityScoring.levelScores.${level}`, parseInt(e.target.value))}
                              className="w-16"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scope Multipliers */}
                    <div>
                      <h4 className="font-medium mb-2">Scope Multipliers</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(config.priorityScoring.scopeMultipliers).map(([scope, multiplier]) => (
                          <div key={scope} className="flex items-center gap-2">
                            <span className="text-sm">{scope}:</span>
                            <Input
                              type="number"
                              step="0.1"
                              value={multiplier}
                              onChange={(e) => updateConfig(`priorityScoring.scopeMultipliers.${scope}`, parseFloat(e.target.value))}
                              className="w-16"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bonus Points */}
                    <div>
                      <h4 className="font-medium mb-2">Bonus Points</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(config.priorityScoring.bonusPoints).map(([key, points]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-sm flex-1">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                            <Input
                              type="number"
                              value={points}
                              onChange={(e) => updateConfig(`priorityScoring.bonusPoints.${key}`, parseInt(e.target.value))}
                              className="w-16"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Default Values</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Default Severity Level</label>
                        <Input
                          value={config.defaults.severityLevel}
                          onChange={(e) => updateConfig('defaults.severityLevel', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Default Scope Level</label>
                        <Input
                          value={config.defaults.scopeLevel}
                          onChange={(e) => updateConfig('defaults.scopeLevel', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Validation Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Title Max Length</label>
                        <Input
                          type="number"
                          value={config.validation.titleMaxLength}
                          onChange={(e) => updateConfig('validation.titleMaxLength', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description Max Length</label>
                        <Input
                          type="number"
                          value={config.validation.descriptionMaxLength}
                          onChange={(e) => updateConfig('validation.descriptionMaxLength', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ConfigEditor; 