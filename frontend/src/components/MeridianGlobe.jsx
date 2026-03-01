import React, { useEffect, useRef, useState, useCallback } from 'react';
import './MeridianGlobe.css';

/* ══════════════════════════════════════════════════
   WORLD MAP DATA  (simplified polygons [lon,lat])
══════════════════════════════════════════════════ */
const WORLD = [
    {
        id: 'USA', name: 'United States', flag: '🇺🇸', color: '#b8ff00',
        poly: [[-124.7, 48.4], [-122.4, 37.8], [-117.1, 32.5], [-97, 26], [-80.5, 25.1], [-81, 30.5], [-75.5, 35.2], [-71, 41.7], [-67, 47.5], [-93, 49], [-110, 49], [-124.7, 48.4]]
    },
    {
        id: 'CAN', name: 'Canada', flag: '🇨🇦', color: '#ff6655',
        poly: [[-140, 60], [-130, 55], [-124, 49], [-77, 43.5], [-67, 47], [-60, 46], [-55, 51], [-64, 63], [-95, 63], [-110, 60], [-140, 60]]
    },
    {
        id: 'MEX', name: 'Mexico', flag: '🇲🇽', color: '#00d8ff',
        poly: [[-117, 32.5], [-97, 26], [-97, 22], [-90, 16], [-87, 16], [-87, 21], [-104, 19], [-110, 23], [-114, 32], [-117, 32.5]]
    },
    {
        id: 'BRA', name: 'Brazil', flag: '🇧🇷', color: '#40ff80',
        poly: [[-73, -10], [-60, -5], [-51, 0], [-35, -5], [-35, -10], [-40, -20], [-50, -28], [-55, -34], [-65, -20], [-70, -15], [-73, -10]]
    },
    {
        id: 'ARG', name: 'Argentina', flag: '🇦🇷', color: '#88aaff',
        poly: [[-65, -22], [-53, -33], [-58, -38], [-63, -42], [-68, -55], [-70, -42], [-65, -30], [-65, -22]]
    },
    {
        id: 'GBR', name: 'United Kingdom', flag: '🇬🇧', color: '#ff9944',
        poly: [[-5, 50], [-3, 50], [0, 51], [2, 51], [1, 53], [-1, 53], [-4, 56], [-6, 58], [-5, 58], [-2, 57], [-4, 55], [-5, 50]]
    },
    {
        id: 'FRA', name: 'France', flag: '🇫🇷', color: '#ffdd44',
        poly: [[-4.5, 48], [-1.5, 46], [2, 43], [6, 44], [7, 46], [5, 49], [2, 51], [0, 50], [-2, 49], [-4.5, 48]]
    },
    {
        id: 'DEU', name: 'Germany', flag: '🇩🇪', color: '#ff8866',
        poly: [[6, 47], [8, 47], [13, 47], [15, 51], [14, 54], [8, 55], [6, 52], [6, 47]]
    },
    {
        id: 'ITA', name: 'Italy', flag: '🇮🇹', color: '#44ffcc',
        poly: [[7, 44], [14, 37], [16, 37], [18, 40], [14, 44], [10, 44], [7, 44]]
    },
    {
        id: 'ESP', name: 'Spain', flag: '🇪🇸', color: '#ff5577',
        poly: [[-9, 44], [-1.5, 43], [3, 43], [3, 40], [0, 37], [-5, 36], [-9, 37], [-9, 44]]
    },
    {
        id: 'RUS', name: 'Russia', flag: '🇷🇺', color: '#aabbff',
        poly: [[27, 68], [65, 73], [100, 72], [140, 70], [180, 68], [180, 52], [140, 44], [130, 52], [105, 51], [65, 55], [38, 68], [27, 68]]
    },
    {
        id: 'CHN', name: 'China', flag: '🇨🇳', color: '#ff4444',
        poly: [[73, 38], [80, 25], [100, 22], [108, 20], [118, 24], [122, 31], [122, 42], [115, 53], [100, 52], [95, 53], [88, 49], [77, 37], [73, 38]]
    },
    {
        id: 'IND', name: 'India', flag: '🇮🇳', color: '#ff9933',
        poly: [[68, 37], [72, 22], [77, 8], [80, 10], [88, 22], [96, 24], [97, 27], [90, 28], [80, 30], [78, 35], [72, 35], [68, 37]]
    },
    {
        id: 'JPN', name: 'Japan', flag: '🇯🇵', color: '#ff5566',
        poly: [[130, 31], [131, 33], [133, 33], [135, 34], [137, 35], [140, 36], [141, 38], [141, 40], [138, 43], [135, 34], [130, 31]]
    },
    {
        id: 'KOR', name: 'South Korea', flag: '🇰🇷', color: '#66aaff',
        poly: [[126, 34], [127, 34], [129, 35], [130, 36], [129, 38], [128, 38], [126, 37], [125, 35], [126, 34]]
    },
    {
        id: 'AUS', name: 'Australia', flag: '🇦🇺', color: '#ffaa44',
        poly: [[114, -22], [118, -28], [122, -34], [130, -32], [137, -35], [148, -38], [153, -28], [148, -18], [140, -17], [130, -12], [120, -18], [115, -22], [114, -22]]
    },
    {
        id: 'SAU', name: 'Saudi Arabia', flag: '🇸🇦', color: '#44ff88',
        poly: [[37, 28], [42, 17], [45, 15], [51, 22], [55, 22], [55, 26], [50, 30], [44, 30], [36, 32], [37, 28]]
    },
    {
        id: 'ZAF', name: 'South Africa', flag: '🇿🇦', color: '#ff8833',
        poly: [[17, -29], [19, -35], [26, -34], [30, -31], [33, -27], [32, -22], [27, -23], [22, -18], [17, -29]]
    },
    {
        id: 'NGA', name: 'Nigeria', flag: '🇳🇬', color: '#33dd66',
        poly: [[3, 4], [5, 4], [10, 7], [14, 10], [14, 13], [10, 14], [4, 12], [3, 7], [3, 4]]
    },
    {
        id: 'EGY', name: 'Egypt', flag: '🇪🇬', color: '#ffcc44',
        poly: [[25, 22], [35, 22], [35, 28], [32, 31], [30, 31], [25, 30], [25, 22]]
    },
    {
        id: 'TUR', name: 'Turkey', flag: '🇹🇷', color: '#ff4466',
        poly: [[26, 36], [32, 36], [36, 36], [42, 37], [44, 39], [41, 41], [36, 42], [30, 41], [26, 38], [26, 36]]
    },
    {
        id: 'IDN', name: 'Indonesia', flag: '🇮🇩', color: '#ff5544',
        poly: [[95, 5], [105, 5], [115, 0], [120, -5], [128, -3], [135, -6], [128, -8], [115, -8], [105, -7], [95, 5]]
    },
    {
        id: 'POL', name: 'Poland', flag: '🇵🇱', color: '#ff6688',
        poly: [[14, 50], [17, 50], [22, 49], [23, 51], [22, 54], [16, 54], [14, 52], [14, 50]]
    },
    {
        id: 'SWE', name: 'Sweden', flag: '🇸🇪', color: '#4488ff',
        poly: [[12, 56], [16, 56], [18, 58], [20, 63], [24, 66], [22, 68], [18, 68], [11, 58], [12, 56]]
    },
    {
        id: 'CHL', name: 'Chile', flag: '🇨🇱', color: '#dd4455',
        poly: [[-68, -18], [-65, -22], [-65, -30], [-70, -40], [-72, -50], [-75, -50], [-72, -42], [-68, -30], [-68, -18]]
    },
];

/* Country → stocks */
const COUNTRY_STOCKS = {
    USA: [
        {
            tk: 'NVDA', name: 'Nvidia', price: 819.44, delta: '+3.21%', dir: 'up', sig: 'BUY', conf: 94, color: '#b8ff00',
            d1: [744, 752, 748, 760, 756, 769, 764, 778, 772, 790, 785, 798, 793, 810, 807, 819],
            d7: [680, 695, 710, 688, 724, 715, 740, 755, 748, 760, 756, 769, 764, 778, 772, 790, 785, 798, 793, 810, 807, 819],
            dm: [580, 595, 612, 605, 630, 618, 640, 655, 642, 660, 651, 670, 665, 688, 680, 700, 692, 712, 705, 724, 715, 740, 755, 748, 760, 756, 769, 778, 798, 819]
        },
        {
            tk: 'AAPL', name: 'Apple', price: 189.42, delta: '+0.34%', dir: 'nt', sig: 'HOLD', conf: 61, color: '#f0a030',
            d1: [185, 186, 185, 187, 186, 188, 187, 189, 188, 190, 189, 188, 190, 189, 191, 189],
            d7: [180, 181, 179, 182, 181, 183, 182, 184, 183, 185, 184, 184, 186, 185, 186, 185, 186, 185, 187, 188, 189, 189, 190, 189, 191, 189],
            dm: [170, 172, 174, 171, 175, 173, 176, 178, 175, 179, 177, 181, 179, 182, 180, 183, 182, 184, 181, 185, 183, 186, 184, 185, 185, 186, 185, 187, 189, 189]
        },
        {
            tk: 'TSLA', name: 'Tesla', price: 178.22, delta: '-2.41%', dir: 'dn', sig: 'SELL', conf: 78, color: '#ff5566',
            d1: [192, 189, 187, 185, 183, 186, 184, 182, 180, 183, 181, 180, 182, 179, 181, 178],
            d7: [210, 205, 200, 198, 195, 198, 194, 190, 188, 186, 188, 184, 182, 183, 181, 179, 181, 178],
            dm: [240, 235, 230, 228, 220, 225, 215, 210, 205, 200, 198, 195, 198, 192, 188, 185, 186, 184, 182, 180, 181, 179, 178]
        },
        {
            tk: 'MSFT', name: 'Microsoft', price: 421.09, delta: '+1.02%', dir: 'up', sig: 'BUY', conf: 82, color: '#b8ff00',
            d1: [408, 410, 409, 412, 411, 414, 413, 416, 414, 418, 416, 415, 418, 417, 420, 421],
            d7: [390, 395, 392, 398, 396, 402, 400, 406, 405, 410, 408, 410, 409, 412, 414, 416, 414, 418, 416, 415, 418, 421],
            dm: [360, 365, 368, 362, 370, 366, 374, 370, 376, 372, 380, 376, 385, 380, 390, 385, 395, 390, 398, 396, 402, 406, 408, 410, 414, 418, 416, 418, 421]
        },
    ],
    CHN: [
        {
            tk: 'BABA', name: 'Alibaba', price: 82.44, delta: '+2.88%', dir: 'up', sig: 'BUY', conf: 72, color: '#b8ff00',
            d1: [79, 79.5, 79.2, 80, 79.8, 80.5, 80.2, 81, 80.8, 81.5, 81.2, 81, 81.5, 81.8, 82, 82.4],
            d7: [72, 73, 72.5, 74, 73.5, 75, 74.5, 76, 75.5, 77, 76.5, 78, 79, 80, 81, 82.4],
            dm: [60, 61.5, 61, 63, 62.5, 65, 64, 67, 66, 69, 68, 72, 71, 75, 74, 78, 79, 81, 82.4]
        },
        {
            tk: 'NIO', name: 'NIO Inc.', price: 5.22, delta: '-3.51%', dir: 'dn', sig: 'SELL', conf: 81, color: '#ff5566',
            d1: [5.6, 5.5, 5.5, 5.4, 5.4, 5.3, 5.4, 5.3, 5.3, 5.4, 5.3, 5.2, 5.3, 5.2, 5.2, 5.2],
            d7: [6.2, 6.1, 6.0, 5.9, 5.8, 5.7, 5.6, 5.5, 5.4, 5.3, 5.2, 5.2],
            dm: [7.5, 7.2, 7.0, 6.8, 6.5, 6.2, 6.0, 5.8, 5.5, 5.3, 5.2]
        },
    ],
    IND: [
        {
            tk: 'INFY', name: 'Infosys', price: 19.44, delta: '+1.66%', dir: 'up', sig: 'BUY', conf: 84, color: '#b8ff00',
            d1: [19, 19.1, 19.0, 19.2, 19.1, 19.2, 19.1, 19.3, 19.2, 19.3, 19.2, 19.2, 19.3, 19.3, 19.4, 19.4],
            d7: [17, 17.5, 17.2, 18, 17.8, 18.5, 18.2, 18.8, 18.6, 19.0, 18.8, 19.2, 19.4],
            dm: [14, 14.5, 14.2, 15, 14.8, 15.5, 15.2, 16, 15.8, 16.5, 16.2, 17, 16.8, 17.5, 18, 18.8, 19.4]
        },
        {
            tk: 'HDB', name: 'HDFC Bank', price: 62.88, delta: '-0.44%', dir: 'dn', sig: 'HOLD', conf: 59, color: '#f0a030',
            d1: [63.2, 63.1, 63.0, 63.1, 63.0, 63.0, 62.9, 63.0, 63.0, 62.9, 63.0, 62.9, 62.9, 62.9, 62.9, 62.9],
            d7: [64, 63.8, 63.5, 63.2, 63.0, 62.9, 63.0, 62.9],
            dm: [65, 64.5, 64, 63.5, 63.2, 62.9]
        },
    ],
    JPN: [
        {
            tk: 'TM', name: 'Toyota Motor', price: 196.60, delta: '+1.12%', dir: 'up', sig: 'BUY', conf: 76, color: '#b8ff00',
            d1: [193, 194, 193, 195, 194, 195, 194, 196, 195, 196, 195, 196, 196, 196, 197, 197],
            d7: [184, 186, 185, 188, 187, 190, 189, 192, 191, 194, 193, 195, 196, 197],
            dm: [172, 174, 173, 177, 175, 180, 178, 183, 181, 186, 184, 189, 187, 192, 190, 195, 197]
        },
        {
            tk: 'SONY', name: 'Sony Group', price: 88.40, delta: '+2.44%', dir: 'up', sig: 'BUY', conf: 80, color: '#b8ff00',
            d1: [85.5, 86, 85.8, 86.5, 86.2, 87, 86.8, 87.5, 87.2, 88, 87.8, 88, 88, 88.2, 88.4, 88.4],
            d7: [78, 79.5, 79, 81, 80, 82.5, 82, 84, 83.5, 85.5, 85, 87, 86, 88, 88.4],
            dm: [68, 70, 69, 72, 71, 74, 73, 76, 75, 78, 77, 80, 79, 83, 81, 86, 84, 88, 88.4]
        },
    ],
    GBR: [
        {
            tk: 'SHEL', name: 'Shell PLC', price: 34.22, delta: '+1.22%', dir: 'up', sig: 'BUY', conf: 77, color: '#b8ff00',
            d1: [33.5, 33.7, 33.6, 33.8, 33.7, 34.0, 33.8, 34.0, 33.9, 34.1, 34.0, 34.0, 34.1, 34.1, 34.2, 34.2],
            d7: [31, 31.5, 31.2, 32, 31.8, 32.5, 32.2, 33, 32.8, 33.5, 33.4, 33.8, 34.0, 34.2],
            dm: [28, 28.5, 28.8, 29.2, 29.6, 30.0, 30.5, 31.0, 31.5, 32.0, 32.5, 33.0, 33.5, 34.0, 34.2]
        },
        {
            tk: 'AZN', name: 'AstraZeneca', price: 78.50, delta: '+0.78%', dir: 'up', sig: 'BUY', conf: 83, color: '#b8ff00',
            d1: [77.5, 77.8, 77.6, 78, 77.8, 78.2, 78, 78.3, 78.1, 78.4, 78.2, 78.2, 78.4, 78.3, 78.5, 78.5],
            d7: [74, 74.8, 74.4, 75.2, 74.8, 75.8, 75.4, 76.4, 76, 77, 76.6, 77.6, 77.8, 78.2, 78.5],
            dm: [68, 69, 68.5, 70, 69.5, 71, 70.5, 72, 71.5, 73.5, 73, 74.5, 74, 76, 75.5, 77, 76.5, 78.5]
        },
    ],
    DEU: [
        {
            tk: 'SAP', name: 'SAP SE', price: 196.40, delta: '+1.55%', dir: 'up', sig: 'BUY', conf: 88, color: '#b8ff00',
            d1: [192, 193, 192, 194, 193, 195, 194, 195, 194, 196, 195, 195, 196, 196, 196, 196],
            d7: [182, 184, 183, 186, 185, 188, 187, 190, 189, 192, 191, 193, 194, 196, 196],
            dm: [165, 168, 167, 172, 170, 175, 173, 178, 176, 181, 180, 185, 183, 188, 186, 191, 190, 194, 196]
        },
    ],
    AUS: [
        {
            tk: 'BHP', name: 'BHP Group', price: 56.44, delta: '+1.88%', dir: 'up', sig: 'BUY', conf: 83, color: '#b8ff00',
            d1: [55, 55.4, 55.2, 55.6, 55.4, 55.8, 55.6, 56, 55.8, 56.2, 56, 56, 56.2, 56.3, 56.4, 56.4],
            d7: [50, 51, 50.5, 52, 51.5, 53, 52.5, 54, 53.5, 55, 54.5, 55.5, 56.4],
            dm: [42, 43.5, 43, 45, 44.5, 47, 46, 49, 48, 51, 50, 53, 52, 55, 54, 56.4]
        },
    ],
};

function getStocks(countryId) {
    return COUNTRY_STOCKS[countryId] || [
        {
            tk: 'INDEX', name: 'Local Index', price: 100, delta: '+0.50%', dir: 'up', sig: 'HOLD', conf: 55, color: '#f0a030',
            d1: [95, 96, 95, 97, 96, 98, 97, 99, 98, 100, 99, 100, 100, 100, 100, 100],
            d7: [90, 92, 91, 94, 93, 96, 95, 98, 97, 100],
            dm: [80, 83, 81, 86, 84, 89, 87, 92, 90, 95, 93, 98, 96, 100]
        }
    ];
}

/* Right panel fixed rows */
const FIXED = {
    N: { data: [744, 752, 748, 760, 756, 769, 764, 778, 772, 790, 785, 798, 793, 810, 807, 819], color: '#b8ff00' },
    A: { data: [185, 186, 185, 187, 186, 188, 187, 189, 188, 190, 189, 188, 190, 189, 191, 189], color: '#f0a030' },
    M: { data: [521, 515, 519, 512, 515, 508, 511, 505, 508, 502, 505, 499, 502, 498, 501, 498], color: '#ff5566' },
};

/* ──────────────────────────────────────────────
   HELPER: draw a sparkline onto a canvas ctx
────────────────────────────────────────────── */
function drawSparkline(ctx, data, color, W, H, dpr) {
    const mn = Math.min(...data) - 1, mx = Math.max(...data) + 1, rng = mx - mn, N = data.length;
    const px = i => 4 + (i / (N - 1)) * (W - 8), py = v => 4 + (1 - (v - mn) / rng) * (H - 8);
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, color + '28'); g.addColorStop(1, color + '00');
    ctx.beginPath(); ctx.moveTo(px(0), H);
    data.forEach((v, i) => {
        if (i === 0) ctx.lineTo(px(0), py(v));
        else { const cx2 = (px(i - 1) + px(i)) / 2; ctx.bezierCurveTo(cx2, py(data[i - 1]), cx2, py(v), px(i), py(v)); }
    });
    ctx.lineTo(px(N - 1), H); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    [[7, .018], [4, .05], [2, .15], [1.1, .62], [0.7, .92]].forEach(([lw, a]) => {
        ctx.beginPath(); ctx.moveTo(px(0), py(data[0]));
        data.forEach((v, i) => {
            if (i === 0) return;
            const cx2 = (px(i - 1) + px(i)) / 2;
            ctx.bezierCurveTo(cx2, py(data[i - 1]), cx2, py(v), px(i), py(v));
        });
        ctx.strokeStyle = color + Math.round(a * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = lw * dpr; ctx.lineCap = 'round'; ctx.stroke();
    });
    const lx = px(N - 1), ly = py(data[N - 1]);
    [[8, .06], [4, .16], [2.2, .9]].forEach(([r, a]) => {
        ctx.beginPath(); ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.round(a * 255).toString(16).padStart(2, '0'); ctx.fill();
    });
}

/* ══════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════ */
const MeridianGlobe = () => {
    const globeRef = useRef(null);
    const globeZoneRef = useRef(null);
    const tipRef = useRef(null);
    const toastsRef = useRef(null);
    const detailRef = useRef(null);
    const leftBgRef = useRef(null);
    const chartCvRef = useRef(null);
    const chartOvRef = useRef(null);
    const doTipRef = useRef(null);
    const vbnRef = useRef(null);
    const vbaRef = useRef(null);
    const vbmRef = useRef(null);
    const cNRef = useRef(null);
    const cARef = useRef(null);
    const cMRef = useRef(null);
    const tipNRef = useRef(null);
    const tipARef = useRef(null);
    const tipMRef = useRef(null);
    const tvNRef = useRef(null);
    const tvARef = useRef(null);
    const tvMRef = useRef(null);
    const pNRef = useRef(null);
    const pARef = useRef(null);
    const pMRef = useRef(null);
    const cntRef = useRef(null);

    const [detailOpen, setDetailOpen] = useState(false);
    const [activeCountry, setActiveCountry] = useState(null);
    const [activeStockIdx, setActiveStockIdx] = useState(0);
    const [activeRange, setActiveRange] = useState('1D');
    const [stocks, setStocks] = useState([]);

    const detailAnimRef = useRef(null);

    /* ── GLOBE ENGINE ── */
    useEffect(() => {
        const cv = globeRef.current;
        if (!cv) return;
        const ctx = cv.getContext('2d');
        const W = cv.width, H = cv.height, CX = W / 2, CY = H / 2, R = 100;
        let rotLng = 10, rotLat = 20, vLng = 0.12, vLat = 0;
        let dragging = false, lx2 = 0, ly2 = 0;
        let hovered = null, animId;

        function project(lon, lat) {
            const phi = lat * Math.PI / 180, lam = lon * Math.PI / 180;
            const lam0 = rotLng * Math.PI / 180, phi0 = rotLat * Math.PI / 180;
            const x = R * Math.cos(phi) * Math.sin(lam - lam0);
            const y = R * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lam - lam0));
            const z = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lam - lam0);
            return { x: CX + x, y: CY + y, z };
        }
        function centroidF(poly) { let sLon = 0, sLat = 0; poly.forEach(([lo, la]) => { sLon += lo; sLat += la; }); return [sLon / poly.length, sLat / poly.length]; }
        function pip(px2, py2, pts) {
            let inside = false;
            for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
                const xi = pts[i].x, yi = pts[i].y, xj = pts[j].x, yj = pts[j].y;
                if ((yi > py2) !== (yj > py2) && px2 < ((xj - xi) * (py2 - yi)) / (yj - yi) + xi) inside = !inside;
            }
            return inside;
        }
        function projectPoly(poly) {
            const pts = poly.map(([lo, la]) => project(lo, la));
            const vis = pts.filter(p => p.z > 0);
            if (vis.length < poly.length * 0.5) return null;
            return pts;
        }

        const zone = globeZoneRef.current;
        const onDown = e => { dragging = true; lx2 = e.clientX; ly2 = e.clientY; vLng = 0; vLat = 0; };
        const onUp = () => { dragging = false; };
        const onMove = e => {
            if (dragging) {
                const dx = e.clientX - lx2, dy = e.clientY - ly2;
                rotLng += dx * 0.35; rotLat -= dy * 0.25;
                vLng = dx * 0.35; vLat = -dy * 0.25; lx2 = e.clientX; ly2 = e.clientY;
            }
        };
        const onHover = e => {
            const rect = cv.getBoundingClientRect();
            const mx2 = e.clientX - rect.left, my2 = e.clientY - rect.top;
            let found = null;
            for (let i = WORLD.length - 1; i >= 0; i--) {
                const c = WORLD[i]; const [cLon, cLat] = centroidF(c.poly);
                const cp = project(cLon, cLat); if (cp.z < 0.02) continue;
                const pts = projectPoly(c.poly); if (!pts) continue;
                if (pip(mx2, my2, pts)) { found = c; break; }
            }
            hovered = found;
            const tip = tipRef.current; if (!tip) return;
            if (found) {
                tip.style.left = mx2 + 'px'; tip.style.top = (my2 - 44) + 'px';
                tip.style.setProperty('--m-tc', found.color);
                tip.querySelector('.m-gtk').textContent = found.flag + ' ' + found.name;
                tip.querySelector('.m-gsub').textContent = getStocks(found.id).map(s => s.tk).join(' · ');
                tip.classList.add('show');
            } else { tip.classList.remove('show'); }
        };
        const onLeave = () => { hovered = null; tipRef.current?.classList.remove('show'); };
        const onClick = e => {
            if (dragging) return;
            const rect = cv.getBoundingClientRect();
            const mx2 = e.clientX - rect.left, my2 = e.clientY - rect.top;
            for (let i = WORLD.length - 1; i >= 0; i--) {
                const c = WORLD[i]; const [cLon, cLat] = centroidF(c.poly);
                const cp = project(cLon, cLat); if (cp.z < 0.02) continue;
                const pts = projectPoly(c.poly); if (!pts) continue;
                if (pip(mx2, my2, pts)) {
                    handleCountryClick(c);
                    return;
                }
            }
        };

        zone.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mousemove', onMove);
        zone.addEventListener('mousemove', onHover);
        zone.addEventListener('mouseleave', onLeave);
        zone.addEventListener('click', onClick);

        function render() {
            ctx.clearRect(0, 0, W, H);
            // Ocean
            const oceanGrd = ctx.createRadialGradient(CX - 22, CY - 22, 0, CX, CY, R);
            oceanGrd.addColorStop(0, 'rgba(8,28,52,0.95)'); oceanGrd.addColorStop(0.6, 'rgba(4,14,32,0.98)'); oceanGrd.addColorStop(1, 'rgba(2,8,20,1)');
            ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fillStyle = oceanGrd; ctx.fill();
            // Ring
            ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(0,180,255,0.18)'; ctx.lineWidth = 0.8; ctx.stroke();
            // Atmosphere
            const rimGrd = ctx.createRadialGradient(CX, CY, R - 4, CX, CY, R + 6);
            rimGrd.addColorStop(0, 'rgba(0,180,255,0.0)'); rimGrd.addColorStop(0.4, 'rgba(0,200,255,0.08)'); rimGrd.addColorStop(1, 'rgba(0,200,255,0.0)');
            ctx.beginPath(); ctx.arc(CX, CY, R + 4, 0, Math.PI * 2); ctx.fillStyle = rimGrd; ctx.fill();
            // Grid
            ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.clip(); ctx.lineWidth = 0.4;
            for (let lat = -60; lat <= 60; lat += 30) { ctx.beginPath(); let first = true; for (let lon = -180; lon <= 180; lon += 5) { const p = project(lon, lat); if (p.z < 0) { first = true; continue; } if (first) { ctx.moveTo(p.x, p.y); first = false; } else ctx.lineTo(p.x, p.y); } ctx.strokeStyle = 'rgba(0,180,255,0.07)'; ctx.stroke(); }
            for (let lon = -180; lon <= 180; lon += 30) { ctx.beginPath(); let first = true; for (let lat = -80; lat <= 80; lat += 5) { const p = project(lon, lat); if (p.z < 0) { first = true; continue; } if (first) { ctx.moveTo(p.x, p.y); first = false; } else ctx.lineTo(p.x, p.y); } ctx.strokeStyle = 'rgba(0,180,255,0.07)'; ctx.stroke(); }
            ctx.restore();
            // Countries
            ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.clip();
            WORLD.forEach(country => {
                const pts = projectPoly(country.poly); if (!pts) return;
                const isH = hovered && hovered.id === country.id;
                ctx.beginPath(); pts.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }); ctx.closePath();
                if (isH) { ctx.fillStyle = country.color + '38'; ctx.shadowColor = country.color; ctx.shadowBlur = 8; }
                else { ctx.fillStyle = country.color + '16'; ctx.shadowBlur = 0; }
                ctx.fill(); ctx.shadowBlur = 0;
                ctx.strokeStyle = isH ? country.color + 'cc' : country.color + '44'; ctx.lineWidth = isH ? 0.9 : 0.5; ctx.stroke();
            });
            // Dots
            WORLD.forEach(country => {
                const [cLon, cLat] = centroidF(country.poly); const cp = project(cLon, cLat); if (cp.z < 0.2) return;
                ctx.beginPath(); ctx.arc(cp.x, cp.y, 1.8, 0, Math.PI * 2); ctx.fillStyle = country.color + '88'; ctx.fill();
            });
            ctx.restore();
            // Specular
            const specGrd = ctx.createRadialGradient(CX - 28, CY - 28, 0, CX - 22, CY - 22, 60);
            specGrd.addColorStop(0, 'rgba(255,255,255,0.07)'); specGrd.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fillStyle = specGrd; ctx.fill();
            // Auto-rotate
            if (!dragging) { vLng *= 0.96; vLat *= 0.96; rotLng += vLng; if (Math.abs(vLng) < 0.001) rotLng += 0.06; }
            animId = requestAnimationFrame(render);
        }
        render();

        return () => {
            cancelAnimationFrame(animId);
            zone.removeEventListener('mousedown', onDown);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('mousemove', onMove);
            zone.removeEventListener('mousemove', onHover);
            zone.removeEventListener('mouseleave', onLeave);
            zone.removeEventListener('click', onClick);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Country click handler ── */
    const handleCountryClick = useCallback((country) => {
        setActiveCountry(country);
        setActiveStockIdx(0);
        setActiveRange('1D');
        setStocks(getStocks(country.id));
        setDetailOpen(true);
        if (leftBgRef.current) {
            leftBgRef.current.style.cssText = `background:radial-gradient(ellipse 85% 60% at 50% 38%,${country.color}14 0%,transparent 70%);opacity:1`;
        }
        spawnToast(`${country.flag} ${country.name} · Signal loaded`, country.color);
    }, []);

    /* ── Draw right-panel sparklines ── */
    useEffect(() => {
        ['N', 'A', 'M'].forEach(k => {
            const cv = k === 'N' ? cNRef.current : k === 'A' ? cARef.current : cMRef.current;
            if (!cv) return;
            const d = FIXED[k];
            const parent = cv.parentElement;
            const draw = () => {
                const dpr = devicePixelRatio;
                cv.width = parent.offsetWidth * dpr; cv.height = parent.offsetHeight * dpr;
                const ctx2 = cv.getContext('2d');
                drawSparkline(ctx2, d.data, d.color, cv.width, cv.height, dpr);
            };
            const ro = new ResizeObserver(draw); ro.observe(parent);
            setTimeout(draw, 60);
            return () => ro.disconnect();
        });
    }, []);

    /* ── Confidence bars animate ── */
    useEffect(() => {
        const t = setTimeout(() => {
            if (vbnRef.current) vbnRef.current.style.width = '94%';
            if (vbaRef.current) vbaRef.current.style.width = '61%';
            if (vbmRef.current) vbmRef.current.style.width = '81%';
        }, 200);
        return () => clearTimeout(t);
    }, []);

    /* ── Live price ticker ── */
    useEffect(() => {
        let pN2 = 819.44, pA2 = 189.42, pM2 = 497.81;
        const id = setInterval(() => {
            pN2 = +(pN2 + (Math.random() - .499) * .28).toFixed(2);
            pA2 = +(pA2 + (Math.random() - .499) * .15).toFixed(2);
            pM2 = +(pM2 + (Math.random() - .499) * .18).toFixed(2);
            if (pNRef.current) pNRef.current.textContent = pN2.toFixed(2);
            if (pARef.current) pARef.current.textContent = pA2.toFixed(2);
            if (pMRef.current) pMRef.current.textContent = pM2.toFixed(2);
        }, 2300);
        return () => clearInterval(id);
    }, []);

    /* ── Signal counter ── */
    useEffect(() => {
        let sc2 = 0, t2;
        const tick = () => {
            sc2 += Math.floor(Math.random() * 3) + 1;
            if (cntRef.current) cntRef.current.textContent = sc2.toLocaleString();
            t2 = setTimeout(tick, 1700 + Math.random() * 2200);
        };
        tick();
        return () => clearTimeout(t2);
    }, []);

    /* ── Initial toasts ── */
    useEffect(() => {
        const t1 = setTimeout(() => spawnToast('🌍 Click any country on the globe', '#00d8ff'), 2000);
        const t2 = setTimeout(() => spawnToast('🇺🇸 USA · NVDA BUY signal · 94%', '#b8ff00'), 5000);
        const t3 = setTimeout(() => spawnToast('🇨🇳 China · BABA watch zone', '#ff4444'), 9000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    /* ── Draw detail chart when overlay data changes ── */
    useEffect(() => {
        if (!detailOpen || !activeCountry || stocks.length === 0) return;
        const stock = stocks[activeStockIdx];
        if (!stock) return;
        drawDetailChartFn(stock, activeRange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detailOpen, activeStockIdx, activeRange, stocks]);

    /* ─ Detail chart draw function ─ */
    const drawDetailChartFn = useCallback((stock, range) => {
        const data = range === '1D' ? stock.d1 : range === '1W' ? stock.d7 : stock.dm;
        const color = stock.color;
        const cv = chartCvRef.current;
        const ovCv = chartOvRef.current;
        if (!cv || !ovCv) return;
        const wrap = cv.parentElement;
        const dpr = devicePixelRatio;
        cv.width = wrap.offsetWidth * dpr; cv.height = wrap.offsetHeight * dpr;
        ovCv.width = cv.width; ovCv.height = cv.height;
        const ctx2 = cv.getContext('2d');
        const W = cv.width, H = cv.height, N = data.length;
        const mn = Math.min(...data) - ((Math.max(...data) - Math.min(...data)) * 0.08);
        const mx = Math.max(...data) + ((Math.max(...data) - Math.min(...data)) * 0.08);
        const rng = mx - mn || 1;
        const PX = 6 * dpr, PY = 6 * dpr;
        const pxF = i => PX + (i / (N - 1)) * (W - PX * 2);
        const pyF = v => PY + (1 - (v - mn) / rng) * (H - PY * 2);
        let prog = 0;
        cancelAnimationFrame(detailAnimRef.current);

        function frame() {
            ctx2.clearRect(0, 0, W, H);
            const end = Math.round(prog * (N - 1));
            const sl = data.slice(0, end + 1);
            if (sl.length < 2) { prog = Math.min(1, prog + 0.06); detailAnimRef.current = requestAnimationFrame(frame); return; }
            // grid
            [.25, .5, .75].forEach(f => {
                const y = PY + f * (H - PY * 2);
                ctx2.beginPath(); ctx2.moveTo(PX, y); ctx2.lineTo(W - PX, y);
                ctx2.strokeStyle = color + '15'; ctx2.lineWidth = 0.5 * dpr;
                ctx2.setLineDash([4 * dpr, 8 * dpr]); ctx2.stroke(); ctx2.setLineDash([]);
            });
            // fill
            const g = ctx2.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, color + '26'); g.addColorStop(1, color + '00');
            ctx2.beginPath(); ctx2.moveTo(pxF(0), H);
            sl.forEach((v, i) => { if (i === 0) ctx2.lineTo(pxF(0), pyF(v)); else { const cx3 = (pxF(i - 1) + pxF(i)) / 2; ctx2.bezierCurveTo(cx3, pyF(sl[i - 1]), cx3, pyF(v), pxF(i), pyF(v)); } });
            ctx2.lineTo(pxF(sl.length - 1), H); ctx2.closePath(); ctx2.fillStyle = g; ctx2.fill();
            // line layers
            [[8, .02], [5, .06], [2.5, .16], [1.4, .55], [0.8, .9]].forEach(([lw, a]) => {
                ctx2.beginPath(); ctx2.moveTo(pxF(0), pyF(sl[0]));
                sl.forEach((v, i) => { if (i === 0) return; const cx3 = (pxF(i - 1) + pxF(i)) / 2; ctx2.bezierCurveTo(cx3, pyF(sl[i - 1]), cx3, pyF(v), pxF(i), pyF(v)); });
                ctx2.strokeStyle = color + Math.round(a * 255).toString(16).padStart(2, '0'); ctx2.lineWidth = lw * dpr; ctx2.lineCap = 'round'; ctx2.stroke();
            });
            // end dot
            const ex = pxF(sl.length - 1), ey = pyF(sl[sl.length - 1]);
            [[9, .07], [5, .18], [2.5, .9]].forEach(([r, a]) => { ctx2.beginPath(); ctx2.arc(ex, ey, r * dpr, 0, Math.PI * 2); ctx2.fillStyle = color + Math.round(a * 255).toString(16).padStart(2, '0'); ctx2.fill(); });
            prog = Math.min(1, prog + 0.055);
            if (prog < 1) detailAnimRef.current = requestAnimationFrame(frame);
        }
        frame();

        // Crosshair overlay
        const ov = ovCv.getContext('2d');
        ovCv.onmousemove = e => {
            const r = ovCv.getBoundingClientRect();
            const mx2 = (e.clientX - r.left) * dpr;
            const idx = Math.max(0, Math.min(N - 1, Math.round((mx2 - PX) / (W - PX * 2) * (N - 1))));
            const v = data[idx];
            const cx = pxF(idx), cy = pyF(v);
            ov.clearRect(0, 0, W, H);
            ov.beginPath(); ov.moveTo(cx, PY); ov.lineTo(cx, H - PY); ov.strokeStyle = color + '40'; ov.lineWidth = 0.8 * dpr; ov.setLineDash([4 * dpr, 5 * dpr]); ov.stroke(); ov.setLineDash([]);
            ov.beginPath(); ov.moveTo(PX, cy); ov.lineTo(W - PX, cy); ov.strokeStyle = color + '28'; ov.lineWidth = 0.7 * dpr; ov.setLineDash([3 * dpr, 6 * dpr]); ov.stroke(); ov.setLineDash([]);
            [[10, .14], [4, .6]].forEach(([r2, a]) => { ov.beginPath(); ov.arc(cx, cy, r2 * dpr, 0, Math.PI * 2); ov.fillStyle = color + Math.round(a * 255).toString(16).padStart(2, '0'); ov.fill(); });
            const tip = doTipRef.current; if (!tip) return;
            tip.style.left = Math.max(35, Math.min(r.width - 35, e.clientX - r.left)) + 'px';
            tip.style.top = '-30px';
            tip.querySelector('.m-dt-v').textContent = '$' + v.toFixed(2);
            tip.querySelector('.m-dt-v').style.color = color;
            tip.querySelector('.m-dt-l').textContent = `Point ${idx + 1}`;
            tip.classList.add('show');
        };
        ovCv.onmouseleave = () => {
            ov.clearRect(0, 0, ovCv.width, ovCv.height);
            doTipRef.current?.classList.remove('show');
        };
    }, []);

    /* ── Toast spawner ── */
    const spawnToast = useCallback((msg, color) => {
        const container = toastsRef.current; if (!container) return;
        const el = document.createElement('div'); el.className = 'm-toast';
        el.style.borderLeftColor = color; el.style.color = color + 'cc';
        el.textContent = msg; container.appendChild(el);
        setTimeout(() => { el.style.animation = 'mtoastOut .4s ease forwards'; setTimeout(() => el.remove(), 400); }, 3500);
    }, []);

    /* ── Row chart tooltip binding ── */
    useEffect(() => {
        const setupTip = (wrapEl, tipEl, valEl, data) => {
            if (!wrapEl || !tipEl || !valEl) return;
            const onM = e => {
                const r = wrapEl.getBoundingClientRect();
                const idx = Math.round((e.clientX - r.left) / r.width * (data.length - 1));
                const v = data[Math.max(0, Math.min(data.length - 1, idx))];
                valEl.textContent = '$' + v.toFixed(2);
                tipEl.style.left = (e.clientX - r.left) + 'px'; tipEl.style.top = '-28px';
                tipEl.classList.add('show');
            };
            const onL = () => tipEl.classList.remove('show');
            wrapEl.addEventListener('mousemove', onM);
            wrapEl.addEventListener('mouseleave', onL);
            return () => { wrapEl.removeEventListener('mousemove', onM); wrapEl.removeEventListener('mouseleave', onL); };
        };
        const c1 = setupTip(cNRef.current?.parentElement, tipNRef.current, tvNRef.current, FIXED.N.data);
        const c2 = setupTip(cARef.current?.parentElement, tipARef.current, tvARef.current, FIXED.A.data);
        const c3 = setupTip(cMRef.current?.parentElement, tipMRef.current, tvMRef.current, FIXED.M.data);
        return () => { c1?.(); c2?.(); c3?.(); };
    }, []);

    /* ── Close detail ── */
    const closeDetail = useCallback(() => {
        setDetailOpen(false);
        setActiveCountry(null);
        if (leftBgRef.current) leftBgRef.current.style.opacity = '0';
    }, []);

    /* ── Row click → open USA ── */
    const handleRowClick = useCallback(() => {
        const usa = WORLD.find(w => w.id === 'USA');
        if (usa) handleCountryClick(usa);
    }, [handleCountryClick]);

    /* ── Active stock data ── */
    const activeStock = stocks[activeStockIdx] || null;

    return (
        <div className="meridian-shell">
            <div className="m-scan"></div>

            {/* ══ LEFT ══ */}
            <div className="m-left" id="mLeftPanel">
                <div className="m-left-bg" ref={leftBgRef}></div>

                {/* Globe */}
                <div className="m-globe-zone" ref={globeZoneRef}>
                    <canvas id="mGlobeCv" ref={globeRef} width="262" height="262"></canvas>
                    <div className="m-gtip" ref={tipRef}>
                        <div className="m-gtk"></div>
                        <div className="m-gsub"></div>
                    </div>
                    <div id="mGlobeHint">DRAG · CLICK COUNTRY</div>
                </div>

                {/* Detail Overlay */}
                <div className={`m-detail-overlay${detailOpen ? ' open' : ''}`} ref={detailRef}>
                    <div className="m-do-inner">
                        <div className="m-do-head">
                            <div className="m-do-country">
                                <div className="m-do-flag">{activeCountry?.flag || '🌍'}</div>
                                <div className="m-do-cname">{activeCountry?.name || 'Country'}</div>
                                <div className="m-do-label">Trending Stocks</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                <div className="m-stabs">
                                    {stocks.map((s, i) => (
                                        <div key={s.tk} className={`m-stab${i === activeStockIdx ? ' active' : ''}`}
                                            style={i === activeStockIdx ? { '--m-ac': s.color } : {}}
                                            onClick={(e) => { e.stopPropagation(); setActiveStockIdx(i); }}>
                                            {s.tk}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {activeStock && (
                            <>
                                <div className="m-do-stock-row">
                                    <div className="m-do-price" style={{ color: activeStock.color }}>
                                        <span className="m-cur">$</span>{activeStock.price.toFixed(2)}
                                    </div>
                                    <div className={`m-do-delta m-${activeStock.dir === 'dn' ? 'dn' : activeStock.dir === 'nt' ? 'nt' : 'up'}`}>
                                        {activeStock.dir === 'up' ? '↑ ' : activeStock.dir === 'dn' ? '↓ ' : '→ '}{activeStock.delta}
                                    </div>
                                </div>
                                <div className="m-do-sig-line">
                                    <div className={`m-do-sig m-${activeStock.sig === 'BUY' ? 'sbuy' : activeStock.sig === 'SELL' ? 'ssell' : 'shold'}`}>
                                        <span className="m-sdot"></span>{activeStock.sig}
                                    </div>
                                    <div className="m-do-conf">AI Confidence · {activeStock.conf}%</div>
                                </div>
                                <div className="m-do-chart-wrap">
                                    <canvas ref={chartCvRef}></canvas>
                                    <canvas ref={chartOvRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}></canvas>
                                    <div className="m-trange">
                                        {['1D', '1W', '1M'].map(r => (
                                            <div key={r} className={`m-tr-btn${activeRange === r ? ' active' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); setActiveRange(r); }}>
                                                {r}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="m-do-tip" ref={doTipRef}>
                                        <div className="m-dt-v"></div>
                                        <div className="m-dt-l"></div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="m-do-close" onClick={closeDetail}>✕</div>
                </div>

                {/* Verdict */}
                <div className="m-verdict">
                    <div className="m-vd-eye"><div className="m-lpulse"></div>AI Verdict · Live</div>
                    <div className="m-vd-big">78.7%</div>
                    <div className="m-vd-sub">Avg Signal Confidence</div>
                    <div className="m-vbars">
                        <div className="m-vbar"><div className="m-vbtk">NVDA</div><div className="m-vbtrack"><div className="m-vbfill m-fn" ref={vbnRef}></div></div><div className="m-vbpct" style={{ color: 'var(--m-lime)' }}>94%</div></div>
                        <div className="m-vbar"><div className="m-vbtk">AAPL</div><div className="m-vbtrack"><div className="m-vbfill m-fa" ref={vbaRef}></div></div><div className="m-vbpct" style={{ color: 'var(--m-sand)' }}>61%</div></div>
                        <div className="m-vbar"><div className="m-vbtk">META</div><div className="m-vbtrack"><div className="m-vbfill m-fm" ref={vbmRef}></div></div><div className="m-vbpct" style={{ color: 'var(--m-coral)' }}>81%</div></div>
                    </div>
                </div>
            </div>

            {/* ══ RIGHT ══ */}
            <div className="m-right">
                <div className="m-topbar">
                    <div className="m-tb-brand">MERIDIAN · SIGNALS</div>
                    <div className="m-tb-right">
                        <div className="m-tb-stat"><div className="m-tsl">Accuracy</div><div className="m-tsv" style={{ color: 'var(--m-lime)' }}>94.2%</div></div>
                        <div className="m-tb-stat"><div className="m-tsl">Fired</div><div className="m-tsv" ref={cntRef}>0</div></div>
                        <div className="m-live-tag"><div className="m-lpulse"></div>Live</div>
                    </div>
                </div>
                <div className="m-stocks">
                    {/* NVDA Row */}
                    <div className="m-srow m-srow-n" onClick={handleRowClick}>
                        <div className="m-rid">
                            <div className="m-rtk">NVDA</div><div className="m-rname">Nvidia Corp.</div>
                            <div className="m-rprow"><div className="m-rprice"><span className="m-cur">$</span><span ref={pNRef}>819.44</span></div><div className="m-rdelta m-up">↑ +3.21%</div></div>
                        </div>
                        <div className="m-rchrt">
                            <canvas ref={cNRef}></canvas>
                            <div className="m-chart-tip" ref={tipNRef}><div className="m-ct-val" ref={tvNRef}></div><div className="m-ct-lbl">Price</div></div>
                        </div>
                        <div className="m-rsig-wrap">
                            <span className="m-rsig m-sbuy"><span className="m-sdot"></span>Strong Buy</span>
                            <div className="m-rstats"><div className="m-rs"><div className="m-rsl">RSI</div><div className="m-rsv">67.2</div></div><div className="m-rs"><div className="m-rsl">Vol</div><div className="m-rsv">42.1M</div></div></div>
                        </div>
                        <div className="m-row-hint">Click to expand ›</div>
                    </div>
                    {/* AAPL Row */}
                    <div className="m-srow m-srow-a" onClick={handleRowClick}>
                        <div className="m-rid">
                            <div className="m-rtk">AAPL</div><div className="m-rname">Apple Inc.</div>
                            <div className="m-rprow"><div className="m-rprice"><span className="m-cur">$</span><span ref={pARef}>189.42</span></div><div className="m-rdelta m-nt">→ +0.34%</div></div>
                        </div>
                        <div className="m-rchrt">
                            <canvas ref={cARef}></canvas>
                            <div className="m-chart-tip" ref={tipARef}><div className="m-ct-val" ref={tvARef}></div><div className="m-ct-lbl">Price</div></div>
                        </div>
                        <div className="m-rsig-wrap">
                            <span className="m-rsig m-shold"><span className="m-sdot"></span>Hold</span>
                            <div className="m-rstats"><div className="m-rs"><div className="m-rsl">RSI</div><div className="m-rsv">52.1</div></div><div className="m-rs"><div className="m-rsl">Vol</div><div className="m-rsv">54.2M</div></div></div>
                        </div>
                        <div className="m-row-hint">Click to expand ›</div>
                    </div>
                    {/* META Row */}
                    <div className="m-srow m-srow-m" onClick={handleRowClick}>
                        <div className="m-rid">
                            <div className="m-rtk">META</div><div className="m-rname">Meta Platforms</div>
                            <div className="m-rprow"><div className="m-rprice"><span className="m-cur">$</span><span ref={pMRef}>497.81</span></div><div className="m-rdelta m-dn">↓ −1.87%</div></div>
                        </div>
                        <div className="m-rchrt">
                            <canvas ref={cMRef}></canvas>
                            <div className="m-chart-tip" ref={tipMRef}><div className="m-ct-val" ref={tvMRef}></div><div className="m-ct-lbl">Price</div></div>
                        </div>
                        <div className="m-rsig-wrap">
                            <span className="m-rsig m-ssell"><span className="m-sdot"></span>Sell</span>
                            <div className="m-rstats"><div className="m-rs"><div className="m-rsl">RSI</div><div className="m-rsv">39.4</div></div><div className="m-rs"><div className="m-rsl">Vol</div><div className="m-rsv">28.7M</div></div></div>
                        </div>
                        <div className="m-row-hint">Click to expand ›</div>
                    </div>
                </div>
            </div>

            {/* Toasts */}
            <div className="m-toasts" ref={toastsRef}></div>
        </div>
    );
};

export default MeridianGlobe;
