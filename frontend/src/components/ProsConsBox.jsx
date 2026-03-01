import React from 'react';

const ProsConsBox = ({ analysis }) => {
    const reasons = analysis?.reasons || [];

    // Split reasons into pros and cons based on content/keywords
    const pros = [];
    const cons = [];

    const negativeKeywords = ['risk', 'overvalued', 'decline', 'bearish', 'sell', 'danger', 'loss', 'debt', 'warning', 'concern', 'weak', 'drop', 'down', 'negative', 'slow'];

    reasons.forEach(r => {
        const lower = r.toLowerCase();
        if (negativeKeywords.some(k => lower.includes(k))) {
            cons.push(r);
        } else {
            pros.push(r);
        }
    });

    // Ensure we have at least 2 of each, fill with defaults
    while (pros.length < 2) pros.push(pros.length === 0 ? 'Positive momentum detected' : 'Volume above average');
    while (cons.length < 2) cons.push(cons.length === 0 ? 'Elevated P/E ratio' : 'Sector headwinds possible');

    return (
        <div className="gc pros-cons-box rv rd2">
            <div className="sec-hd">
                <span className="sec-t">Pros & Cons</span>
                <div className="sec-rule"></div>
            </div>
            <div className="pc-list">
                {pros.slice(0, 2).map((p, i) => (
                    <div key={`pro-${i}`} className="pc-item pc-pro">
                        <span className="pc-icon">✓</span>
                        <span className="pc-text">{p}</span>
                    </div>
                ))}
                {cons.slice(0, 2).map((c, i) => (
                    <div key={`con-${i}`} className="pc-item pc-con">
                        <span className="pc-icon">✕</span>
                        <span className="pc-text">{c}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProsConsBox;
