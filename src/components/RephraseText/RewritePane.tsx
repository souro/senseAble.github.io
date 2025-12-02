import React, { useState } from 'react';
import Button from '../Common/Button';

interface RewritePaneProps {
  gentleRewrite: string;
  fullRewrite: string;
  onAccept: (version: 'gentle' | 'full', text: string) => void;
}

const RewritePane: React.FC<RewritePaneProps> = ({
  gentleRewrite,
  fullRewrite,
  onAccept,
}) => {
  const [activeVersion, setActiveVersion] = useState<'gentle' | 'full'>('gentle');

  const handleAccept = () => {
    const text = activeVersion === 'gentle' ? gentleRewrite : fullRewrite;
    onAccept(activeVersion, text);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-gray-800">Rewritten Versions</h2>
      </div>

      {/* Version Tabs */}
      <div className="flex gap-2 mb-3 border-b">
        <button
          onClick={() => setActiveVersion('gentle')}
          className={`px-3 py-2 text-xs font-medium transition ${
            activeVersion === 'gentle'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Gentle Rewrite
        </button>
        <button
          onClick={() => setActiveVersion('full')}
          className={`px-3 py-2 text-xs font-medium transition ${
            activeVersion === 'full'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Full Rewrite
        </button>
      </div>

      {/* Version Note */}
      <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
        <p className="text-xs text-blue-700">
          {activeVersion === 'gentle'
            ? '💡 Gentle modifications with minimal changes based on tagged phrases'
            : '💡 Comprehensive rewrite with deeper content modifications'}
        </p>
      </div>

      {/* Rewritten Text Display */}
      <div className="min-h-[300px] p-3 bg-gray-50 rounded-lg mb-3">
        <div className="prose max-w-none">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {activeVersion === 'gentle' ? gentleRewrite : fullRewrite}
          </div>
        </div>
      </div>

      {/* Accept Button */}
      <div className="flex justify-center">
        <Button onClick={handleAccept} className="px-8">
          Accept {activeVersion === 'gentle' ? 'Gentle' : 'Full'} Rewrite
        </Button>
      </div>
    </div>
  );
};

export default RewritePane;
