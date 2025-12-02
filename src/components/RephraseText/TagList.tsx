import React from 'react';
import { Tag, FamiliarityLevel } from '../../types';

interface TagListProps {
  tags: Tag[];
  onTagClick: (tag: Tag) => void;
  colorPalette: Record<string, string>;
}

const TagList: React.FC<TagListProps> = ({ tags, onTagClick, colorPalette }) => {
  const getLevelBadgeColor = (level: FamiliarityLevel) => {
    return colorPalette[level];
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Tags</h3>
      
      {tags.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No tags yet. Select text and tag it to add phrases you want to understand better.
        </p>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              onClick={() => onTagClick(tag)}
              className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">{tag.phrase}</span>
                <span
                  className="px-2 py-1 text-xs rounded-full text-white"
                  style={{ backgroundColor: getLevelBadgeColor(tag.familiarityLevel) }}
                >
                  {tag.familiarityLevel.replace('-', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagList;
