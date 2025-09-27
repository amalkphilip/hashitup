import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem, Recipe, ScannedItem } from './types';
import { getRecipeSuggestions, parseReceiptFromImage } from './services/geminiService';
import Header from './components/Header';
import AddItemForm from './components/AddItemForm';
import InventoryList from './components/InventoryList';
import RecipeSuggestions from './components/RecipeSuggestions';
import RecipeModal from './components/RecipeModal';
import ReceiptConfirmationModal from './components/ReceiptConfirmationModal';
import ConsumptionChart from './components/ConsumptionChart';
import { SparklesIcon } from './components/icons';
import Settings from './components/Settings';
import NotificationAlert from './components/NotificationAlert';
import { getDaysUntilExpiry } from './utils/dateUtils';

const getInitialDate = (offsetDays: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().split('T')[0];
};

const INITIAL_INVENTORY: InventoryItem[] = [
    { id: '1', name: 'Chicken Breasts', quantity: '2 lbs', expiryDate: getInitialDate(3) },
    { id: '2', name: 'Broccoli', quantity: '1 head', expiryDate: getInitialDate(5) },
    { id: '3', name: 'Bell Peppers', quantity: '2', expiryDate: getInitialDate(7) },
    { id: '4', name: 'Yogurt', quantity: '500g', expiryDate: getInitialDate(1) },
];


const App: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
    const [consumedHistory, setConsumedHistory] = useState<InventoryItem[]>([]);

    const [reminderThreshold, setReminderThreshold] = useState<number>(3);
    const [isAlertVisible, setIsAlertVisible] = useState<boolean>(true);

    const expiringItems = useMemo(() => {
        return inventory.filter(item => {
            const days = getDaysUntilExpiry(item.expiryDate);
            return days >= 0 && days <= reminderThreshold;
        });
    }, [inventory, reminderThreshold]);

    const expiringItemIds = useMemo(() => expiringItems.map(i => i.id).join(','), [expiringItems]);
    
    useEffect(() => {
        if (expiringItems.length > 0) {
            setIsAlertVisible(true);
        }
    }, [expiringItemIds]);

    const handleAddItem = (item: Omit<InventoryItem, 'id'>) => {
        const newItem: InventoryItem = {
            ...item,
            id: new Date().getTime().toString(),
        };
        setInventory(prev => [...prev, newItem].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()));
    };

    const handleDeleteItem = (id: string) => {
        setInventory(prev => prev.filter(item => item.id !== id));
    };

    const handleGetRecipes = async () => {
        if (inventory.length === 0) {
            setError("Please add some items to your inventory first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setRecipes([]);
        try {
            const suggestions = await getRecipeSuggestions(inventory);
            setRecipes(suggestions);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReceiptScan = async (imageData: string, mimeType: string) => {
        setIsScanning(true);
        setError(null);
        try {
            const items = await parseReceiptFromImage(imageData, mimeType);
            if(items.length === 0) {
                alert("The AI couldn't find any food items on the receipt. Please try another image.");
                return;
            }
            setScannedItems(items);
            setShowConfirmationModal(true);
        } catch (e: any) {
             setError(e.message || "An unknown error occurred during scanning.");
             alert(e.message || "An unknown error occurred during scanning.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleConfirmScannedItems = (items: Omit<InventoryItem, 'id'>[]) => {
        const newItems: InventoryItem[] = items.map(item => ({
            ...item,
            id: `${new Date().getTime()}-${item.name}`,
        }));

        setShowConfirmationModal(false);
        setScannedItems([]);
    };

    const handleMarkAsCooked = (recipe: Recipe) => {
        const usedItems: InventoryItem[] = [];
        const remainingInventory = inventory.filter(inventoryItem => {
             const isUsed = recipe.ingredients.some(ingredient => 
                ingredient.toLowerCase().includes(inventoryItem.name.toLowerCase())
            );
            if (isUsed) {
                usedItems.push(inventoryItem);
            }
            return !isUsed;
        });

        setInventory(remainingInventory);
        setConsumedHistory(prev => [...prev, ...usedItems]);
        setSelectedRecipe(null); // Close the modal
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
            <Header />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Column: Inventory Management */}
                    <div className="lg:col-span-2 space-y-8">
                        <Settings 
                            reminderThreshold={reminderThreshold}
                            onThresholdChange={setReminderThreshold}
                        />
                        <AddItemForm 
                            onAddItem={handleAddItem} 
                            onReceiptScan={handleReceiptScan}
                            isScanning={isScanning}
                        />
                         {isAlertVisible && expiringItems.length > 0 && (
                            <NotificationAlert
                                expiringItems={expiringItems}
                                onDismiss={() => setIsAlertVisible(false)}
                            />
                        )}
                        <InventoryList items={inventory} onDeleteItem={handleDeleteItem} />
                        <ConsumptionChart consumedItems={consumedHistory} />
                    </div>

                    {/* Right Column: AI Suggestions */}
                    <div className="lg:col-span-1 lg:sticky lg:top-8">
                        <RecipeSuggestions
                            recipes={recipes}
                            isLoading={isLoading}
                            error={error}
                            onSelectRecipe={setSelectedRecipe}
                        />
                        <div className="mt-6">
                            <button
                                onClick={handleGetRecipes}
                                disabled={isLoading || inventory.length === 0}
                                className="w-full flex items-center justify-center bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300"
                            >
                                <SparklesIcon className="h-6 w-6 mr-2" />
                                {isLoading ? 'Thinking...' : 'Suggest Recipes'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <RecipeModal 
                recipe={selectedRecipe} 
                onClose={() => setSelectedRecipe(null)} 
                onMarkAsCooked={handleMarkAsCooked}
            />
            <ReceiptConfirmationModal
                isOpen={showConfirmationModal}
                items={scannedItems}
                onConfirm={handleConfirmScannedItems}
                onClose={() => setShowConfirmationModal(false)}
            />
        </div>
    );
};

export default App;
