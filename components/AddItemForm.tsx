
import React, { useState, useRef } from 'react';
import { InventoryItem } from '../types';
import { PlusIcon, CameraIcon } from './icons';

interface AddItemFormProps {
    onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
    onReceiptScan: (imageData: string, mimeType: string) => void;
    isScanning: boolean;
}

const fileToBase64 = (file: File): Promise<{ mimeType: string, data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && data) {
                resolve({ mimeType, data });
            } else {
                reject(new Error("Could not parse file data."));
            }
        };
        reader.onerror = error => reject(error);
    });
};

const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem, onReceiptScan, isScanning }) => {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !expiryDate) {
            alert("Please fill in at least the item name and expiry date.");
            return;
        };
        onAddItem({ name, quantity, expiryDate });
        setName('');
        setQuantity('');
        setExpiryDate('');
    };

    const handleScanClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const { data, mimeType } = await fileToBase64(file);
                onReceiptScan(data, mimeType);
            } catch (error) {
                console.error("Error processing file:", error);
                alert("Sorry, there was an error processing your receipt image.");
            }
            // Reset file input value to allow re-selection of the same file
            e.target.value = '';
        }
    };


    return (
        <div className="p-6 bg-white rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Items to Inventory</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                    <div className="flex flex-col">
                        <label htmlFor="item-name" className="text-sm font-medium text-gray-600 mb-1">Item Name</label>
                        <input
                            id="item-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Eggs"
                            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="item-quantity" className="text-sm font-medium text-gray-600 mb-1">Quantity</label>
                        <input
                            id="item-quantity"
                            type="text"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="e.g., 1 dozen"
                            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="item-expiry" className="text-sm font-medium text-gray-600 mb-1">Expiry Date</label>
                        <input
                            id="item-expiry"
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center gap-4">
                    <button
                        type="submit"
                        className="w-full sm:w-auto flex-1 flex items-center justify-center bg-green-600 text-white font-semibold p-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Manually
                    </button>
                    <span className="text-gray-400 font-medium text-sm">OR</span>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                    />
                    <button
                        type="button"
                        onClick={handleScanClick}
                        disabled={isScanning}
                        className="w-full sm:w-auto flex-1 flex items-center justify-center bg-sky-600 text-white font-semibold p-2 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-150 ease-in-out disabled:bg-gray-400 disabled:cursor-wait"
                    >
                        {isScanning ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Scanning...
                            </>
                        ) : (
                            <>
                                <CameraIcon className="h-5 w-5 mr-2" />
                                Scan Receipt
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddItemForm;
