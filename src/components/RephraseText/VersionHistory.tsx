import React from 'react';

interface VersionHistoryProps {
  versions: Array<{ version: number; text: string; timestamp: string }>;
  currentVersion: number;
  onSelectVersion: (version: number) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentVersion,
  onSelectVersion,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Version History</h3>

      {versions.length === 0 ? (
        <p className="text-gray-500 text-sm">No versions yet</p>
      ) : (
        <div className="space-y-2">
          {versions.map((v) => (
            <div
              key={v.version}
              onClick={() => onSelectVersion(v.version)}
              className={`p-3 border rounded-lg cursor-pointer transition ${
                currentVersion === v.version
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">Version {v.version}</span>
                <span className="text-xs text-gray-500">
                  {new Date(v.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{v.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
