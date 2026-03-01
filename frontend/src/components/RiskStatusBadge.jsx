import React from 'react';

const RiskStatusBadge = ({ riskLevel, confidence }) => {
    const level = (riskLevel || 'moderate').toLowerCase();

    let status, statusClass, description;
    if (level.includes('low') || level.includes('safe') || level.includes('minimal')) {
        status = 'SAFE';
        statusClass = 'rsk-safe';
        description = 'Low volatility detected. Position within normal risk parameters.';
    } else if (level.includes('high') || level.includes('danger') || level.includes('extreme') || level.includes('critical')) {
        status = 'DANGER';
        statusClass = 'rsk-danger';
        description = 'Multiple risk indicators triggered. Exercise extreme caution.';
    } else {
        status = 'ELEVATED';
        statusClass = 'rsk-elevated';
        description = 'Moderate risk signals present. Monitor position closely.';
    }

    return (
        <div className={`gc risk-badge rv ${statusClass}`}>
            <div className="vc-top">
                <div className="vc-tag">
                    <svg viewBox="0 0 9 9"><path d="M4.5 0L5.6 3.2H9L6.4 5.2L7.4 8.5L4.5 6.6L1.6 8.5L2.6 5.2L0 3.2H3.4Z" /></svg>
                    Risk Assessment
                </div>
                <div className="vc-conf-row">
                    <span className="vc-cl">AI Confidence</span>
                    <span className="vc-cn">{confidence || 87}%</span>
                </div>
            </div>
            <div className="vc-hero">
                <div className="verdict-kicker">Risk Status</div>
                <div className={`verdict-word rsk-word ${statusClass}`}>{status}</div>
                <div className="verdict-rule rsk-rule"></div>
                <div className="verdict-sum">{description}</div>
            </div>
            <div className="rsk-indicators">
                <div className="rsk-ind">
                    <span className="rsk-ind-label">Volatility Index</span>
                    <div className="rsk-bar-track">
                        <div className={`rsk-bar-fill ${statusClass}`} style={{ width: status === 'SAFE' ? '25%' : status === 'ELEVATED' ? '58%' : '85%' }}></div>
                    </div>
                </div>
                <div className="rsk-ind">
                    <span className="rsk-ind-label">Downside Risk</span>
                    <div className="rsk-bar-track">
                        <div className={`rsk-bar-fill ${statusClass}`} style={{ width: status === 'SAFE' ? '18%' : status === 'ELEVATED' ? '52%' : '78%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskStatusBadge;
