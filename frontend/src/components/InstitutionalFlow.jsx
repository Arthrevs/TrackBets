import React from 'react';

const InstitutionalFlow = ({ ticker }) => {
    // Simulated institutional data
    const buying = 64;
    const selling = 36;
    const netFlow = '+$2.4B';
    const topBuyers = ['BlackRock', 'Vanguard', 'Fidelity'];
    const topSellers = ['Citadel'];

    return (
        <div className="gc rv rd2 inst-flow-card">
            <div className="sec-hd">
                <span className="sec-n">🏛</span>
                <span className="sec-t">Institutional Flow</span>
                <div className="sec-rule"></div>
            </div>
            <div className="if-content">
                <div className="if-bar-section">
                    <div className="if-bar-labels">
                        <span className="if-buy-label">Buying {buying}%</span>
                        <span className="if-sell-label">Selling {selling}%</span>
                    </div>
                    <div className="if-bar-track">
                        <div className="if-bar-buy" style={{ width: `${buying}%` }}></div>
                        <div className="if-bar-sell" style={{ width: `${selling}%` }}></div>
                    </div>
                </div>
                <div className="if-net">
                    <span className="if-net-label">Net Institutional Flow (30d)</span>
                    <span className="if-net-value">{netFlow}</span>
                </div>
                <div className="if-players">
                    <div className="if-player-group">
                        <span className="if-pg-label">Top Buyers</span>
                        {topBuyers.map((b, i) => (
                            <span key={i} className="if-player if-player-buy">{b}</span>
                        ))}
                    </div>
                    <div className="if-player-group">
                        <span className="if-pg-label">Top Sellers</span>
                        {topSellers.map((s, i) => (
                            <span key={i} className="if-player if-player-sell">{s}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstitutionalFlow;
