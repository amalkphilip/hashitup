
import React, { useState, useEffect } from 'react';
import { ScannedItem, InventoryItem } from '../types';
import { XMarkIcon, TrashIcon } from './icons';

interface EditableItem extends Omit<InventoryItem, 'id'> {
    key: string;
}

interface ReceiptConfirmationModalProps {
    isOpen: boolean;
    items: ScannedItem[];
    onConfirm: (items: Omit<InventoryItem, 'id'>[]) => void;
    onClose: () => void;
}

const getFutureDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

const ReceiptConfirmationModal: React.FC<ReceiptConfirmationModalProps> = ({ isOpen, items, onConfirm, onClose }) => {
    const [editableItems, setEditableItems] = useState<EditableItem[]>([]);

    useEffect(() => {
        if (items.length > 0) {
            setEditableItems(items.map((item, index) => ({
                ...item,
                expiryDate: getFutureDate(7), // Default to 1 week expiry
                key: `${new Date().getTime()}-${index}`
            })));
        }
    }, [items]);

    if (!isOpen) return null;

    const handleItemChange = (key: string, field: keyof Omit<EditableItem, 'key'>, value: string) => {
        setEditableItems(currentItems =>
            currentItems.map(item =>
                item.key === key ? { ...item, [field]: value } : item
            )
        );
    };

    const handleDeleteItem = (key: string) => {
        setEditableItems(currentItems => currentItems.filter(item => item.key !== key));
    };

    const handleConfirm = () => {
        const itemsToConfirm = editableItems.map(({ key, ...rest }) => rest);
        onConfirm(itemsToConfirm);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Confirm Scanned Items</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto space-y-3">
                    <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg">
                        AI has scanned your receipt. Please review the items below, set their expiry dates, and make any corrections before adding them to your inventory.
                    </p>
                    {editableItems.map((item) => (
                        <div key={item.key} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-md">
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleItemChange(item.key, 'name', e.target.value)}
                                placeholder="Item Name"
                                className="col-span-4 p-2 border border-gray-300 rounded-md"
                            />
                            <input
                                type="text"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(item.key, 'quantity', e.target.value)}
                                placeholder="Quantity"
                                className="col-span-3 p-2 border border-gray-300 rounded-md"
                            />
                            <input
                                type="date"
                                value={item.expiryDate}
                                onChange={(e) => handleItemChange(item.key, 'expiryDate', e.target.value)}
                                className="col-span-4 p-2 border border-gray-300 rounded-md"
                                min={new Date().toISOString().split("T")[0]}
                            />
                            <div className="col-span-1 flex justify-end">
                                <button
                                    onClick={() => handleDeleteItem(item.key)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition"
                                    aria-label={`Delete ${item.name}`}
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {editableItems.length === 0 && <p className="text-center text-gray-500 py-4">No items to confirm.</p>}
                </div>
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-4 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={editableItems.length === 0}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {`Confirm & Add ${editableItems.length} Item(s)`}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ReceiptConfirmationModal;
