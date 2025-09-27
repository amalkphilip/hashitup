
import React from 'react';
import { Cog6ToothIcon } from './icons';

interface SettingsProps {
    reminderThreshold: number;
    onThresholdChange: (days: number) => void;
}

const THRESHOLD_OPTIONS = [1, 3, 7];

const Settings: React.FC<SettingsProps> = ({ reminderThreshold, onThresholdChange }) => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center mb-4">
                <Cog6ToothIcon className="h-6 w-6 text-gray-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Notification Settings</h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <p className="text-gray-600 mb-2 sm:mb-0">Remind me when items expire in:</p>
                <div className="flex space-x-2">
                    {THRESHOLD_OPTIONS.map((days) => (
                        <button
                            key={days}
                            onClick={() => onThresholdChange(days)}
                            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                                reminderThreshold === days
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {days} Day{days > 1 ? 's' : ''}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Settings;
