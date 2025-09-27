
import React, { useState, useEffect, useMemo } from 'react';
import { InventoryItem, CategorizedItem } from '../types';
import { categorizeItems } from '../services/geminiService';
import { ChartPieIcon } from './icons';

interface ConsumptionChartProps {
    consumedItems: InventoryItem[];
}

const CATEGORY_COLORS: { [key: string]: string } = {
    'Vegetable': '#22c55e', // green-500
    'Meat & Fish': '#ef4444', // red-500
    'Fruit': '#f97316', // orange-500
    'Dairy & Eggs': '#fde047', // yellow-300
    'Grains & Carbs': '#d2b48c', // tan
    'Pantry Staples': '#a16207', // yellow-700
    'Beverages': '#3b82f6', // blue-500
    'Other': '#9ca3af', // gray-400
};

interface ChartData {
    [category: string]: number;
}

const PieChart: React.FC<{ data: ChartData }> = ({ data }) => {
    // FIX: Cast value to number to allow addition.
    const total = Object.values(data).reduce((sum, value) => sum + (value as number), 0);
    if (total === 0) return null;

    let cumulativePercent = 0;

    const slices = Object.entries(data).map(([category, value]) => {
        // FIX: Cast value to number for arithmetic operation.
        const percent = (value as number) / total;
        const startAngle = cumulativePercent * 360;
        cumulativePercent += percent;
        const endAngle = cumulativePercent * 360;

        const getCoords = (angle: number) => {
            const radians = (angle - 90) * Math.PI / 180;
            return [
                50 + 40 * Math.cos(radians),
                50 + 40 * Math.sin(radians)
            ];
        };

        const [startX, startY] = getCoords(startAngle);
        const [endX, endY] = getCoords(endAngle);

        const largeArcFlag = percent > 0.5 ? 1 : 0;

        const pathData = [
            `M 50 50`, // Move to center
            `L ${startX} ${startY}`, // Line to start of arc
            `A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
            `Z` // Close path
        ].join(' ');

        return <path key={category} d={pathData} fill={CATEGORY_COLORS[category] || CATEGORY_COLORS['Other']} />;
    });

    return <svg viewBox="0 0 100 100" className="w-48 h-48 mx-auto">{slices}</svg>;
};

const Legend: React.FC<{ data: ChartData }> = ({ data }) => {
    // FIX: Cast value to number to allow addition.
    const total = Object.values(data).reduce((sum, value) => sum + (value as number), 0);
    if (total === 0) return null;

    return (
        <ul className="space-y-2 mt-4">
            {Object.entries(data).map(([category, value]) => (
                <li key={category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'] }}></span>
                        <span className="text-gray-700">{category}</span>
                    </div>
                    {/* FIX: Cast value to number for arithmetic operation. */}
                    <span className="font-semibold text-gray-800">{(((value as number) / total) * 100).toFixed(0)}%</span>
                </li>
            ))}
        </ul>
    );
};


const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ consumedItems }) => {
    const [categorizedData, setCategorizedData] = useState<ChartData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (consumedItems.length === 0) {
            setCategorizedData(null);
            return;
        }

        const fetchCategories = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const categories = await categorizeItems(consumedItems);
                const counts: ChartData = {};
                categories.forEach(item => {
                    counts[item.category] = (counts[item.category] || 0) + 1;
                });
                setCategorizedData(counts);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, [consumedItems]);

    const hasData = categorizedData && Object.keys(categorizedData).length > 0;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
                <ChartPieIcon className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Consumption Breakdown</h3>
            </div>

            {isLoading && (
                 <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="text-gray-500 mt-3">Analyzing consumption...</p>
                </div>
            )}

            {error && (
                 <div className="text-center py-10 px-6 bg-red-50 rounded-lg">
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            )}

            {!isLoading && !error && !hasData && (
                <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
                    <h4 className="text-md font-medium text-gray-700">No consumption data yet!</h4>
                    <p className="text-gray-500 mt-2 text-sm">Cook a recipe to see a breakdown of your food habits here.</p>
                </div>
            )}
            
            {!isLoading && !error && hasData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <PieChart data={categorizedData} />
                    </div>
                    <div>
                        <Legend data={categorizedData} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsumptionChart;