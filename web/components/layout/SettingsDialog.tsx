"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Key, Eye, EyeOff, Palette, Type, Monitor, Moon, Sun, Zap, Lightbulb } from "lucide-react"
import { usePreferencesStore } from "@/lib/store"
import { useTheme } from "next-themes"
import { API_PROVIDERS } from "@/constants/providers"

export function SettingsDialog() {
  const { 
    apiKeys, 
    setApiKey, 
    injectKeys, 
    setInjectKeys, 
    autoMarkComplete, 
    setAutoMarkComplete,
    fontSans,
    setFontSans,
    fontMono,
    setFontMono
  } = usePreferencesStore()
  
  const { theme, setTheme } = useTheme()
  
  const [open, setOpen] = useState(false)
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({})

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setTempKeys(apiKeys)
    }
  }

  const handleSave = () => {
    // Save all keys
    Object.entries(tempKeys).forEach(([service, key]) => {
        setApiKey(service, key)
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] flex flex-col p-0 gap-0 max-h-[85vh] overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
             Configure your learning experience and local API keys.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="keys" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-6 shrink-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="keys">API Keys</TabsTrigger>
                <TabsTrigger value="general">Appearance</TabsTrigger>
              </TabsList>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
              <TabsContent value="keys" className="space-y-4 mt-0 h-full">
                <div className="flex flex-col gap-4">
                   <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground flex gap-2">
                      <Key className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>
                        Keys are stored <strong>locally in your browser</strong>. They are never sent to our servers.
                        We use them to make code blocks &quot;runnable&quot; or copy-paste ready.
                      </p>
                   </div>
    
                   <div className="space-y-4">
                      {API_PROVIDERS.map((provider) => (
                          <div key={provider.id} className="space-y-2">
                            <Label htmlFor={`key-${provider.id}`}>{provider.name} API Key</Label>
                            <div className="relative">
                                <Input 
                                    id={`key-${provider.id}`}
                                    type={showKey[provider.id] ? "text" : "password"} 
                                    placeholder={provider.placeholder}
                                    value={tempKeys[provider.id] || ""}
                                    onChange={(e) => setTempKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                                    className="pr-10 font-mono"
                                />
                                <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute right-0 top-0 h-9 w-9 text-muted-foreground"
                                    onClick={() => setShowKey(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                                >
                                    {showKey[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                          </div>
                      ))}
                   </div>
    
                   <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Smart Copy</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically inject your API keys when copying code blocks.
                        </p>
                      </div>
                      <Switch 
                        checked={injectKeys}
                        onCheckedChange={setInjectKeys}
                      />
                   </div>
                </div>
              </TabsContent>
              
              <TabsContent value="general" className="space-y-4 mt-0 h-full">
                 <div className="space-y-4">
                   <div className="grid gap-2">
                     <Label className="text-base flex items-center gap-2">
                       <Palette className="w-4 h-4" /> Theme
                     </Label>
                     <div className="grid grid-cols-3 gap-2">
                        {['light', 'dark', 'system', 'black', 'bright'].map((t) => (
                          <Button
                            key={t}
                            variant={theme === t ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme(t)}
                            className="w-full justify-start capitalize"
                          >
                            {t === 'light' && <Sun className="mr-2 h-4 w-4" />}
                            {t === 'dark' && <Moon className="mr-2 h-4 w-4" />}
                            {t === 'system' && <Monitor className="mr-2 h-4 w-4" />}
                            {t === 'black' && <Zap className="mr-2 h-4 w-4" />}
                            {t === 'bright' && <Lightbulb className="mr-2 h-4 w-4" />}
                            {t}
                          </Button>
                        ))}
                     </div>
                   </div>
    
                   <div className="grid gap-2">
                     <Label className="text-base flex items-center gap-2">
                       <Type className="w-4 h-4" /> Typography
                     </Label>
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                         <Label className="text-xs text-muted-foreground">Interface Font</Label>
                         <Select value={fontSans} onValueChange={setFontSans}>
                           <SelectTrigger>
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="inter">Inter (Classic)</SelectItem>
                             <SelectItem value="manrope">Manrope (Modern)</SelectItem>
                             <SelectItem value="outfit">Outfit (Clean)</SelectItem>
                             <SelectItem value="roboto">Roboto (Standard)</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                       <div className="space-y-1">
                         <Label className="text-xs text-muted-foreground">Code Font</Label>
                           <Select value={fontMono} onValueChange={setFontMono}>
                           <SelectTrigger>
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="jetbrains">JetBrains Mono</SelectItem>
                             <SelectItem value="fira">Fira Code</SelectItem>
                             <SelectItem value="ibm">IBM Plex Mono</SelectItem>
                             <SelectItem value="source">Source Code Pro</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                     </div>
                   </div>
    
                   <div className="flex items-center justify-between space-x-2 border-t pt-4">
                      <Label htmlFor="auto-complete">Auto-mark modules as complete on scroll</Label>
                      <Switch 
                        id="auto-complete" 
                        checked={autoMarkComplete}
                        onCheckedChange={setAutoMarkComplete}
                      />
                    </div>
                 </div>
              </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter className="p-6 pt-2 shrink-0">
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
