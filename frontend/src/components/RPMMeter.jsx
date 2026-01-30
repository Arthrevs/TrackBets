import React from 'react';

const RPMMeter = ({ score }) => {
    const pct = Math.max(0, Math.min(100, score));

    return (
        <div className="w-full mt-2">
            <div className="relative h-3 bg-[#111] rounded overflow-visible">
                {/* RPM Bar Gradient */}
                <div
                    className="h-full w-full rounded opacity-80"
                    style={{
                        background: 'linear-gradient(90deg, #FF3B30 0%, #FFCC00 50%, #CCFF00 100%)'
                    }}
                ></div>

                {/* Triangle Marker */}
                <div
                    className="absolute -top-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white transform -translate-x-1/2 drop-shadow-md transition-all duration-500 ease-out"
                    style={{ left: `${pct}%` }}
                ></div>
            </div>
        </div>
    );
};

export default RPMMeter;
