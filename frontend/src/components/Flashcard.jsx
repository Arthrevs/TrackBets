import React from 'react';
import RPMMeter from './RPMMeter';
import { motion } from 'framer-motion';

const Flashcard = ({ ticker, data, index }) => {
    const isBuy = data.verdict === 'BUY';
    const isSell = data.verdict === 'SELL';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
        >
            {/* Dynamic Gradient Border Overlay */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isBuy ? 'bg-gradient-to-b from-transparent via-lando-neon to-transparent opacity-80' :
                    isSell ? 'bg-gradient-to-b from-transparent via-lando-alert to-transparent opacity-80' :
                        'bg-gray-700'
                }`} />

            <div className="p-6 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl m-0 font-black tracking-tight">{ticker}</h3>
                    <span className={`px-3 py-1 rounded-full font-condensed font-bold text-xs uppercase tracking-wider backdrop-blur-md ${isBuy ? 'bg-lando-neon/20 text-lando-neon border border-lando-neon/30 shadow-[0_0_15px_rgba(204,255,0,0.3)]' :
                            isSell ? 'bg-lando-alert/20 text-lando-alert border border-lando-alert/30' : 'bg-white/10 text-white'
                        }`}>
                        {data.verdict}
                    </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Price</div>
                        <div className="font-mono font-bold text-lg">
                            {data.price}
                        </div>
                        <div className={`text-xs font-mono mt-1 ${data.delta.includes('+') ? 'text-lando-neon' : 'text-lando-alert'}`}>
                            {data.delta}
                        </div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Volume</div>
                        <div className="font-mono font-bold text-lg">{data.volume}</div>
                    </div>
                </div>

                {/* RPM Meter */}
                <div className="mt-4">
                    <div className="flex justify-between items-end mb-2">
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">Sentiment RPM</div>
                        <div className="font-mono text-xs text-white/70">{data.sentiment_score}/100</div>
                    </div>
                    <RPMMeter score={data.sentiment_score} />
                </div>

                {/* Reasons */}
                <div className="mt-5 pt-4 border-t border-white/5">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Key Drivers</div>
                    <ul className="pl-4 space-y-2">
                        {data.reasons.map((reason, i) => (
                            <li key={i} className="text-xs text-gray-300 relative pl-2 before:content-[''] before:absolute before:left-[-10px] before:top-[6px] before:w-1 before:h-1 before:rounded-full before:bg-white/30">
                                {reason}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Hover Light Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </motion.div>
    );
};

export default Flashcard;
