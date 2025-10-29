'use client';
import { useState, useEffect } from 'react';

import {
    Settings,
    Save,
    RefreshCw,
    Shield,
    Database,
    Mail,
    Bell,
    Globe,
    Lock,
    Unlock,
    Users,
    BookOpen,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Download,
    Upload,
    Trash2,
    Edit,
    Plus,
    Minus,
    Server,
    Cpu,
    HardDrive,
    Wifi,
    Zap,
    Clock,
    Calendar,
    Key,
    User,
    MessageSquare,
    FileText,
    Archive,
    Search,
    Filter,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import {adminService} from "../../../../lib/services/adminApi";
import {useAuth} from "../../../../contexts/AuthContext";

interface SystemSettings {
    general: {
        siteName: string;
        siteDescription: string;
        maintenanceMode: boolean;
        registrationEnabled: boolean;
        emailVerificationRequired: boolean;
    };
    security: {
        passwordMinLength: number;
        passwordRequireSpecialChars: boolean;
        sessionTimeout: number;
        maxLoginAttempts: number;
        mfaRequired: boolean;
        ipWhitelist: string[];
    };
    email: {
        smtpHost: string;
        smtpPort: number;
        smtpUser: string;
        smtpPassword: string;
        fromEmail: string;
        fromName: string;
    };
    backup: {
        autoBackupEnabled: boolean;
        backupFrequency: string;
        retentionDays: number;
        backupLocation: string;
    };
    notifications: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        adminNotifications: boolean;
        userNotifications: boolean;
    };
}

export default function AdminSettings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SystemSettings>({
        general: {
            siteName: 'EduLearn Platform',
            siteDescription: 'Advanced Learning Management System',
            maintenanceMode: false,
            registrationEnabled: true,
            emailVerificationRequired: true
        },
        security: {
            passwordMinLength: 8,
            passwordRequireSpecialChars: true,
            sessionTimeout: 24,
            maxLoginAttempts: 5,
            mfaRequired: false,
            ipWhitelist: []
        },
        email: {
            smtpHost: '',
            smtpPort: 587,
            smtpUser: '',
            smtpPassword: '',
            fromEmail: '',
            fromName: ''
        },
        backup: {
            autoBackupEnabled: true,
            backupFrequency: 'daily',
            retentionDays: 30,
            backupLocation: '/backups'
        },
        notifications: {
            emailNotifications: true,
            pushNotifications: true,
            adminNotifications: true,
            userNotifications: true
        }
    });
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'email' | 'backup' | 'notifications' | 'system'>('general');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['general']));
    const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
    const [systemInfo, setSystemInfo] = useState<any>(null);

    useEffect(() => {
        fetchSettings();
        fetchSystemInfo();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            // In a real app, this would fetch from your backend
            // const response = await adminService.getSettings();
            // setSettings(response);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemInfo = async () => {
        try {
            const metrics = await adminService.getMetrics();
            setSystemInfo(metrics);
        } catch (error) {
            console.error('Error fetching system info:', error);
        }
    };

    const saveSettings = async () => {
        try {
            setSaving(true);
            // In a real app, this would save to your backend
            // await adminService.updateSettings(settings);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const togglePasswordVisibility = (field: string) => {
        const newShowPasswords = new Set(showPasswords);
        if (newShowPasswords.has(field)) {
            newShowPasswords.delete(field);
        } else {
            newShowPasswords.add(field);
        }
        setShowPasswords(newShowPasswords);
    };

    const updateSetting = (category: keyof SystemSettings, field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const addIpToWhitelist = () => {
        const ip = prompt('Enter IP address to whitelist:');
        if (ip && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
            updateSetting('security', 'ipWhitelist', [...settings.security.ipWhitelist, ip]);
        } else if (ip) {
            alert('Please enter a valid IP address');
        }
    };

    const removeIpFromWhitelist = (index: number) => {
        const newList = settings.security.ipWhitelist.filter((_, i) => i !== index);
        updateSetting('security', 'ipWhitelist', newList);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Settings className="w-6 h-6 text-blue-600 mr-2" />
                            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={fetchSettings}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset
                            </button>
                            <button
                                onClick={saveSettings}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                            >
                                {saving ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                    {(['general', 'security', 'email', 'backup', 'notifications', 'system'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md font-medium text-sm transition-all capitalize ${
                                activeTab === tab
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* General Settings */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                                <button
                                    onClick={() => toggleSection('general')}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    {expandedSections.has('general') ?
                                        <ChevronUp className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                            </div>

                            {expandedSections.has('general') && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Site Name
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.general.siteName}
                                                onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Site Description
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.general.siteDescription}
                                                onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                                                <p className="text-sm text-gray-500">Enable maintenance mode to restrict access</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.general.maintenanceMode}
                                                    onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900">User Registration</h4>
                                                <p className="text-sm text-gray-500">Allow new users to register</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.general.registrationEnabled}
                                                    onChange={(e) => updateSetting('general', 'registrationEnabled', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Email Verification Required</h4>
                                                <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.general.emailVerificationRequired}
                                                    onChange={(e) => updateSetting('general', 'emailVerificationRequired', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                                <Shield className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Password Length
                                        </label>
                                        <input
                                            type="number"
                                            min="6"
                                            max="32"
                                            value={settings.security.passwordMinLength}
                                            onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Session Timeout (hours)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="168"
                                            value={settings.security.sessionTimeout}
                                            onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Require Special Characters</h4>
                                            <p className="text-sm text-gray-500">Passwords must contain special characters</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.security.passwordRequireSpecialChars}
                                                onChange={(e) => updateSetting('security', 'passwordRequireSpecialChars', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">MFA Required</h4>
                                            <p className="text-sm text-gray-500">Require multi-factor authentication for all users</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.security.mfaRequired}
                                                onChange={(e) => updateSetting('security', 'mfaRequired', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium text-gray-900">IP Whitelist</h4>
                                        <button
                                            onClick={addIpToWhitelist}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add IP
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {settings.security.ipWhitelist.map((ip, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                <span className="text-sm font-mono text-gray-900">{ip}</span>
                                                <button
                                                    onClick={() => removeIpFromWhitelist(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {settings.security.ipWhitelist.length === 0 && (
                                            <p className="text-sm text-gray-500 text-center py-4">No IP addresses whitelisted</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Email Settings */}
                {activeTab === 'email' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
                                <button
                                    onClick={() => toggleSection('email')}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    {expandedSections.has('email') ?
                                        <ChevronUp className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                            </div>

                            {expandedSections.has('email') && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                SMTP Host
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.email.smtpHost}
                                                onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="smtp.gmail.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                SMTP Port
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.email.smtpPort}
                                                onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="587"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                SMTP Username
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.email.smtpUser}
                                                onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="your-email@gmail.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                SMTP Password
                                            </label>
                                            <input
                                                type="password"
                                                value={settings.email.smtpPassword}
                                                onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                From Email
                                            </label>
                                            <input
                                                type="email"
                                                value={settings.email.fromEmail}
                                                onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="noreply@edulearn.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                From Name
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.email.fromName}
                                                onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="EduLearn Platform"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <Mail className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-medium text-blue-900">Email Configuration</h4>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    Configure your SMTP settings to enable email notifications and user communications.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Backup Settings */}
                {activeTab === 'backup' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Backup Configuration</h3>
                                <button
                                    onClick={() => toggleSection('backup')}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    {expandedSections.has('backup') ?
                                        <ChevronUp className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                            </div>

                            {expandedSections.has('backup') && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Auto Backup</h4>
                                            <p className="text-sm text-gray-500">Enable automatic database backups</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.backup.autoBackupEnabled}
                                                onChange={(e) => updateSetting('backup', 'autoBackupEnabled', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Backup Frequency
                                            </label>
                                            <select
                                                value={settings.backup.backupFrequency}
                                                onChange={(e) => updateSetting('backup', 'backupFrequency', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Retention Days
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.backup.retentionDays}
                                                onChange={(e) => updateSetting('backup', 'retentionDays', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="30"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Backup Location
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.backup.backupLocation}
                                            onChange={(e) => updateSetting('backup', 'backupLocation', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="/backups"
                                        />
                                    </div>

                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <Database className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-medium text-green-900">Backup Management</h4>
                                                <p className="text-sm text-green-700 mt-1">
                                                    Regular backups ensure data safety and quick recovery in case of system issues.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                                <button
                                    onClick={() => toggleSection('notifications')}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    {expandedSections.has('notifications') ?
                                        <ChevronUp className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                            </div>

                            {expandedSections.has('notifications') && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                                                <p className="text-sm text-gray-500">Send notifications via email</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.notifications.emailNotifications}
                                                    onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                                                <p className="text-sm text-gray-500">Send push notifications to users</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.notifications.pushNotifications}
                                                    onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Admin Notifications</h4>
                                                <p className="text-sm text-gray-500">Send notifications to administrators</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.notifications.adminNotifications}
                                                    onChange={(e) => updateSetting('notifications', 'adminNotifications', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900">User Notifications</h4>
                                                <p className="text-sm text-gray-500">Send notifications to regular users</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.notifications.userNotifications}
                                                    onChange={(e) => updateSetting('notifications', 'userNotifications', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <Bell className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-medium text-purple-900">Notification Management</h4>
                                                <p className="text-sm text-purple-700 mt-1">
                                                    Configure how and when notifications are sent to users and administrators.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* System Information */}
                {activeTab === 'system' && systemInfo && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <Users className="w-5 h-5 text-blue-600 mr-2" />
                                        <h4 className="font-medium text-gray-900">Users</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{systemInfo.users.total}</p>
                                    <p className="text-sm text-gray-500">Total registered</p>
                                </div>

                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <Shield className="w-5 h-5 text-green-600 mr-2" />
                                        <h4 className="font-medium text-gray-900">Security</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{systemInfo.security.failedLogins24h}</p>
                                    <p className="text-sm text-gray-500">Failed logins (24h)</p>
                                </div>

                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <Clock className="w-5 h-5 text-purple-600 mr-2" />
                                        <h4 className="font-medium text-gray-900">Activity</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{systemInfo.security.activeUsers7d}</p>
                                    <p className="text-sm text-gray-500">Active users (7d)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
