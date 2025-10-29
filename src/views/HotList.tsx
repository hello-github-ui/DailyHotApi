import type { FC } from "hono/jsx";
import { html } from "hono/html";
import Layout from "./Layout.js";

interface HotItem {
    id: string;
    title: string;
    desc?: string;
    cover?: string;
    author?: string;
    hot?: number;
    url: string;
    mobileUrl: string;
}

interface PlatformData {
    name: string;
    title: string;
    type: string;
    description?: string;
    data: HotItem[];
    total: number;
    updateTime: string;
}

const HotList: FC = () => {
    return (
        <Layout title="今日热榜 - 全平台聚合">
            <main className="hotlist-container">
                <div className="header">
                    <h1 className="title">今日热榜</h1>
                    <p className="subtitle">全平台热门内容聚合</p>
                    <div className="stats" id="stats">
                        <span id="loadedCount">0</span> / <span id="totalCount">0</span> 个平台已加载
                    </div>
                    <div className="refresh-btn" onclick="refreshAllData()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                        </svg>
                        刷新数据
                    </div>
                </div>

                <div className="loading" id="loading">
                    <div className="spinner"></div>
                    <p>正在加载热榜数据...</p>
                </div>

                <div className="platforms-container" id="platformsContainer">
                    {/* 平台卡片将通过 JavaScript 动态生成 */}
                </div>

                <div className="floating-actions">
                    <button className="action-btn" onclick="scrollToTop()" id="scrollToTopBtn" style="display: none;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                        </svg>
                        回到顶部
                    </button>
                    <button className="action-btn" onclick="toggleAutoRotate()" id="autoRotateBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        自动旋转
                    </button>
                    <button className="action-btn" onclick="resetView()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        重置视图
                    </button>
                </div>
            </main>

            {html`
                <style>
                    .hotlist-container {
                        /*min-height: 100vh;*/
                        width: 100%;
                        box-sizing: border-box;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 80px 16px 80px 16px;
                        position: relative;
                        overflow-x: hidden;
                        overflow-y: auto;
                    }

                    .header {
                        text-align: center;
                        margin: 0 auto 24px;
                        position: relative;
                        z-index: 10;
                        max-width: 1800px;
                        width: 100%;
                    }

                    .title {
                        font-size: 3rem;
                        font-weight: 700;
                        color: white;
                        margin-bottom: 10px;
                        text-shadow: 0 4px 8px rgba(0,0,0,0.3);
                        background: linear-gradient(45deg, #fff, #f0f0f0);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }

                    .subtitle {
                        font-size: 1.2rem;
                        color: rgba(255,255,255,0.9);
                        margin-bottom: 15px;
                    }

                    .stats {
                        font-size: 1rem;
                        color: rgba(255,255,255,0.8);
                        margin-bottom: 20px;
                        padding: 8px 16px;
                        background: rgba(255,255,255,0.1);
                        border-radius: 20px;
                        display: inline-block;
                        backdrop-filter: blur(10px);
                    }

                    .refresh-btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 2px solid rgba(255,255,255,0.3);
                        padding: 12px 24px;
                        border-radius: 25px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        backdrop-filter: blur(10px);
                    }

                    .refresh-btn:hover {
                        background: rgba(255,255,255,0.3);
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
                    }

                    .loading {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 200px;
                        color: white;
                    }

                    .spinner {
                        width: 50px;
                        height: 50px;
                        border: 4px solid rgba(255,255,255,0.3);
                        border-top: 4px solid white;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 20px;
                    }

                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    .platforms-container {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                        gap: 20px;
                        max-width: 1600px;
                        width: 100%;
                        margin: 0 auto;
                        padding: 0 8px;
                        align-items: start;
                        min-height: calc(100vh - 200px);
                    }

                    .platform-card {
                        background: rgba(255,255,255,0.95);
                        border-radius: 16px;
                        padding: 20px;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                        backdrop-filter: blur(10px);
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        cursor: pointer;
                        position: relative;
                        overflow: hidden;
                        border: 1px solid rgba(255,255,255,0.2);
                        will-change: transform;
                        opacity: 0;
                        transform: translateY(20px);
                        animation: slideInUp 0.6s ease-out forwards;
                        height: 500px;
                        display: flex;
                        flex-direction: column;
                    }

                    .platform-card::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: linear-gradient(90deg, #667eea, #764ba2);
                    }

                    .platform-card:hover {
                        transform: translateY(-8px) scale(1.02);
                        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                    }

                    @keyframes slideInUp {
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .platform-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 16px;
                        padding-bottom: 12px;
                        border-bottom: 2px solid #f0f0f0;
                        flex-shrink: 0;
                    }

                    .platform-name {
                        font-size: 1.4rem;
                        font-weight: 700;
                        color: #333;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .platform-icon {
                        width: 28px;
                        height: 28px;
                        border-radius: 6px;
                        background: linear-gradient(45deg, #667eea, #764ba2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 0.9rem;
                    }

                    .platform-type {
                        font-size: 0.8rem;
                        color: #666;
                        background: #f5f5f5;
                        padding: 4px 10px;
                        border-radius: 12px;
                        font-weight: 500;
                    }

                    .platform-description {
                        font-size: 0.9rem;
                        color: #888;
                        margin-bottom: 16px;
                        line-height: 1.4;
                        font-style: italic;
                        flex-shrink: 0;
                    }

                    .hot-items {
                        flex: 1;
                        overflow-y: auto;
                        scrollbar-width: thin;
                        scrollbar-color: #ccc transparent;
                        padding-right: 4px;
                    }

                    .hot-items::-webkit-scrollbar {
                        width: 4px;
                    }

                    .hot-items::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    .hot-items::-webkit-scrollbar-thumb {
                        background: #ccc;
                        border-radius: 2px;
                    }

                    /* 取消内部滚动条，统一由页面滚动 */

                    .hot-item {
                        display: flex;
                        align-items: flex-start;
                        gap: 12px;
                        padding: 10px 0;
                        border-bottom: 1px solid #f0f0f0;
                        transition: all 0.2s ease;
                        position: relative;
                        min-height: 44px;
                    }

                    .hot-item:hover {
                        background: linear-gradient(90deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
                        border-radius: 8px;
                        padding: 12px;
                        margin: 0 -12px;
                    }

                    .hot-item:last-child {
                        border-bottom: none;
                    }

                    .item-rank {
                        font-weight: 700;
                        color: #667eea;
                        min-width: 24px;
                        font-size: 1.1rem;
                        flex-shrink: 0;
                    }

                    .item-content {
                        flex: 1;
                        min-width: 0;
                    }

                    .item-title {
                        font-size: 0.95rem;
                        font-weight: 600;
                        color: #333;
                        line-height: 1.4;
                        margin-bottom: 6px;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        cursor: pointer;
                    }

                    .item-meta {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 0.8rem;
                        color: #666;
                        flex-wrap: wrap;
                    }

                    .item-hot {
                        background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
                        color: white;
                        padding: 2px 8px;
                        border-radius: 10px;
                        font-weight: 600;
                        font-size: 0.75rem;
                    }

                    .item-author {
                        color: #888;
                        font-style: italic;
                    }

                    .empty-item {
                        opacity: 0.5;
                        cursor: default;
                    }

                    .empty-item:hover {
                        background: transparent !important;
                        border-radius: 0 !important;
                        padding: 10px 0 !important;
                        margin: 0 !important;
                    }

                    .empty-title {
                        color: #ccc !important;
                        font-style: italic;
                    }

                    .empty-hot {
                        background: #f0f0f0 !important;
                        color: #999 !important;
                    }

                    .loading-card {
                        background: rgba(255,255,255,0.7);
                        border: 2px dashed #ddd;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #999;
                        font-style: italic;
                    }

                    .loading-card .loading-spinner {
                        width: 20px;
                        height: 20px;
                        border: 2px solid #f3f3f3;
                        border-top: 2px solid #667eea;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-right: 10px;
                    }

                    .floating-actions {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        z-index: 1000;
                    }

                    .action-btn {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        background: rgba(255,255,255,0.9);
                        color: #333;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 25px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        backdrop-filter: blur(10px);
                        font-weight: 500;
                    }

                    .action-btn:hover {
                        background: white;
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                    }

                    .action-btn.active {
                        background: #667eea;
                        color: white;
                    }

                    .error-message {
                        text-align: center;
                        color: #ff6b6b;
                        padding: 20px;
                        background: rgba(255, 107, 107, 0.1);
                        border-radius: 8px;
                        margin: 20px;
                    }

                    .empty-state {
                        text-align: center;
                        color: rgba(255,255,255,0.8);
                        padding: 60px 20px;
                    }

                    .loading-more {
                        text-align: center;
                        color: rgba(255,255,255,0.8);
                        padding: 20px;
                        font-style: italic;
                    }

                    @media (max-width: 1200px) {
                        .platforms-container {
                            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                            max-width: 1000px;
                        }
                    }

                    @media (max-width: 768px) {
                        .hotlist-container {
                            padding: 16px 12px 80px 12px;
                        }

                        .platforms-container {
                            grid-template-columns: 1fr;
                            padding: 0 4px;
                            gap: 16px;
                        }

                        .platform-card {
                            padding: 16px;
                            height: 450px;
                        }

                        .title {
                            font-size: 2.2rem;
                        }

                        .floating-actions {
                            bottom: 15px;
                            right: 15px;
                            flex-direction: row;
                        }

                        .action-btn {
                            padding: 10px 16px;
                            font-size: 0.9rem;
                        }
                    }

                    @media (max-width: 480px) {
                        .hotlist-container {
                            padding: 12px 8px 70px 8px;
                        }

                        .platforms-container {
                            gap: 12px;
                        }

                        .platform-card {
                            padding: 12px;
                            height: 400px;
                        }

                        .title {
                            font-size: 1.8rem;
                        }

                        .hot-item {
                            min-height: 40px;
                            padding: 8px 0;
                        }

                        .item-title {
                            font-size: 0.9rem;
                        }
                    }

                    .fade-in {
                        animation: fadeIn 0.6s ease-out;
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .rotate-animation {
                        animation: rotate 20s linear infinite;
                    }

                    @keyframes rotate {
                        from { transform: rotateY(0deg); }
                        to { transform: rotateY(360deg); }
                    }
                </style>

                <script>
                    let platformsData = [];
                    let autoRotateInterval = null;
                    let isAutoRotating = false;
                    let loadedCount = 0;
                    let totalCount = 0;
                    let isLoading = false;
                    let platformCards = new Map(); // 存储平台卡片的引用

                    // 获取所有平台列表
                    async function getAllPlatforms() {
                        try {
                            const response = await fetch('/all');
                            if (!response.ok) {
                                throw new Error(\`HTTP error! status: \${response.status}\`);
                            }
                            const data = await response.json();
                            return data.routes || [];
                        } catch (error) {
                            console.error('获取平台列表失败:', error);
                            return [];
                        }
                    }

                    // 获取单个平台数据（带重试机制）
                    async function getPlatformData(platformName, retries = 0) {
                        for (let i = 0; i <= retries; i++) {
                            try {
                                const response = await fetch(\`/\${platformName}?limit=10\`);
                                if (!response.ok) {
                                    throw new Error(\`HTTP error! status: \${response.status}\`);
                                }
                                const data = await response.json();
                                return data;
                            } catch (error) {
                                console.warn(\`获取 \${platformName} 数据失败 (尝试 \${i + 1}/\${retries + 1}):\`, error);
                                if (i === retries) {
                                    return null;
                                }
                                // 重试前等待
                                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                            }
                        }
                        return null;
                    }

                    // 更新统计信息
                    function updateStats() {
                        document.getElementById('loadedCount').textContent = loadedCount;
                        document.getElementById('totalCount').textContent = totalCount;
                    }

                    // 创建加载中的卡片
                    function createLoadingCard(platformName, index) {
                        const card = document.createElement('div');
                        card.className = 'platform-card loading-card';
                        card.id = \`card-\${platformName}\`;
                        card.style.animationDelay = \`\${index * 0.1}s\`;
                        
                        card.innerHTML = \`
                            <div class="loading-spinner"></div>
                            正在加载 \${platformName} 数据...
                        \`;
                        
                        return card;
                    }

                    // 更新平台卡片内容
                    function updatePlatformCard(platformName, platform) {
                        const card = document.getElementById(\`card-\${platformName}\`);
                        if (!card) return;

                        // 生成10个列表项，不足的用空白占位
                        const hotItems = [];
                        for (let i = 0; i < 10; i++) {
                            if (i < platform.data.length) {
                                const item = platform.data[i];
                                hotItems.push(\`
                                    <div class="hot-item" onclick="openLink('\${item.url}')">
                                        <div class="item-rank">\${i + 1}</div>
                                        <div class="item-content">
                                            <div class="item-title">\${item.title}</div>
                                            <div class="item-meta">
                                                \${item.hot ? \`<span class="item-hot">\${formatHot(item.hot)}</span>\` : ''}
                                                \${item.author ? \`<span class="item-author">\${item.author}</span>\` : ''}
                                            </div>
                                        </div>
                                    </div>
                                \`);
                            } else {
                                // 空白占位符
                                hotItems.push(\`
                                    <div class="hot-item empty-item">
                                        <div class="item-rank">\${i + 1}</div>
                                        <div class="item-content">
                                            <div class="item-title empty-title">暂无数据</div>
                                            <div class="item-meta">
                                                <span class="item-hot empty-hot">--</span>
                                            </div>
                                        </div>
                                    </div>
                                \`);
                            }
                        }

                        card.className = 'platform-card';
                        card.innerHTML = \`
                            <div class="platform-header">
                                <div class="platform-name">
                                    <div class="platform-icon">\${platform.title.charAt(0)}</div>
                                    \${platform.title}
                                </div>
                                <div class="platform-type">\${platform.type}</div>
                            </div>
                            \${platform.description ? \`<div class="platform-description">\${platform.description}</div>\` : ''}
                            <div class="hot-items">
                                \${hotItems.join('')}
                            </div>
                        \`;

                        loadedCount++;
                        updateStats();
                    }

                    // 预生成所有平台卡片
                    function createAllPlatformCards(platforms) {
                        const container = document.getElementById('platformsContainer');
                        container.innerHTML = '';
                        platformCards.clear();
                        
                        platforms.forEach((platform, index) => {
                            const card = createLoadingCard(platform.name, index);
                            container.appendChild(card);
                            platformCards.set(platform.name, card);
                        });
                    }

                    // 异步加载所有平台数据
                    async function loadAllPlatforms() {
                        if (isLoading) return;
                        isLoading = true;
                        
                        const loading = document.getElementById('loading');
                        const container = document.getElementById('platformsContainer');
                        
                        try {
                            const platforms = await getAllPlatforms();
                            if (platforms.length === 0) {
                                throw new Error('无法获取平台列表');
                            }
                            
                            totalCount = platforms.length;
                            loadedCount = 0;
                            platformsData = [];
                            
                            // 隐藏初始加载动画
                            loading.style.display = 'none';
                            
                            // 预生成所有卡片（加载中状态）
                            createAllPlatformCards(platforms);
                            updateStats();
                            
                            // 异步加载每个平台的数据
                            const loadPromises = platforms.map(async (platform) => {
                                try {
                                    const data = await getPlatformData(platform.name);
                                    if (data && data.code === 200 && data.data && data.data.length > 0) {
                                        platformsData.push(data);
                                        updatePlatformCard(platform.name, data);
                                    } else {
                                        // 加载失败，显示错误状态
                                        const card = document.getElementById(\`card-\${platform.name}\`);
                                        if (card) {
                                            card.className = 'platform-card loading-card';
                                            card.innerHTML = \`
                                                <div style="color: #ff6b6b;">❌</div>
                                                加载 \${platform.name} 失败
                                            \`;
                                        }
                                    }
                                } catch (error) {
                                    console.error(\`加载 \${platform.name} 失败:\`, error);
                                    const card = document.getElementById(\`card-\${platform.name}\`);
                                    if (card) {
                                        card.className = 'platform-card loading-card';
                                        card.innerHTML = \`
                                            <div style="color: #ff6b6b;">❌</div>
                                            加载 \${platform.name} 失败
                                        \`;
                                    }
                                }
                            });
                            
                            // 等待所有加载完成
                            await Promise.all(loadPromises);
                            
                        } catch (error) {
                            console.error('加载数据失败:', error);
                            loading.style.display = 'none';
                            container.innerHTML = \`
                                <div class="error-message">
                                    <h3>加载失败</h3>
                                    <p>无法获取热榜数据，请检查网络连接或稍后重试</p>
                                    <button onclick="refreshAllData()" style="margin-top: 10px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                        重新加载
                                    </button>
                                </div>
                            \`;
                        } finally {
                            isLoading = false;
                        }
                    }

                    // 格式化热度值
                    function formatHot(hot) {
                        if (hot >= 10000) {
                            return (hot / 10000).toFixed(1) + 'w';
                        } else if (hot >= 1000) {
                            return (hot / 1000).toFixed(1) + 'k';
                        }
                        return hot.toString();
                    }

                    // 打开链接
                    function openLink(url) {
                        window.open(url, '_blank');
                    }

                    // 刷新所有数据
                    async function refreshAllData() {
                        if (isLoading) return;
                        
                        const loading = document.getElementById('loading');
                        const container = document.getElementById('platformsContainer');
                        
                        loading.style.display = 'flex';
                        container.style.display = 'none';
                        
                        // 重置状态
                        loadedCount = 0;
                        platformsData = [];
                        updateStats();
                        
                        await loadAllPlatforms();
                        
                        container.style.display = 'grid';
                    }

                    // 切换自动旋转
                    function toggleAutoRotate() {
                        const btn = document.getElementById('autoRotateBtn');
                        const container = document.getElementById('platformsContainer');
                        
                        if (isAutoRotating) {
                            clearInterval(autoRotateInterval);
                            container.classList.remove('rotate-animation');
                            btn.classList.remove('active');
                            isAutoRotating = false;
                        } else {
                            container.classList.add('rotate-animation');
                            btn.classList.add('active');
                            isAutoRotating = true;
                        }
                    }

                    // 重置视图
                    function resetView() {
                        const container = document.getElementById('platformsContainer');
                        container.classList.remove('rotate-animation');
                        container.style.transform = '';
                        
                        if (isAutoRotating) {
                            clearInterval(autoRotateInterval);
                            document.getElementById('autoRotateBtn').classList.remove('active');
                            isAutoRotating = false;
                        }
                    }

                    // 回到顶部
                    function scrollToTop() {
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    }

                    // 监听滚动显示/隐藏回到顶部按钮
                    function handleScroll() {
                        const scrollBtn = document.getElementById('scrollToTopBtn');
                        if (window.scrollY > 300) {
                            scrollBtn.style.display = 'flex';
                        } else {
                            scrollBtn.style.display = 'none';
                        }
                    }

                    // 页面加载完成后开始加载数据
                    document.addEventListener('DOMContentLoaded', () => {
                        loadAllPlatforms();
                        window.addEventListener('scroll', handleScroll);
                    });
                </script>
            `}
        </Layout>
    );
};

export default HotList;