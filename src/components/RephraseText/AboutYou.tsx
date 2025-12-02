import React from 'react';
import { User, UserPreferences } from '../../types';

interface AboutYouProps {
  user: User | null;
  preferences: UserPreferences | null;
  onEdit: () => void;
}

const AboutYou: React.FC<AboutYouProps> = ({ user, preferences, onEdit }) => {
  if (!user || !preferences) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">About You</h3>
        <p className="text-gray-500 text-sm">No user information available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">About You</h3>
        <button
          onClick={onEdit}
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          Edit
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 uppercase">Name</p>
          <p className="text-sm font-medium text-gray-800">{user.name}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase">Accessibility Need</p>
          <p className="text-sm font-medium text-gray-800 capitalize">
            {preferences.accessibility_need.replace('-', ' ')}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase">Reading Level</p>
          <p className="text-sm font-medium text-gray-800 capitalize">
            {preferences.reading_level}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase">Preferred Complexity</p>
          <p className="text-sm font-medium text-gray-800 capitalize">
            {preferences.preferred_complexity}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutYou;
