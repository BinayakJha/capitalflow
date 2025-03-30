import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ChatPanel } from '@/components/chat/chat-panel';
import { useChat } from '@/context/chat-context';
import { useAuth } from '@/context/auth-context';

export default function Profile() {
  const { isChatOpen, toggleChat } = useChat();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  
  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
            <Tabs defaultValue="profile">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile Information</TabsTrigger>
                <TabsTrigger value="business">Business Details</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Profile Photo */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Photo</CardTitle>
                      <CardDescription>This will be displayed on your profile</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                        <AvatarFallback className="text-2xl">
                          {user?.displayName
                            ? getInitials(user.displayName)
                            : user?.email?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Upload
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500">
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Personal Information */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="display-name">Full Name</Label>
                          <Input
                            id="display-name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself"
                          className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="business">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>Provide details about your business</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Acme Inc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                          id="industry"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          placeholder="Technology"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="business-size">Business Size</Label>
                        <select
                          id="business-size"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select business size</option>
                          <option value="sole-proprietor">Sole Proprietor</option>
                          <option value="2-10">2-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201+">201+ employees</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-type">Business Type</Label>
                        <select
                          id="business-type"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select business type</option>
                          <option value="llc">LLC</option>
                          <option value="corporation">Corporation</option>
                          <option value="partnership">Partnership</option>
                          <option value="sole-proprietorship">Sole Proprietorship</option>
                          <option value="non-profit">Non-Profit</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business-address">Business Address</Label>
                      <Input
                        id="business-address"
                        placeholder="123 Main St"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="San Francisco" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="CA" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input id="zip" placeholder="94103" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tax-id">Tax ID (EIN)</Label>
                      <Input id="tax-id" placeholder="XX-XXXXXXX" />
                      <p className="text-xs text-muted-foreground">
                        Your Tax ID is stored securely and used only for document preparation
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveProfile}>Save Business Details</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>Update your account password</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button>Update Password</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                      <CardDescription>Add an extra layer of security to your account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-factor authentication is not enabled yet.</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            We strongly recommend enabling two-factor authentication to protect your account.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button variant="outline">Enable 2FA</Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Session Management</CardTitle>
                    <CardDescription>Manage your active sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-md border border-border p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <svg className="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm text-muted-foreground">Active now</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Chrome on macOS • San Francisco, CA, USA
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            Logout
                          </Button>
                        </div>
                      </div>
                      
                      <div className="rounded-md border border-border p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Session on iPhone</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Safari on iOS • Last active 2 days ago
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            Logout
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      Logout of All Sessions
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <ChatPanel isOpen={isChatOpen} onClose={toggleChat} />
    </div>
  );
}
