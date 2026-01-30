import React from 'react';

const HeroSearch = ({ value, onChange }) => {
    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Track Zomato... Track Tata Motors..."
                className="lando-input text-center"
            />
        </div>
    );
};

export default HeroSearch;
