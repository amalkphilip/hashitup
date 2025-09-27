import React from 'react';
import { InventoryItem } from '../types';
import { TrashIcon, ExclamationTriangleIcon } from './icons';
import { getDaysUntilExpiry } from '../utils/dateUtils';

const getStatus = (days: number): { text: string; colorClasses: string; showWarningIcon: boolean } => {
    if (days < 0) return { text: `Expired ${-days} day(s) ago`, colorClasses: 'bg-red-100 border-red-400 text-red-800', showWarningIcon: true };
    if (days === 0) return { text: 'Expires today', colorClasses: 'bg-red-100 border-red-400 text-red-800', showWarningIcon: true };
    if (days <= 2) return { text: `Expires in ${days} day(s)`, colorClasses: 'bg-yellow-100 border-yellow-400 text-yellow-800', showWarningIcon: true };
    return { text: `Expires in ${days} day(s)`, colorClasses: 'bg-green-100 border-green-400 text-green-800', showWarningIcon: false };
};

const InventoryListItem: React.FC<{ item: InventoryItem; onDelete: () => void }> = ({ item, onDelete }) => {
    const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
    const status = getStatus(daysUntilExpiry);

    return (
        <li className={`flex items-center justify-between p-4 rounded-lg border ${status.colorClasses}`}>
            <div className="flex items-center">
                {status.showWarningIcon && (
                    <ExclamationTriangleIcon className="h-6 w-6 mr-3" aria-hidden="true" />
                )}
                <div>
                    <p className="font-semibold text-lg">{item.name}</p>
                    <p className="text-sm">{item.quantity}</p>
                </div>
            </div>
            <div className="text-right flex items-center">
                <p className="font-medium mr-4">{status.text}</p>
                <button
                    onClick={onDelete}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                    aria-label={`Delete ${item.name}`}
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </li>
    );
};

interface InventoryListProps {
    items: InventoryItem[];
    onDeleteItem: (id: string) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ items, onDeleteItem }) => {
    if (items.length === 0) {
        return (
            <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-700">Your inventory is empty!</h3>
                <p className="text-gray-500 mt-2">Add items using the form above to get started.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Inventory</h3>
            <ul className="space-y-3">
                {items.map(item => (
                    <InventoryListItem key={item.id} item={item} onDelete={() => onDeleteItem(item.id)} />
                ))}
            </ul>
        </div>
    );
};

export default InventoryList;