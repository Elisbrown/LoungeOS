// src/app/dashboard/configuration/page.tsx
"use client"

import React, { useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { useAuth } from '@/context/auth-context'
import { useSettings, type ReceiptField } from '@/context/settings-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, Palette, FileText, Image as ImageIcon, Trash2, PlusCircle, X, Clapperboard, DollarSign, Calculator, Percent, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { Receipt } from '@/components/dashboard/pos/receipt'
import type { OrderItem } from '@/components/dashboard/pos/order-summary'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from '@/hooks/use-translation'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'

function LoungeChairIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14 17a2 2 0 1 0-4 0" />
            <path d="M6 10h12" />
            <path d="M16 4h-8" />
            <path d="M6 4v13" />
            <path d="M18 4v13" />
            <path d="M5 17h14" />
        </svg>
    )
}

function GeneralSettings() {
    const { settings, setSettings, updateSetting } = useSettings()
    const { t } = useTranslation()
    const { toast } = useToast()
    const { user } = useAuth()
    const logoInputRef = React.useRef<HTMLInputElement>(null)
    const [localSettings, setLocalSettings] = React.useState({
        platformName: settings.platformName,
        platformLogo: settings.platformLogo,
        organizationName: settings.organizationName,
        contactAddress: settings.contactAddress,
        contactPhone: settings.contactPhone,
    })
    
    React.useEffect(() => {
        setLocalSettings({
            platformName: settings.platformName,
            platformLogo: settings.platformLogo,
            organizationName: settings.organizationName,
            contactAddress: settings.contactAddress,
            contactPhone: settings.contactPhone,
        })
    }, [settings])


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({...prev, [name]: value }))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const newSettings = { ...settings, ...localSettings }
        await setSettings(newSettings)
        // Also explicitly update the platformLogo setting to ensure it's persisted
        if (localSettings.platformLogo !== settings.platformLogo) {
            await updateSetting('platformLogo', localSettings.platformLogo)
        }
        toast({ title: t('toasts.settingsSaved'), description: t('toasts.generalSettingsDesc')})
    }
    
    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            try {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('type', 'logo')
                formData.append('userEmail', user?.email || 'system')
                
                const response = await fetch('/api/settings', {
                    method: 'POST',
                    body: formData
                })
                
                if (response.ok) {
                    const result = await response.json()
                    setLocalSettings(prev => ({...prev, platformLogo: result.imagePath }))
                    toast({ title: t('toasts.logoUpdated'), description: t('toasts.logoUpdatedDesc') })
                } else {
                    throw new Error('Upload failed')
                }
            } catch (error) {
                toast({ 
                    variant: "destructive",
                    title: t('toasts.error'), 
                    description: t('toasts.logoUploadFailed') 
                })
            }
        }
    }
    
    const removeLogo = () => {
        setLocalSettings(prev => ({...prev, platformLogo: ''}));
    }

    return (
        <form onSubmit={handleSave}>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="platformName">{t('config.general.platformName')}</Label>
                    <Input id="platformName" name="platformName" value={localSettings.platformName} onChange={handleInputChange} />
                    <p className="text-sm text-muted-foreground">{t('config.general.platformNameDesc')}</p>
                </div>
                 <div className="space-y-2">
                    <Label>{t('config.general.platformLogo')}</Label>
                    <div className="flex items-center gap-4">
                        <div className="relative group/logo">
                            {localSettings.platformLogo ? (
                                <Image src={localSettings.platformLogo} alt={t('config.general.platformLogo')} width={64} height={64} className="rounded-md bg-muted p-1 aspect-square object-contain" />
                            ) : (
                                <div className="h-16 w-16 rounded-md bg-muted p-1 flex items-center justify-center">
                                    <LoungeChairIcon className="h-10 w-10 text-muted-foreground" />
                                </div>
                            )}
                            {localSettings.platformLogo && (
                                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity" onClick={removeLogo}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()}>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            {t('config.general.uploadLogo')}
                        </Button>
                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </div>
                </div>
                <Separator />
                <div className="space-y-2">
                    <Label htmlFor="organizationName">{t('config.general.orgName')}</Label>
                    <Input id="organizationName" name="organizationName" value={localSettings.organizationName} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="contactAddress">{t('config.general.contactAddress')}</Label>
                    <Input id="contactAddress" name="contactAddress" value={localSettings.contactAddress} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="contactPhone">{t('config.general.contactPhone')}</Label>
                    <Input id="contactPhone" name="contactPhone" value={localSettings.contactPhone} onChange={handleInputChange} />
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button type="submit">{t('dialogs.saveChanges')}</Button>
            </CardFooter>
        </form>
    )
}

function AppearanceSettings() {
    const { settings, updateSetting, addTheme, deleteTheme, applyTheme } = useSettings()
    const { t } = useTranslation()
    const { toast } = useToast()
    const [newThemeName, setNewThemeName] = React.useState("")

    const handleAddTheme = async () => {
        if (!newThemeName.trim()) {
            toast({ variant: "destructive", title: t('toasts.invalidName'), description: t('toasts.themeNameEmpty')})
            return
        }
        await addTheme({
            name: newThemeName.trim(),
            colors: {
                primary: "#E11D48",
                background: "#09090B",
                accent: "#27272A"
            }
        })
        setNewThemeName("")
        toast({ title: t('toasts.themeAdded'), description: t('toasts.themeAddedDesc', { name: newThemeName })})
    }

    const handleColorChange = async (themeName: string, colorType: 'primary' | 'background' | 'accent', value: string) => {
        const theme = settings.themes.find(t => t.name === themeName)
        if(theme) {
            const updatedTheme = {
                ...theme,
                colors: { ...theme.colors, [colorType]: value }
            }
            await updateSetting('themes', settings.themes.map(t => t.name === themeName ? updatedTheme : t))
        }
    }

    return (
        <CardContent className="space-y-6">
            <div className="space-y-4">
                <h3 className="font-medium">{t('config.appearance.activeTheme')}</h3>
                <div className="flex items-center gap-2">
                    {settings.themes.map(theme => (
                        <Button
                            key={theme.name}
                            variant={settings.activeTheme === theme.name ? "default" : "outline"}
                            onClick={() => applyTheme(theme.name)}
                        >
                            {theme.name}
                        </Button>
                    ))}
                </div>
            </div>
            <Separator />
            <div>
                 <h3 className="font-medium mb-4">{t('config.appearance.editThemes')}</h3>
                 <div className="space-y-6">
                    {settings.themes.map(theme => (
                        <Card key={theme.name}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">{theme.name}</CardTitle>
                                {theme.name !== "Default" && (
                                    <Button variant="destructive" size="sm" onClick={() => deleteTheme(theme.name)}>{t('dialogs.delete')}</Button>
                                )}
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`primary-${theme.name}`}>{t('config.appearance.primaryColor')}</Label>
                                    <Input id={`primary-${theme.name}`} type="color" value={theme.colors.primary} onChange={(e) => handleColorChange(theme.name, 'primary', e.target.value)} className="h-10 p-1" />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor={`background-${theme.name}`}>{t('config.appearance.bgColor')}</Label>
                                    <Input id={`background-${theme.name}`} type="color" value={theme.colors.background} onChange={(e) => handleColorChange(theme.name, 'background', e.target.value)} className="h-10 p-1" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`accent-${theme.name}`}>{t('config.appearance.accentColor')}</Label>
                                    <Input id={`accent-${theme.name}`} type="color" value={theme.colors.accent} onChange={(e) => handleColorChange(theme.name, 'accent', e.target.value)} className="h-10 p-1" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            </div>
             <Separator />
             <div>
                <h3 className="font-medium mb-2">{t('config.appearance.addNewTheme')}</h3>
                <div className="flex items-center gap-2">
                    <Input placeholder={t('config.appearance.newThemeName')} value={newThemeName} onChange={e => setNewThemeName(e.target.value)} />
                    <Button onClick={handleAddTheme}>{t('config.appearance.addTheme')}</Button>
                </div>
             </div>
        </CardContent>
    )
}

const mockReceiptItems: OrderItem[] = [
    { id: '1', name: 'Sample Item 1', price: 1500, quantity: 2, category: 'Snack', image: 'https://placehold.co/150x150.png' },
    { id: '2', name: 'Sample Item 2', price: 3000, quantity: 1, category: 'Cocktail', image: 'https://placehold.co/150x150.png' },
];

const mockReceiptTotal = mockReceiptItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

function ReceiptSettings() {
    const { settings, setSettings } = useSettings()
    const { t } = useTranslation()
    const { toast } = useToast()
    const receiptRef = React.useRef<HTMLDivElement>(null)

    const [localSettings, setLocalSettings] = React.useState({
        receiptHeader: settings.receiptHeader,
        receiptFooter: settings.receiptFooter,
        receiptShowWaiter: settings.receiptShowWaiter,
        receiptCustomFields: settings.receiptCustomFields,
        receiptLineSpacing: settings.receiptLineSpacing,
        receiptFont: settings.receiptFont,
    })
    
    React.useEffect(() => {
        setLocalSettings({
            receiptHeader: settings.receiptHeader,
            receiptFooter: settings.receiptFooter,
            receiptShowWaiter: settings.receiptShowWaiter,
            receiptCustomFields: settings.receiptCustomFields,
            receiptLineSpacing: settings.receiptLineSpacing,
            receiptFont: settings.receiptFont,
        })
    }, [settings])

    const handleFieldChange = (index: number, key: 'label' | 'value', value: string) => {
        const newFields = [...localSettings.receiptCustomFields];
        newFields[index][key] = value;
        setLocalSettings(prev => ({...prev, receiptCustomFields: newFields}));
    }

    const addField = () => {
        setLocalSettings(prev => ({...prev, receiptCustomFields: [...prev.receiptCustomFields, { label: 'New Field', value: 'Value' }]}));
    }

    const removeField = (index: number) => {
        setLocalSettings(prev => ({...prev, receiptCustomFields: prev.receiptCustomFields.filter((_, i) => i !== index)}));
    }
    
    const handleSave = async () => {
        const newSettings = { ...settings, ...localSettings }
        await setSettings(newSettings)
        toast({ title: t('toasts.settingsSaved'), description: t('toasts.receiptSettingsDesc')})
    }
    
    const receiptProps = {
        type: 'Receipt' as const,
        orderId: 'PAY-PREVIEW',
        table: 'Table 1',
        items: mockReceiptItems,
        subtotal: mockReceiptTotal,
        total: mockReceiptTotal,
        totalPaid: mockReceiptTotal,
        totalDue: 0,
        amountTendered: mockReceiptTotal,
        change: 0,
        paymentMethod: 'Cash',
        timestamp: new Date(),
        cashierName: 'Jane Doe',
        waiterName: 'John Doe',
        settings: {
            ...settings,
            receiptHeader: localSettings.receiptHeader,
            receiptFooter: localSettings.receiptFooter,
            receiptShowWaiter: localSettings.receiptShowWaiter,
            receiptCustomFields: localSettings.receiptCustomFields,
            receiptLineSpacing: localSettings.receiptLineSpacing,
            receiptFont: localSettings.receiptFont,
        }
    };

    return (
        <>
            <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="receiptHeader">{t('config.receipt.header')}</Label>
                        <Input id="receiptHeader" value={localSettings.receiptHeader} onChange={(e) => setLocalSettings(p => ({...p, receiptHeader: e.target.value}))} />
                        <p className="text-sm text-muted-foreground">{t('config.receipt.headerDesc')}</p>
                    </div>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>{t('config.receipt.customFields')}</Label>
                            <Button variant="ghost" size="sm" onClick={addField}><PlusCircle className="mr-2 h-4 w-4" /> {t('config.receipt.addField')}</Button>
                        </div>
                        <div className="space-y-2">
                            {localSettings.receiptCustomFields.map((field, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input placeholder={t('config.receipt.label')} value={field.label} onChange={e => handleFieldChange(index, 'label', e.target.value)} />
                                    <Input placeholder={t('config.receipt.value')} value={field.value} onChange={e => handleFieldChange(index, 'value', e.target.value)} />
                                    <Button variant="ghost" size="icon" onClick={() => removeField(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="receiptFooter">{t('config.receipt.footer')}</Label>
                        <Input id="receiptFooter" value={localSettings.receiptFooter} onChange={(e) => setLocalSettings(p => ({...p, receiptFooter: e.target.value}))} />
                         <p className="text-sm text-muted-foreground">{t('config.receipt.footerDesc')}</p>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <Label>{t('config.receipt.styling')}</Label>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="receiptShowWaiter" checked={localSettings.receiptShowWaiter} onChange={(e) => setLocalSettings(p => ({...p, receiptShowWaiter: e.target.checked}))} className="h-4 w-4" />
                            <Label htmlFor="receiptShowWaiter">{t('config.receipt.showWaiter')}</Label>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('config.receipt.fontFamily')}</Label>
                             <Select value={localSettings.receiptFont} onValueChange={(v) => setLocalSettings(p => ({...p, receiptFont: v as any}))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mono">{t('config.receipt.fontMono')}</SelectItem>
                                    <SelectItem value="sans">{t('config.receipt.fontSans')}</SelectItem>
                                    <SelectItem value="serif">{t('config.receipt.fontSerif')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('config.receipt.lineSpacing')}</Label>
                            <Slider
                                value={[localSettings.receiptLineSpacing]}
                                onValueChange={([v]) => setLocalSettings(p => ({...p, receiptLineSpacing: v}))}
                                max={2}
                                min={1}
                                step={0.1}
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <Label>{t('config.receipt.preview')}</Label>
                    <div className="mt-2 border rounded-lg p-4 bg-gray-100 dark:bg-gray-800 scale-90 origin-top-left">
                        <Receipt {...receiptProps} ref={receiptRef} />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave}>{t('dialogs.saveChanges')}</Button>
            </CardFooter>
        </>
    )
}

function LoginScreenSettings() {
    const { settings, updateSetting } = useSettings()
    const { t } = useTranslation()
    const { toast } = useToast()
    const { user } = useAuth()
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            try {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('type', 'carousel')
                formData.append('userEmail', user?.email || 'system')
                
                const response = await fetch('/api/settings', {
                    method: 'POST',
                    body: formData
                })
                
                if (response.ok) {
                    const result = await response.json()
                    const newImages = [...(settings.loginCarouselImages || []), result.imagePath]
                    await updateSetting('loginCarouselImages', newImages)
                    toast({ title: "Image Added", description: "New image added to the login screen carousel."})
                } else {
                    throw new Error('Upload failed')
                }
            } catch (error) {
                toast({ 
                    variant: "destructive",
                    title: t('toasts.error'), 
                    description: "Failed to upload image" 
                })
            }
        }
    }

    const removeImage = async (index: number) => {
        const imageToRemove = settings.loginCarouselImages?.[index]
        const newImages = (settings.loginCarouselImages || []).filter((_, i) => i !== index)
        
        // Delete the image file if it's a local upload
        if (imageToRemove && imageToRemove.startsWith('/uploads/')) {
            try {
                await fetch(`/api/settings?imagePath=${encodeURIComponent(imageToRemove)}&userEmail=${encodeURIComponent(user?.email || 'system')}`, {
                    method: 'DELETE'
                })
            } catch (error) {
                console.error('Failed to delete image file:', error)
            }
        }
        
        await updateSetting('loginCarouselImages', newImages)
        toast({ title: "Image Removed", description: "Image removed from the login screen carousel."})
    }
    
    return (
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>{t('config.loginScreen.images')}</Label>
                <p className="text-sm text-muted-foreground">{t('config.loginScreen.imagesDesc')}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(settings.loginCarouselImages || []).map((mediaSrc, index) => {
                    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(mediaSrc);
                    return (
                        <div key={index} className="relative group/img">
                            {isVideo ? (
                                <video
                                    src={mediaSrc}
                                    className="rounded-lg object-cover aspect-video w-full"
                                    muted
                                    loop
                                    autoPlay
                                />
                            ) : (
                                <Image 
                                    src={mediaSrc} 
                                    alt={`Login Background ${index + 1}`} 
                                    width={200} 
                                    height={200}
                                    className="rounded-lg object-cover aspect-video"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                <Button 
                                    variant="destructive" 
                                    size="icon"
                                    onClick={() => removeImage(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
                <div 
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer aspect-video hover:bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <PlusCircle className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm mt-2 text-muted-foreground">{t('config.loginScreen.addImage')}</span>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/mp4,video/webm,video/ogg" onChange={handleImageUpload} />
            </div>
        </CardContent>
    )
}

function FinancialSettings() {
    const { t } = useTranslation()
    const { settings, updateDefaultCurrency, addCurrency, removeCurrency, toggleTax, addTaxRate, updateTaxRate, deleteTaxRate, setDefaultTaxRate, toggleDiscount, addDiscountRule, updateDiscountRule, deleteDiscountRule, toggleDiscountRule } = useSettings()
    const { toast } = useToast()

    // Currency Management
    const [newCurrency, setNewCurrency] = useState<{ code: string; name: string; symbol: string; position: 'before' | 'after' }>({ code: '', name: '', symbol: '', position: 'before' })
    const [showAddCurrency, setShowAddCurrency] = useState(false)

    const handleAddCurrency = async () => {
        if (!newCurrency.code || !newCurrency.name || !newCurrency.symbol) {
            toast({ title: "Error", description: "Please fill in all currency fields", variant: "destructive" })
            return
        }
        
        if (settings.availableCurrencies.some(c => c.code === newCurrency.code)) {
            toast({ title: "Error", description: "Currency code already exists", variant: "destructive" })
            return
        }

        await addCurrency(newCurrency)
        setNewCurrency({ code: '', name: '', symbol: '', position: 'before' })
        setShowAddCurrency(false)
        toast({ title: "Success", description: "Currency added successfully" })
    }

    const handleRemoveCurrency = async (currencyCode: string) => {
        await removeCurrency(currencyCode)
        toast({ title: "Success", description: "Currency removed successfully" })
    }

    // Tax Management
    const [newTaxRate, setNewTaxRate] = useState({ name: '', rate: 0, isDefault: false })
    const [showAddTaxRate, setShowAddTaxRate] = useState(false)

    const handleAddTaxRate = async () => {
        if (!newTaxRate.name || newTaxRate.rate <= 0) {
            toast({ title: "Error", description: "Please fill in all tax rate fields", variant: "destructive" })
            return
        }

        await addTaxRate(newTaxRate)
        setNewTaxRate({ name: '', rate: 0, isDefault: false })
        setShowAddTaxRate(false)
        toast({ title: "Success", description: "Tax rate added successfully" })
    }

    const handleDeleteTaxRate = async (id: string) => {
        await deleteTaxRate(id)
        toast({ title: "Success", description: "Tax rate deleted successfully" })
    }

    // Discount Management
    const [newDiscountRule, setNewDiscountRule] = useState<{ name: string; type: 'percentage' | 'fixed'; value: number; isActive: boolean }>({ name: '', type: 'percentage', value: 0, isActive: true })
    const [showAddDiscountRule, setShowAddDiscountRule] = useState(false)

    const handleAddDiscountRule = async () => {
        if (!newDiscountRule.name || newDiscountRule.value < 0) {
            toast({ title: "Error", description: "Please fill in all discount rule fields", variant: "destructive" })
            return
        }

        await addDiscountRule(newDiscountRule)
        setNewDiscountRule({ name: '', type: 'percentage', value: 0, isActive: true })
        setShowAddDiscountRule(false)
        toast({ title: "Success", description: "Discount rule added successfully" })
    }

    const handleDeleteDiscountRule = async (id: string) => {
        await deleteDiscountRule(id)
        toast({ title: "Success", description: "Discount rule deleted successfully" })
    }

    return (
        <div className="space-y-6">
            {/* Currency Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        {t('settings.currencySettings')}
                    </CardTitle>
                    <CardDescription>
                        Configure the default currency and available currencies for your business.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('settings.defaultCurrency')}</Label>
                        <Select value={settings.defaultCurrency.code} onValueChange={(value) => {
                            const currency = settings.availableCurrencies.find(c => c.code === value)
                            if (currency) updateDefaultCurrency(currency)
                        }}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {settings.availableCurrencies.map((currency) => (
                                    <SelectItem key={currency.code} value={currency.code}>
                                        {currency.symbol} {currency.name} ({currency.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>{t('settings.availableCurrencies')}</Label>
                            <Button variant="outline" size="sm" onClick={() => setShowAddCurrency(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                {t('settings.addCurrency')}
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {settings.availableCurrencies.map((currency) => (
                                <div key={currency.code} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{currency.symbol} {currency.name}</p>
                                        <p className="text-sm text-muted-foreground">{currency.code} • {currency.position === 'before' ? 'Before amount' : 'After amount'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {currency.code === settings.defaultCurrency.code && (
                                            <Badge variant="secondary">Default</Badge>
                                        )}
                                        {currency.code !== 'XAF' && (
                                            <Button variant="outline" size="sm" onClick={() => handleRemoveCurrency(currency.code)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tax Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        {t('settings.taxManagement')}
                    </CardTitle>
                    <CardDescription>
                        Configure tax settings and rates for your business transactions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>{settings.taxEnabled ? t('settings.taxEnabled') : t('settings.taxDisabled')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {settings.taxEnabled ? 'Tax will be applied to transactions' : 'Tax will not be applied to transactions'}
                            </p>
                        </div>
                        <Switch checked={settings.taxEnabled} onCheckedChange={toggleTax} />
                    </div>

                    {settings.taxEnabled && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>{t('settings.taxRates')}</Label>
                                    <Button variant="outline" size="sm" onClick={() => setShowAddTaxRate(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('settings.addTaxRate')}
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {settings.taxRates.map((taxRate) => (
                                        <div key={taxRate.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{taxRate.name}</p>
                                                <p className="text-sm text-muted-foreground">{taxRate.rate}%</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {taxRate.isDefault && (
                                                    <Badge variant="secondary">{t('settings.isDefault')}</Badge>
                                                )}
                                                {!taxRate.isDefault && (
                                                    <Button variant="outline" size="sm" onClick={() => setDefaultTaxRate(taxRate.id)}>
                                                        {t('settings.setAsDefault')}
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" onClick={() => handleDeleteTaxRate(taxRate.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Discount Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        {t('settings.discountManagement')}
                    </CardTitle>
                    <CardDescription>
                        Configure discount rules and settings for your business.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>{settings.discountEnabled ? t('settings.discountEnabled') : t('settings.discountDisabled')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {settings.discountEnabled ? 'Discounts can be applied to transactions' : 'Discounts cannot be applied to transactions'}
                            </p>
                        </div>
                        <Switch checked={settings.discountEnabled} onCheckedChange={toggleDiscount} />
                    </div>

                    {settings.discountEnabled && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>{t('settings.discountRules')}</Label>
                                    <Button variant="outline" size="sm" onClick={() => setShowAddDiscountRule(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('settings.addDiscountRule')}
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {settings.discountRules.map((rule) => (
                                        <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{rule.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {rule.type === 'percentage' ? `${rule.value}%` : `${rule.value} ${settings.defaultCurrency.symbol}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch 
                                                    checked={rule.isActive} 
                                                    onCheckedChange={(checked) => toggleDiscountRule(rule.id, checked)} 
                                                />
                                                <Button variant="outline" size="sm" onClick={() => handleDeleteDiscountRule(rule.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Add Currency Dialog */}
            <Dialog open={showAddCurrency} onOpenChange={setShowAddCurrency}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('settings.addCurrency')}</DialogTitle>
                        <DialogDescription>
                            Add a new currency to your available currencies list.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('settings.currencyCode')}</Label>
                            <Input 
                                value={newCurrency.code} 
                                onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
                                placeholder="USD"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('settings.currencyName')}</Label>
                            <Input 
                                value={newCurrency.name} 
                                onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                                placeholder="United States Dollar"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('settings.currencySymbol')}</Label>
                            <Input 
                                value={newCurrency.symbol} 
                                onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                                placeholder="$"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('settings.symbolPosition')}</Label>
                            <Select value={newCurrency.position} onValueChange={(value: 'before' | 'after') => setNewCurrency({ ...newCurrency, position: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="before">{t('settings.before')}</SelectItem>
                                    <SelectItem value="after">{t('settings.after')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddCurrency(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleAddCurrency}>
                            {t('settings.addCurrency')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Tax Rate Dialog */}
            <Dialog open={showAddTaxRate} onOpenChange={setShowAddTaxRate}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('settings.addTaxRate')}</DialogTitle>
                        <DialogDescription>
                            Add a new tax rate for your business.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('settings.taxRateName')}</Label>
                            <Input 
                                value={newTaxRate.name} 
                                onChange={(e) => setNewTaxRate({ ...newTaxRate, name: e.target.value })}
                                placeholder="Value Added Tax (VAT)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('settings.taxRatePercentage')}</Label>
                            <Input 
                                type="number"
                                value={newTaxRate.rate} 
                                onChange={(e) => setNewTaxRate({ ...newTaxRate, rate: parseFloat(e.target.value) || 0 })}
                                placeholder="19"
                                min="0"
                                max="100"
                                step="0.01"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="isDefault" 
                                checked={newTaxRate.isDefault}
                                onCheckedChange={(checked) => setNewTaxRate({ ...newTaxRate, isDefault: checked as boolean })}
                            />
                            <Label htmlFor="isDefault">{t('settings.setAsDefault')}</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddTaxRate(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleAddTaxRate}>
                            {t('settings.addTaxRate')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Discount Rule Dialog */}
            <Dialog open={showAddDiscountRule} onOpenChange={setShowAddDiscountRule}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('settings.addDiscountRule')}</DialogTitle>
                        <DialogDescription>
                            Add a new discount rule for your business.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('settings.discountRuleName')}</Label>
                            <Input 
                                value={newDiscountRule.name} 
                                onChange={(e) => setNewDiscountRule({ ...newDiscountRule, name: e.target.value })}
                                placeholder="10% Student Discount"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('settings.discountType')}</Label>
                            <Select value={newDiscountRule.type} onValueChange={(value: 'percentage' | 'fixed') => setNewDiscountRule({ ...newDiscountRule, type: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">{t('settings.percentage')}</SelectItem>
                                    <SelectItem value="fixed">{t('settings.fixedAmount')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('settings.discountValue')}</Label>
                            <Input 
                                type="number"
                                value={newDiscountRule.value} 
                                onChange={(e) => setNewDiscountRule({ ...newDiscountRule, value: parseFloat(e.target.value) || 0 })}
                                placeholder={newDiscountRule.type === 'percentage' ? "10" : "1000"}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDiscountRule(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleAddDiscountRule}>
                            {t('settings.addDiscountRule')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function ConfigurationPageContent() {
    const { t } = useTranslation()
    return (
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">
                    <ImageIcon className="mr-2 h-4 w-4" /> {t('config.tabs.general')}
                </TabsTrigger>
                <TabsTrigger value="appearance">
                    <Palette className="mr-2 h-4 w-4" /> {t('config.tabs.appearance')}
                </TabsTrigger>
                <TabsTrigger value="receipt">
                    <FileText className="mr-2 h-4 w-4" /> {t('config.tabs.receipt')}
                </TabsTrigger>
                <TabsTrigger value="financial">
                    <DollarSign className="mr-2 h-4 w-4" /> {t('settings.financial')}
                </TabsTrigger>
                <TabsTrigger value="loginScreen">
                    <Clapperboard className="mr-2 h-4 w-4" /> {t('config.tabs.loginScreen')}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="general">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('config.general.title')}</CardTitle>
                        <CardDescription>{t('config.general.description')}</CardDescription>
                    </CardHeader>
                    <GeneralSettings />
                </Card>
            </TabsContent>
            <TabsContent value="appearance">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('config.appearance.title')}</CardTitle>
                        <CardDescription>{t('config.appearance.description')}</CardDescription>
                    </CardHeader>
                    <AppearanceSettings />
                </Card>
            </TabsContent>
            <TabsContent value="receipt">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('config.receipt.title')}</CardTitle>
                        <CardDescription>{t('config.receipt.description')}</CardDescription>
                    </CardHeader>
                    <ReceiptSettings />
                </Card>
            </TabsContent>
            <TabsContent value="financial">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('settings.financial')}</CardTitle>
                        <CardDescription>{t('settings.financialDesc')}</CardDescription>
                    </CardHeader>
                    <FinancialSettings />
                </Card>
            </TabsContent>
            <TabsContent value="loginScreen">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('config.loginScreen.title')}</CardTitle>
                        <CardDescription>{t('config.loginScreen.description')}</CardDescription>
                    </CardHeader>
                    <LoginScreenSettings />
                </Card>
            </TabsContent>
        </Tabs>
    )
}

export default function ConfigurationPage() {
    const { user } = useAuth()
    const { t } = useTranslation()
    const isAuthorized = user?.role === 'Manager' || user?.role === 'Super Admin'

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen w-full flex-col">
                <Header title={t('config.title')} />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                    <Card className="flex flex-col items-center justify-center p-10 text-center">
                        <CardHeader>
                            <div className="mx-auto bg-muted rounded-full p-4">
                                <Lock className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <CardTitle className="mt-4">{t('dialogs.accessDenied')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{t('dialogs.permissionDenied')}</p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header title={t('config.title')} />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <ConfigurationPageContent />
            </main>
        </div>
    )
}
