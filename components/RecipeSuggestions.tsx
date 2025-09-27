
import React from 'react';
import { Recipe } from '../types';
import { SparklesIcon } from './icons';

interface RecipeSuggestionsProps {
    recipes: Recipe[];
    isLoading: boolean;
    error: string | null;
    onSelectRecipe: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<{ recipe: Recipe; onSelect: () => void }> = ({ recipe, onSelect }) => (
    <div
        onClick={onSelect}
        className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
        <div className="p-6">
            <h4 className="text-xl font-bold text-gray-800 mb-2">{recipe.recipeName}</h4>
            <p className="text-gray-600 text-sm">{recipe.description}</p>
        </div>
        <div className="px-6 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
            <span className="text-xs font-semibold text-green-700">View Recipe &rarr;</span>
        </div>
    </div>
);


const RecipeSuggestions: React.FC<RecipeSuggestionsProps> = ({ recipes, isLoading, error, onSelectRecipe }) => {
    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg p-6 h-full">
            <div className="flex items-center mb-6">
                <SparklesIcon className="h-7 w-7 text-green-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-800"> Recipe Ideas</h3>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="text-gray-600 mt-4">Generating delicious ideas...</p>
                </div>
            )}

            {error && (
                <div className="flex items-center justify-center h-full min-h-[300px] bg-red-50 p-4 rounded-lg">
                    <p className="text-red-700 text-center font-medium">{error}</p>
                </div>
            )}

            {!isLoading && !error && recipes.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px] bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 font-medium">Ready for some culinary inspiration?</p>
                    <p className="text-gray-500 mt-2">Add items to your inventory, then click "Suggest Recipes" to let us find the perfect meal for you.</p>
                </div>
            )}

            {!isLoading && !error && recipes.length > 0 && (
                <div className="space-y-4">
                    {recipes.map((recipe, index) => (
                        <RecipeCard key={index} recipe={recipe} onSelect={() => onSelectRecipe(recipe)} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecipeSuggestions;
