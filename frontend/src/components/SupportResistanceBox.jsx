import React from 'react';

const SupportResistanceBox = ({ stockData, analysis }) => {
    const price = parseFloat(stockData?.price) || 245;
    const targetPrice = parseFloat(analysis?.target_price) || price * 1.12;

    // Calculate support and resistance levels
    const resistance2 = (price * 1.08).toFixed(2);
    const resistance1 = (price * 1.04).toFixed(2);
    const support1 = (price * 0.96).toFixed(2);
    const support2 = (price * 0.92).toFixed(2);
    const pivot = price.toFixed(2);

    const levels = [
        { label: 'R2', value: resistance2, type: 'resistance', strength: 'Strong' },
        { label: 'R1', value: resistance1, type: 'resistance', strength: 'Moderate' },
        { label: 'PP', value: pivot, type: 'pivot', strength: 'Pivot Point' },
        { label: 'S1', value: support1, type: 'support', strength: 'Moderate' },
        { label: 'S2', value: support2, type: 'support', strength: 'Strong' },
    ];

    return (
        <div className="gc rv rd2 sr-card">
            <div className="sec-hd">
                <span className="sec-n">📊</span>
                <span className="sec-t">Support & Resistance</span>
                <div className="sec-rule"></div>
            </div>
            <div className="sr-levels">
                {levels.map((lv, i) => (
                    <div key={i} className={`sr-row sr-${lv.type}`}>
                        <span className="sr-label">{lv.label}</span>
                        <div className="sr-bar-wrap">
                            <div className={`sr-marker sr-marker-${lv.type}`}
                                style={{ left: `${20 + i * 15}%` }}></div>
                            <div className="sr-line"></div>
                        </div>
                        <span className="sr-price">${lv.value}</span>
                        <span className="sr-strength">{lv.strength}</span>
                    </div>
                ))}
            </div>
            <div className="sr-footer">
                <span className="ai-dot"></span>
                AI Target: <b>${targetPrice.toFixed ? targetPrice.toFixed(2) : targetPrice}</b>
            </div>
        </div>
    );
};

export default SupportResistanceBox;
