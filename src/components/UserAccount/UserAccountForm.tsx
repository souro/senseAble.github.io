import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { AccessibilityNeed, ReadingLevel, ComplexityLevel } from '../../types';
import { getColorPalette } from '../../utils/colorPalettes';
import Button from '../Common/Button';

interface UserAccountFormProps {
  isLoginMode?: boolean;
}

const UserAccountForm: React.FC<UserAccountFormProps> = ({ isLoginMode = false }) => {
  const { user, preferences, setUser, setPreferences } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // User profile fields (for login mode)
    name: '',
    ageRange: '',
    gender: '',
    country: '',
    languagePreference: '',

    // Accessibility needs (two-level selection for login mode)
    accessibilityCategory: '' as string,
    accessibilitySubOption: '' as string,
    additionalSupport: '',

    // Consent
    consentGiven: false,

    // Legacy fields (for profile edit mode)
    email: user?.email || '',
    accessibilityNeed: 'none' as AccessibilityNeed, // For profile edit mode only
    readingLevel: preferences?.reading_level || 'intermediate' as ReadingLevel,
    preferredComplexity: preferences?.preferred_complexity || 'moderate' as ComplexityLevel,
  });

  // Accessibility options structure
  const accessibilityOptions = [
    { id: 'none', label: 'None', options: [] },
    { id: 'vision', label: 'Vision', options: ['Normal vision', 'Colorblind', 'Low vision'] },
    { id: 'hearing', label: 'Hearing', options: ['Normal hearing', 'Mild hearing loss', 'Hard of hearing', 'Deaf'] },
    { id: 'smell', label: 'Smell (Olfactory)', options: ['Normal smell', 'Anosmia', 'Hyposmia'] },
    { id: 'taste', label: 'Taste (Gustatory)', options: ['Normal taste', 'Ageusia', 'Hypogeusia'] },
    { id: 'others', label: 'Others', options: ['ADHD', 'Dyslexia', 'Other cognitive'] },
  ];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to convert category/sub-option to AccessibilityNeed type
  const getAccessibilityNeed = (): AccessibilityNeed => {
    if (formData.accessibilityCategory === 'none' || !formData.accessibilitySubOption) {
      return 'none';
    }

    const subOption = formData.accessibilitySubOption.toLowerCase();
    if (subOption.includes('colorblind')) return 'colorblind';
    if (subOption.includes('low vision')) return 'low-vision';
    if (subOption.includes('dyslexia')) return 'dyslexia';
    if (subOption.includes('adhd') || subOption.includes('cognitive')) return 'cognitive';
    return 'other';
  };

  // Handler to reset sub-option when category changes
  const handleCategoryChange = (category: string) => {
    setFormData({
      ...formData,
      accessibilityCategory: category,
      accessibilitySubOption: '', // Reset sub-option
    });
  };

  // Check if all mandatory fields are filled (for login mode)
  const isFormValid = () => {
    if (isLoginMode) {
      const accessibilityValid = formData.accessibilityCategory !== '' &&
        (formData.accessibilityCategory === 'none' || formData.accessibilitySubOption !== '');

      return (
        formData.name.trim() !== '' &&
        formData.ageRange !== '' &&
        formData.gender !== '' &&
        formData.country !== '' &&
        formData.languagePreference !== '' &&
        accessibilityValid &&
        formData.consentGiven
      );
    }
    return true; // Profile edit mode doesn't need validation
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
    if (preferences) {
      setFormData(prev => ({
        ...prev,
        accessibilityNeed: preferences.accessibility_need || 'none', // For profile edit mode
        readingLevel: preferences.reading_level || 'intermediate',
        preferredComplexity: preferences.preferred_complexity || 'moderate',
        // Load saved profile data from other_preferences
        ageRange: (preferences.other_preferences?.ageRange as string) || '',
        gender: (preferences.other_preferences?.gender as string) || '',
        country: (preferences.other_preferences?.country as string) || '',
        languagePreference: (preferences.other_preferences?.languagePreference as string) || '',
        accessibilityCategory: (preferences.other_preferences?.accessibilityCategory as string) || '',
        accessibilitySubOption: (preferences.other_preferences?.accessibilitySubOption as string) || '',
        additionalSupport: (preferences.other_preferences?.additionalSupport as string) || '',
        consentGiven: preferences.other_preferences?.consentGiven === true,
      }));
    }
  }, [user, preferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('=== SUBMIT STARTED ===');
    console.log('Current user state:', user);
    console.log('Form data:', formData);

    try {
      if (!user) {
        console.log('=== NEW USER REGISTRATION PATH ===');
        
        console.log('Step 1: Calling register API with name:', formData.name);
        
        // Register user with name and profile data
        const registrationData = isLoginMode ? {
          name: formData.name,
          ageRange: formData.ageRange,
          gender: formData.gender,
          country: formData.country,
          languagePreference: formData.languagePreference,
          accessibilityCategory: formData.accessibilityCategory,
          accessibilitySubOption: formData.accessibilitySubOption,
          additionalSupport: formData.additionalSupport,
        } : {
          name: formData.name,
          email: formData.email,
        };

        const newUser = await userService.register(registrationData);

        console.log('Step 2: Register API returned:', newUser);

        if (!newUser || !newUser.id) {
          throw new Error('User object missing id field');
        }

        console.log('Step 3: Calling setUser with:', newUser);
        setUser(newUser);

        // Use the accessibility need from the category/sub-option
        const primaryAccessibilityNeed: AccessibilityNeed = getAccessibilityNeed();

        // Create preferences
        const colorPalette = getColorPalette(primaryAccessibilityNeed);
        console.log('Step 4: Creating preferences for user ID:', newUser.id);
        
        const newPreferences = await userService.updatePreferences(newUser.id, {
          accessibility_need: primaryAccessibilityNeed,
          reading_level: formData.readingLevel,
          preferred_complexity: formData.preferredComplexity,
          color_palette: colorPalette,
          other_preferences: isLoginMode ? {
            ageRange: formData.ageRange,
            gender: formData.gender,
            country: formData.country,
            languagePreference: formData.languagePreference,
            accessibilityCategory: formData.accessibilityCategory,
            accessibilitySubOption: formData.accessibilitySubOption,
            additionalSupport: formData.additionalSupport,
            consentGiven: formData.consentGiven,
          } : undefined,
        });
        
        console.log('Step 5: Preferences created:', newPreferences);
        setPreferences(newPreferences);
        console.log('=== REGISTRATION COMPLETE ===');
      } else {
        console.log('=== UPDATE EXISTING USER PATH ===');
        // Update existing user
        console.log('Step 1: Current user:', user);
        console.log('Step 1a: user.id:', user.id);
        
        if (!user.id) {
          throw new Error('User ID is missing from user object');
        }
        
        console.log('Step 2: Updating profile for user ID:', user.id);
        await userService.updateProfile(user.id, {
          name: formData.name,
          email: formData.email,
        });

        const primaryAccessibilityNeed = getAccessibilityNeed();
        const colorPalette = getColorPalette(primaryAccessibilityNeed);
        console.log('Step 3: Updating preferences for user ID:', user.id);
        const updatedPreferences = await userService.updatePreferences(user.id, {
          accessibility_need: primaryAccessibilityNeed,
          reading_level: formData.readingLevel,
          preferred_complexity: formData.preferredComplexity,
          color_palette: colorPalette,
          other_preferences: {
            ageRange: formData.ageRange,
            gender: formData.gender,
            country: formData.country,
            languagePreference: formData.languagePreference,
            accessibilityCategory: formData.accessibilityCategory,
            accessibilitySubOption: formData.accessibilitySubOption,
            additionalSupport: formData.additionalSupport,
            consentGiven: formData.consentGiven,
          },
        });
        console.log('Step 4: Preferences updated:', updatedPreferences);
        setPreferences(updatedPreferences);
        console.log('=== UPDATE COMPLETE ===');
      }

      console.log('Navigating to rephrase page...');
      navigate('/rephrase');
    } catch (err: any) {
      console.error('=== ERROR CAUGHT ===');
      console.error('Error type:', err.constructor.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('Error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save user information. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('=== SUBMIT FINISHED ===');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: isLoginMode ? '#3B82F6' : '#111827' }}>
            {isLoginMode ? 'Welcome to SenseAble' : 'Update Your Profile'}
          </h2>
          <p className="text-gray-600 mb-8">
            {isLoginMode ? 'Empowering every user with personalized accessibility' : 'Tell us about yourself to personalize your experience'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isLoginMode ? (
              <>
                {/* We'd love to know more about you */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">We'd love to know more about you</h3>

                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ageRange" className="block text-xs font-medium text-gray-700 mb-1">
                        Age Range <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="ageRange"
                        value={formData.ageRange}
                        onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="">Select age range</option>
                        <option value="18-24">18–24</option>
                        <option value="25-34">25–34</option>
                        <option value="35-44">35–44</option>
                        <option value="45-54">45–54</option>
                        <option value="55+">55+</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-xs font-medium text-gray-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="others">Others</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="country" className="block text-xs font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="">Select country</option>
                        <option value="india">India</option>
                        <option value="usa">United States</option>
                        <option value="uk">United Kingdom</option>
                        <option value="canada">Canada</option>
                        <option value="australia">Australia</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="languagePreference" className="block text-xs font-medium text-gray-700 mb-1">
                        Language Preference <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="languagePreference"
                        value={formData.languagePreference}
                        onChange={(e) => setFormData({ ...formData, languagePreference: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="">Select language</option>
                        <option value="english">English</option>
                        <option value="hindi">Hindi</option>
                        <option value="bengali">Bengali</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Accessibility Needs - Label selection with dropdown */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Do you have any accessibility needs? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {accessibilityOptions.map(option => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleCategoryChange(option.id)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition ${
                            formData.accessibilityCategory === option.id
                              ? 'bg-primary text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sub-option dropdown - only show if category is selected and not 'none' */}
                  {formData.accessibilityCategory && formData.accessibilityCategory !== 'none' && (
                    <div>
                      <label htmlFor="accessibilitySubOption" className="block text-xs font-medium text-gray-700 mb-1">
                        Please specify <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="accessibilitySubOption"
                        value={formData.accessibilitySubOption}
                        onChange={(e) => setFormData({ ...formData, accessibilitySubOption: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="">Select option</option>
                        {accessibilityOptions
                          .find(opt => opt.id === formData.accessibilityCategory)
                          ?.options.map(subOption => (
                            <option key={subOption} value={subOption}>{subOption}</option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Additional support */}
                <div>
                  <label htmlFor="additionalSupport" className="block text-xs font-medium text-gray-700 mb-1">
                    Anything else we should know to support you? <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    id="additionalSupport"
                    value={formData.additionalSupport}
                    onChange={(e) => setFormData({ ...formData, additionalSupport: e.target.value })}
                    placeholder="Share any additional information..."
                    rows={2}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                {/* Consent */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consentGiven}
                      onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I consent to my information being stored and used to enhance the system <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>

                {/* Proceed Button */}
                <div className="pt-6 flex justify-center">
                  <Button
                    type="submit"
                    disabled={loading || !isFormValid()}
                    className="px-12"
                  >
                    {loading ? 'Processing...' : 'Proceed'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Profile Edit Mode - Full Form with All Fields */}
                {/* User Profile Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-1">
                      Age Range
                    </label>
                    <select
                      id="ageRange"
                      value={formData.ageRange}
                      onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select age range</option>
                      <option value="18-24">18–24</option>
                      <option value="25-34">25–34</option>
                      <option value="35-44">35–44</option>
                      <option value="45-54">45–54</option>
                      <option value="55+">55+</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Others</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select country</option>
                      <option value="india">India</option>
                      <option value="usa">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="canada">Canada</option>
                      <option value="australia">Australia</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="languagePreference" className="block text-sm font-medium text-gray-700 mb-1">
                      Language Preference
                    </label>
                    <select
                      id="languagePreference"
                      value={formData.languagePreference}
                      onChange={(e) => setFormData({ ...formData, languagePreference: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select language</option>
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="bengali">Bengali</option>
                    </select>
                  </div>
                </div>

                {/* Legacy Accessibility Preferences */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Display Preferences</h3>
                  
                  <div>
                    <label htmlFor="accessibilityNeed" className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Accessibility Mode
                    </label>
                    <select
                      id="accessibilityNeed"
                      value={formData.accessibilityNeed}
                      onChange={(e) => setFormData({ ...formData, accessibilityNeed: e.target.value as AccessibilityNeed })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="none">None</option>
                      <option value="colorblind">Colorblind</option>
                      <option value="dyslexia">Dyslexia</option>
                      <option value="low-vision">Low Vision</option>
                      <option value="cognitive">Cognitive</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="readingLevel" className="block text-sm font-medium text-gray-700 mb-1">
                      Reading Level
                    </label>
                    <select
                      id="readingLevel"
                      value={formData.readingLevel}
                      onChange={(e) => setFormData({ ...formData, readingLevel: e.target.value as ReadingLevel })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="basic">Basic</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="preferredComplexity" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Text Complexity
                    </label>
                    <select
                      id="preferredComplexity"
                      value={formData.preferredComplexity}
                      onChange={(e) => setFormData({ ...formData, preferredComplexity: e.target.value as ComplexityLevel })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="simple">Simple - Easy to understand</option>
                      <option value="moderate">Moderate - Balanced</option>
                      <option value="complex">Complex - Detailed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/rephrase')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserAccountForm;
