
import React from 'react';
import { LeafIcon } from './icons';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center">
                <LeafIcon className="h-8 w-8 text-green-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                    KitchenWise 
                </h1>
            </div>
        </header>
    );
};

export default Header;
