import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ChatPanel } from '@/components/chat/chat-panel';
import { useChat } from '@/context/chat-context';
import { useAuth } from '@/context/auth-context';

export default function Settings() {
  const { isChatOpen, toggleChat } = useChat();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [aiAssistant, setAiAssistant] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [apiKey, setApiKey] = useState('');
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Notifications Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage how you receive notifications and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important alerts about your account via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-reports">Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Get a summary of your financial activity every week
                      </p>
                    </div>
                    <Switch
                      id="weekly-reports"
                      checked={weeklyReports}
                      onCheckedChange={setWeeklyReports}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ai-insights">AI Insights</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow our AI to send you proactive financial insights
                      </p>
                    </div>
                    <Switch
                      id="ai-insights"
                      checked={aiAssistant}
                      onCheckedChange={setAiAssistant}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Preferences</CardTitle>
                  <CardDescription>Customize your account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-sharing">Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow anonymous usage data to help improve our service
                      </p>
                    </div>
                    <Switch
                      id="data-sharing"
                      checked={dataSharing}
                      onCheckedChange={setDataSharing}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* API Integration */}
              <Card>
                <CardHeader>
                  <CardTitle>API Integration</CardTitle>
                  <CardDescription>Manage your API keys and integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="capital-one-api">Capital One API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="capital-one-api"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Capital One API key"
                      />
                      <Button variant="outline" size="sm" className="whitespace-nowrap">
                        Verify
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your API keys are encrypted and stored securely
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Connected Services</Label>
                    <div className="rounded-md border border-border p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-sm">Capital One</p>
                            <p className="text-xs text-gray-500">Connected on July 15, 2023</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Control your data and privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Data Storage</h3>
                    <p className="text-sm text-muted-foreground">
                      Your financial data is securely stored and encrypted. You can export or delete your data at any time.
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <Button variant="outline" size="sm">
                        Export Data
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        Delete All Data
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">AI Learning</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI learns from your financial patterns to provide better insights. You can reset this learning at any time.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Reset AI Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button variant="outline" className="mr-2">
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <ChatPanel isOpen={isChatOpen} onClose={toggleChat} />
    </div>
  );
}
