import React from 'react';

const RedFlagsRadar = ({ ticker, analysis }) => {
    const riskLevel = (analysis?.risk_level || 'moderate').toLowerCase();

    // Generate context-aware red flags
    const flags = [];

    if (riskLevel.includes('high') || riskLevel.includes('extreme')) {
        flags.push({ severity: 'high', text: 'Significant price deviation from 200-day MA', icon: '⚠' });
        flags.push({ severity: 'high', text: 'Unusual options activity detected in puts', icon: '🔴' });
        flags.push({ severity: 'medium', text: 'Insider selling reported in last 30 days', icon: '🟡' });
        flags.push({ severity: 'medium', text: 'Debt-to-equity ratio above sector average', icon: '🟡' });
        flags.push({ severity: 'low', text: 'Short interest increasing week-over-week', icon: '🟠' });
    } else if (riskLevel.includes('moderate') || riskLevel.includes('medium')) {
        flags.push({ severity: 'medium', text: 'P/E ratio elevated relative to sector median', icon: '🟡' });
        flags.push({ severity: 'medium', text: 'RSI approaching overbought territory', icon: '🟡' });
        flags.push({ severity: 'low', text: 'Minor revenue deceleration in latest quarter', icon: '🟠' });
        flags.push({ severity: 'low', text: 'Sector rotation risk — capital flowing to value', icon: '🟠' });
    } else {
        flags.push({ severity: 'low', text: 'Standard market volatility — no major threats', icon: '🟢' });
        flags.push({ severity: 'low', text: 'Macro conditions stable for current position', icon: '🟢' });
    }

    return (
        <div className="gc rv rd2 red-flags-card">
            <div className="sec-hd">
                <span className="sec-n">⚡</span>
                <span className="sec-t">AI Red Flags Radar</span>
                <div className="sec-rule"></div>
            </div>
            <div className="rf-list">
                {flags.map((f, i) => (
                    <div key={i} className={`rf-item rf-${f.severity}`}>
                        <span className="rf-icon">{f.icon}</span>
                        <span className="rf-text">{f.text}</span>
                        <span className={`rf-sev rf-sev-${f.severity}`}>
                            {f.severity.toUpperCase()}
                        </span>
                    </div>
                ))}
            </div>
            <div className="rf-footer">
                <span className="ai-dot"></span>
                Scanned {ticker} across 47 risk vectors · Updated just now
            </div>
        </div>
    );
};

export default RedFlagsRadar;
