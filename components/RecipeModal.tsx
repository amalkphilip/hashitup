import React from 'react';
import { Recipe } from '../types';
import { XMarkIcon, CheckCircleIcon } from './icons';

interface RecipeModalProps {
    recipe: Recipe | null;
    onClose: () => void;
    onMarkAsCooked: (recipe: Recipe) => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose, onMarkAsCooked }) => {
    if (!recipe) return null;

    const handleConfirm = () => {
        onMarkAsCooked(recipe);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 md:p-8 flex-grow overflow-y-auto">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">{recipe.recipeName}</h2>
                            <p className="text-gray-600 mt-2">{recipe.description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                        <div className="md:col-span-1">
                            <h3 className="text-xl font-semibold text-gray-800 border-b-2 border-green-500 pb-2 mb-3">Ingredients</h3>
                            <ul className="space-y-2 list-disc list-inside text-gray-700">
                                {recipe.ingredients.map((ingredient, index) => (
                                    <li key={index}>{ingredient}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="md:col-span-2">
                            <h3 className="text-xl font-semibold text-gray-800 border-b-2 border-green-500 pb-2 mb-3">Instructions</h3>
                            <ol className="space-y-4 text-gray-700">
                                {recipe.instructions.map((step, index) => (
                                    <li key={index} className="flex">
                                        <span className="bg-green-600 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 mt-1">{index + 1}</span>
                                        <p>{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
                 <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-4 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center gap-2"
                    >
                        <CheckCircleIcon className="h-5 w-5" />
                        Mark as Cooked & Update Inventory
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

export default RecipeModal;