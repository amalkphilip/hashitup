
import React from 'react';
import { InventoryItem } from '../types';
import { BellIcon, XMarkIcon } from './icons';

interface NotificationAlertProps {
    expiringItems: InventoryItem[];
    onDismiss: () => void;
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({ expiringItems, onDismiss }) => {
    if (expiringItems.length === 0) return null;

    const itemNames = expiringItems.map(item => item.name).join(', ');

    return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow-sm flex items-start" role="alert">
            <div className="flex-shrink-0">
                <BellIcon className="h-6 w-6" />
            </div>
            <div className="ml-3 flex-grow">
                <p className="font-bold">Heads up! These items are expiring soon:</p>
                <p className="text-sm mt-1">{itemNames}</p>
            </div>
            <div className="ml-auto pl-3">
                <button
                    onClick={onDismiss}
                    className="-mx-1.5 -my-1.5 bg-yellow-100 text-yellow-600 hover:bg-yellow-200 p-1.5 rounded-lg inline-flex h-8 w-8 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-100 focus:ring-yellow-500"
                    aria-label="Dismiss"
                >
                    <span className="sr-only">Dismiss</span>
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default NotificationAlert;
