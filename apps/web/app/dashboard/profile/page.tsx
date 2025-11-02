'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Globe, Clock, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { UpdateProfileDto } from '@/lib/api/services/profile';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  const [formData, setFormData] = useState<UpdateProfileDto>({
    displayName: '',
    bio: '',
    timezone: '',
    language: 'en',
    preferences: {
      theme: 'dark',
      notifications: true,
      weekStartsOn: 0,
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        timezone: profile.timezone || '',
        language: profile.language || 'en',
        preferences: {
          theme: profile.preferences?.theme || 'dark',
          notifications: profile.preferences?.notifications ?? true,
          weekStartsOn: profile.preferences?.weekStartsOn ?? 0,
        },
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Profile</h1>
        <p className="text-sm sm:text-base text-gray-400">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-semibold mb-3 sm:mb-4">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-1">
                {formData.displayName || 'User'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 text-center break-all px-2">{user?.email}</p>

              <div className="w-full pt-3 sm:pt-4 border-t border-gray-700">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-300 truncate">{user?.email}</span>
                  </div>
                  {formData.timezone && (
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300 truncate">{formData.timezone}</span>
                    </div>
                  )}
                  {formData.language && (
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300">{formData.language.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Profile Settings</h3>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Personal Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) =>
                        setFormData({ ...formData, displayName: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              </div>

              {/* Regional Settings */}
              <div className="pt-4 sm:pt-6 border-t border-gray-700">
                <h4 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Regional Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select timezone</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="America/Sao_Paulo">Brasília Time (BRT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Asia/Shanghai">Shanghai (CST)</option>
                      <option value="Australia/Sydney">Sydney (AEST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="pt-4 sm:pt-6 border-t border-gray-700">
                <h4 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Preferences</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                    <select
                      value={formData.preferences?.theme}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            theme: e.target.value as 'light' | 'dark',
                          },
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Week Starts On
                    </label>
                    <select
                      value={formData.preferences?.weekStartsOn}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            weekStartsOn: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="0">Sunday</option>
                      <option value="1">Monday</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.notifications ?? true}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences,
                              notifications: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-300">Enable notifications</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 sm:pt-6 border-t border-gray-700">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>

                {updateMutation.isSuccess && (
                  <p className="mt-3 text-sm text-green-400">Profile updated successfully!</p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
