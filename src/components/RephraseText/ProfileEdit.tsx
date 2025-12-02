import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { userService } from '../../services/userService';
import { AccessibilityNeed, ReadingLevel, ComplexityLevel } from '../../types';
import { getColorPalette } from '../../utils/colorPalettes';

const ProfileEdit: React.FC = () => {
  const { user, preferences, setUser, setPreferences } = useUser();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    ageRange: '',
    gender: '',
    country: '',
    languagePreference: '',
    accessibilityNeeds: [] as string[],
    selectedAccessibilityTab: '',
    additionalSupport: '',
  });

  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (user && preferences) {
      setFormData({
        name: user.name,
        ageRange: preferences.other_preferences?.ageRange || '',
        gender: preferences.other_preferences?.gender || '',
        country: preferences.other_preferences?.country || '',
        languagePreference: preferences.other_preferences?.languagePreference || '',
        accessibilityNeeds: preferences.other_preferences?.accessibilityNeeds || [],
        selectedAccessibilityTab: preferences.other_preferences?.accessibilityNeeds?.[0] || '',
        additionalSupport: preferences.other_preferences?.additionalSupport || '',
      });
    }
  }, [user, preferences]);

  const accessibilityTabs = [
    { id: 'vision', label: 'Vision', options: ['Normal vision', 'Colorblind', 'Low vision'] },
    { id: 'hearing', label: 'Hearing', options: ['Normal hearing', 'Mild hearing loss', 'Hard of hearing', 'Deaf'] },
    { id: 'smell', label: 'Smell(Olfactory)', options: ['Normal smell', 'Anosmia', 'Hyposmia'] },
    { id: 'taste', label: 'Taste (Gustatory)', options: ['Normal taste', 'Ageusia', 'Hypogeusia'] },
    { id: 'others', label: 'Others', options: ['ADHD', 'Dyslexia', 'Other cognitive'] },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSaveMessage('');

    try {
      // Determine primary accessibility need
      let primaryAccessibilityNeed: AccessibilityNeed = 'none';
      if (formData.accessibilityNeeds.length > 0) {
        const needsMap: Record<string, AccessibilityNeed> = {
          'colorblind': 'colorblind',
          'low-vision': 'low-vision',
          'dyslexia': 'dyslexia',
          'adhd': 'cognitive',
        };
        const firstNeed = formData.accessibilityNeeds[0].toLowerCase().replace(/\s+/g, '-');
        primaryAccessibilityNeed = needsMap[firstNeed] || 'other';
      }

      const preferencesData = {
        accessibility_need: primaryAccessibilityNeed,
        reading_level: preferences?.reading_level || 'intermediate' as ReadingLevel,
        preferred_complexity: preferences?.preferred_complexity || 'moderate' as ComplexityLevel,
        color_palette: getColorPalette(primaryAccessibilityNeed),
        other_preferences: {
          ageRange: formData.ageRange,
          gender: formData.gender,
          country: formData.country,
          languagePreference: formData.languagePreference,
          accessibilityNeeds: formData.accessibilityNeeds,
          additionalSupport: formData.additionalSupport,
        },
      };

      const updatedPreferences = await userService.updatePreferences(user.id, preferencesData);
      setPreferences(updatedPreferences);
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccessibilityNeed = (need: string) => {
    setFormData(prev => ({
      ...prev,
      accessibilityNeeds: prev.accessibilityNeeds.includes(need)
        ? prev.accessibilityNeeds.filter(n => n !== need)
        : [...prev.accessibilityNeeds, need],
    }));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
          <select
            value={formData.ageRange}
            onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100 cursor-not-allowed"
            disabled
          >
            <option value="">Select age range</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45-54">45-54</option>
            <option value="55+">55+</option>
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100 cursor-not-allowed"
            disabled
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100 cursor-not-allowed"
            placeholder="e.g., India"
            disabled
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
          <input
            type="text"
            value={formData.languagePreference}
            onChange={(e) => setFormData({ ...formData, languagePreference: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., English"
          />
        </div>

        {/* Accessibility Needs Tabs */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Accessibility Needs</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {accessibilityTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFormData({ ...formData, selectedAccessibilityTab: tab.id })}
                className={`px-3 py-1 text-xs rounded-full transition ${
                  formData.selectedAccessibilityTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Options for selected tab */}
          {formData.selectedAccessibilityTab && (
            <div className="space-y-2">
              {accessibilityTabs
                .find(t => t.id === formData.selectedAccessibilityTab)
                ?.options.map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.accessibilityNeeds.includes(option)}
                      onChange={() => toggleAccessibilityNeed(option)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
            </div>
          )}
        </div>

        {/* Additional Support */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Anything else that can support you?
          </label>
          <textarea
            value={formData.additionalSupport}
            onChange={(e) => setFormData({ ...formData, additionalSupport: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={3}
            placeholder="Tell us more..."
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary-dark disabled:bg-gray-400 transition"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        {saveMessage && (
          <div className={`text-xs text-center ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {saveMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileEdit;
