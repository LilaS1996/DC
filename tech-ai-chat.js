class TechAIChatApp {
    constructor() {
        this.messages = [];
        this.currentUser = '用戶';
        this.aiName = '神經鏈AI';
        this.isTyping = false;
        this.tokenCount = 0;
        this.conversationContext = [];
        this.sidebarOpen = false;
        this.init();
    }
    
    init() {
        this.messagesEl = document.getElementById('messages');
        this.inputEl = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.typingEl = document.getElementById('typing-indicator');
        this.sidebarEl = document.getElementById('sidebar');
        this.menuToggle = document.getElementById('menu-toggle');
        this.chatContainer = document.querySelector('.chat-container');
        
        // 事件綁定
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 手機側邊欄切換
        this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        document.addEventListener('click', (e) => {
            if (this.sidebarOpen && !this.sidebarEl.contains(e.target) && !this.menuToggle.contains(e.target)) {
                this.closeSidebar();
            }
        });
        
        // 觸控優化
        let touchStartY = 0;
        this.messagesEl.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        this.messagesEl.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            if (Math.abs(touchY - touchStartY) > 10) {
                this.closeSidebar();
            }
        }, { passive: true });
        
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.inputEl.value = btn.dataset.reply;
                this.sendMessage();
            });
        });
        
        // 鍵盤事件 - 手機自動聚焦
        this.inputEl.addEventListener('focus', () => {
            this.closeSidebar();
            setTimeout(() => this.messagesEl.scrollTop = this.messagesEl.scrollHeight, 300);
        });
        
        // 智能歡迎訊息
        setTimeout(() => {
            this.addAIMessage('⟐ 神經網路已啟動\n智能對話模式啟用\n請問有什麼可以協助您的？（系統狀態/程式碼/數據分析）');
        }, 800);
        
        this.updateMessages();
        this.updateLatency();
    }
    
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        document.body.classList.toggle('sidebar-open', this.sidebarOpen);
        this.sidebarEl.classList.toggle('collapsed', !this.sidebarOpen);
        this.chatContainer.classList.toggle('expanded', !this.sidebarOpen);
    }
    
    closeSidebar() {
        if (this.sidebarOpen) {
            this.toggleSidebar();
        }
    }
    
    sendMessage() {
        const text = this.inputEl.value.trim();
        if (!text || this.isTyping) return;
        
        this.addUserMessage(text);
        this.conversationContext.push({role: 'user', content: text});
        this.inputEl.value = '';
        this.sendBtn.disabled = true;
        this.tokenCount += text.length;
        this.updateTokens();
        this.closeSidebar();
        
        setTimeout(() => this.getSmartResponse(text), 800 + Math.random() * 1200);
    }
    
    // ... 保持原有的 generateSmartResponse、addUserMessage 等方法 ...
    
    addUserMessage(text) {
        this.messages.push({
            user: this.currentUser,
            text: text,
            time: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
            type: 'user'
        });
        this.updateMessages();
    }
    
    getSmartResponse(userMessage) {
        this.showTyping();
        
        setTimeout(() => {
            const response = this.generateSmartResponse(userMessage);
            this.conversationContext.push({role: 'ai', content: response});
            if (this.conversationContext.length > 10) {
                this.conversationContext = this.conversationContext.slice(-10);
            }
            this.hideTyping();
            this.addAIMessage(response);
            this.sendBtn.disabled = false;
            this.inputEl.focus();
        }, 1500 + Math.random() * 1000);
    }
    
    addAIMessage(text) {
        this.messages.push({
            user: this.aiName,
            text: text,
            time: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
            type: 'ai'
        });
        this.tokenCount += text.length * 2;
        this.updateTokens();
        this.updateMessages();
    }
    
    showTyping() { 
        this.isTyping = true; 
        this.typingEl.style.display = 'flex'; 
    }
    hideTyping() { 
        this.isTyping = false; 
        this.typingEl.style.display = 'none'; 
    }
    
    // 動態延遲更新
    updateLatency() {
        const latency = 25 + Math.floor(Math.random() * 25);
        document.getElementById('latency').textContent = latency + 'ms';
    }
    
    updateTokens() {
        document.getElementById('tokens').textContent = this.tokenCount.toLocaleString();
    }
    
    updateMessages() {
        this.messagesEl.innerHTML = this.messages.map((msg, index) => `
            <div class="message ${msg.type}" style="animation-delay: ${index * 0.1}s">
                <div class="username ${msg.type}">${msg.user}</div>
                <div class="message-content">${this.formatTechMessage(msg.text)}</div>
                <div style="font-size:clamp(10px,2vw,11px);color:#66aabb;margin-top:4px;letter-spacing:1px;">
                    ${msg.time} | 進程ID:${Math.floor(Math.random()*9999)}
                </div>
            </div>
        `).join('');
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }
    
    formatTechMessage(text) {
        return text
            .replace(/```([\s\S]*?)```/g, '<pre style="background:#1a1a2e;padding:12px;border-radius:8px;font-size:clamp(11px,2.5vw,12px);overflow-x:auto;font-family:monospace;margin:8px 0;border-left:4px solid #00ff88;max-height:300px;overflow-y:auto;">$1</pre>')
            .replace(/(\d+%)/g, '<span style="color:#00d4ff;font-weight:bold">$1</span>')
            .replace(/(\d+\.?\d*°C)/g, '<span style="color:#ffaa00;font-weight:bold">$1</span>')
            .replace(/(\d+\.?\d*GB)/g, '<span style="color:#00ff88;font-weight:bold">$1</span>');
    }
    
    // 保留所有原有的智能回應方法...
    generateSmartResponse(message) {
        const msg = message.toLowerCase().trim();
        
        if (this.checkWeatherIntent(msg)) {
            return `🌤️ **台北即時天氣**\n溫度: ${20+Math.floor(Math.random()*15)}°C\n狀態: ${['晴天', '多雲', '小雨', '陰天'][Math.floor(Math.random()*4)]}\n舒適度: 良好\n💡 建議: ${msg.includes('明天') ? '明天穿薄外套' : '今天適合出門'}`;
        }
        
        if (msg.includes('系統狀態') || msg.includes('狀態') || msg.includes('status')) {
            return `⟐ **系統診斷報告**
🖥️ CPU: ${Math.floor(Math.random()*10)+90}% | 💾 記憶體: ${Math.floor(Math.random()*20)+20}/${64}GB
🎮 GPU: ${Math.floor(Math.random()*10)+80}% | 🌐 網路: 1.${Math.floor(Math.random()*9)+1}Gbps
⏱️ 延遲: ${30+Math.floor(Math.random()*20)}ms | 🔋 狀態: 所有系統正常運作`;
        }
        
        // ... 其他方法保持不變
        const contextualReplies = [
            '🤔 很有意思的問題！可以再詳細說明嗎？',
            '💡 我理解您的意思，是否需要程式碼範例或數據分析？',
            '🔍 正在分析您的問題，請問是關於程式、天氣還是系統狀態？',
            '⚙️ 建議使用快捷按鈕：系統狀態 / 生成程式碼 / 數據分析'
        ];
        return contextualReplies[Math.floor(Math.random() * contextualReplies.length)];
    }
    
    // 簡化版意圖識別
    checkWeatherIntent(msg) {
        const weatherKeywords = ['天氣', '溫度', '氣溫', '雨', '晴', '陰天', '多雲'];
        return weatherKeywords.some(keyword => msg.includes(keyword));
    }
    
    checkCodeIntent(msg) {
        const codeKeywords = ['程式', '代碼', 'html', 'css', 'javascript', 'js', 'python', '寫', '生成'];
        return codeKeywords.some(keyword => msg.includes(keyword));
    }
}

window.addEventListener('load', () => new TechAIChatApp());
