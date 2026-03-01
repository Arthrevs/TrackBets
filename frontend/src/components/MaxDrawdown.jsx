import React from 'react';

const MaxDrawdown = ({ ticker }) => {
    // Simulated historical drawdown data
    const drawdown = -((Math.abs(ticker?.charCodeAt(0) || 65) % 30) + 12).toFixed(1);
    const recoveryDays = Math.abs(Math.round(drawdown * -3.2));
    const worstDate = 'Mar 2020';

    return (
        <div className="gc rv rd1 max-dd-card">
            <div className="sec-hd">
                <span className="sec-n">📉</span>
                <span className="sec-t">Max Drawdown</span>
                <div className="sec-rule"></div>
            </div>
            <div className="dd-content">
                <div className="dd-main">
                    <div className="dd-value">{drawdown}%</div>
                    <div className="dd-label">Worst Historical Drop</div>
                </div>
                <div className="dd-stats">
                    <div className="dd-stat">
                        <span className="dd-stat-label">Recovery Time</span>
                        <span className="dd-stat-value">{recoveryDays} days</span>
                    </div>
                    <div className="dd-stat">
                        <span className="dd-stat-label">Worst Period</span>
                        <span className="dd-stat-value">{worstDate}</span>
                    </div>
                    <div className="dd-stat">
                        <span className="dd-stat-label">Avg Drawdown</span>
                        <span className="dd-stat-value">{(drawdown * 0.45).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaxDrawdown;
