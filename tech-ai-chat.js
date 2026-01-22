// tech-ai-chat.js - 真實Perplexity AI版本
class TechAIChatApp {
    constructor() {
        this.messages = [];
        this.currentUser = '用戶';
        this.aiName = '神經鏈AI';
        this.isTyping = false;
        this.tokenCount = 0;
        this.conversationHistory = [];
        this.API_KEY = 'Aimer's Organization'; // ← 這裡放你的API Key
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
        this.latencyEl = document.getElementById('latency');
        this.tokensEl = document.getElementById('tokens');

        // 事件綁定
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.inputEl.value = btn.dataset.reply;
                this.sendMessage();
            });
        });

        this.inputEl.addEventListener('focus', () => {
            this.closeSidebar();
            setTimeout(() => this.scrollToBottom(), 300);
        });

        // 歡迎訊息
        setTimeout(() => {
            this.addAIMessage('⟐ 神經鏈AI已連線Perplexity雲端\n🔥 真實AI智能對話已啟動\n請輸入問題開始對話...');
        }, 800);

        setInterval(() => this.updateLatency(), 3000);
        this.updateMessages();
    }

    async sendMessage() {
        const text = this.inputEl.value.trim();
        if (!text || this.isTyping) return;

        this.addUserMessage(text);
        this.inputEl.value = '';
        this.sendBtn.disabled = true;
        this.showTyping();
        this.closeSidebar();

        try {
            const response = await this.callPerplexityAI(text);
            this.addAIMessage(response);
        } catch (error) {
            // 備用智能回應（當API出問題時）
            const fallback = this.generateFallbackResponse(text);
            this.addAIMessage(`⚠️ 雲端連線暫時中斷\n${fallback}`);
            console.error('Perplexity API Error:', error);
        } finally {
            this.hideTyping();
            this.sendBtn.disabled = false;
            this.inputEl.focus();
        }
    }

    // 🔥 真實Perplexity AI API呼叫
    async callPerplexityAI(message) {
        if (this.API_KEY === 'YOUR_PERPLEXITY_API_KEY') {
            throw new Error('請設定Perplexity API Key');
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "llama-3.1-sonar-small-128k-online",
                    messages: [
                        {
                            role: "system",
                            content: "你是神經鏈AI，科技專家。使用cyberpunk風格回應，簡潔專業，支援程式碼生成與數據分析。請用繁體中文回答。"
                        },
                        ...this.conversationHistory.slice(-5), // 保留最近5條對話
                        { role: "user", content: message }
                    ],
                    max_tokens: 1200,
                    temperature: 0.7,
                    stream: false
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API錯誤 ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;

            // 更新對話歷史
            this.conversationHistory.push({ role: "user", content: message });
            this.conversationHistory.push({ role: "assistant", content: aiResponse });
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }

            this.tokenCount += data.usage?.total_tokens || message.length * 3;
            this.updateTokens();

            return aiResponse;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('請求超時，請稍後再試');
            }
            throw error;
        }
    }

    // 備用智能回應
    generateFallbackResponse(message) {
        const msg = message.toLowerCase();
        if (msg.includes('狀態') || msg.includes('status')) {
            return `🖥️ **離線系統狀態**
CPU: 92% | 記憶體: 48/64GB | GPU: 87%
🌐 網路: 1.2Gbps | ⏱️ 延遲: 38ms`;
        }
        return `🔄 正在重新連線Perplexity AI...
💡 請稍後再試，或嘗試：系統狀態 / 天氣 / 程式碼生成`;
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        document.body.classList.toggle('sidebar-open', this.sidebarOpen);
        this.sidebarEl.classList.toggle('collapsed', !this.sidebarOpen);
        this.chatContainer.classList.toggle('expanded', this.sidebarOpen);
    }

    closeSidebar() {
        if (this.sidebarOpen) this.toggleSidebar();
    }

    addUserMessage(text) {
        this.messages.push({
            user: this.currentUser,
            text: text,
            time: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
            type: 'user'
        });
        this.updateMessages();
    }

    addAIMessage(text) {
        this.messages.push({
            user: this.aiName,
            text: text,
            time: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
            type: 'ai'
        });
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

    scrollToBottom() {
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    updateLatency() {
        const latency = 32 + Math.floor(Math.random() * 28);
        this.latencyEl.textContent = latency + 'ms';
    }

    updateTokens() {
        this.tokensEl.textContent = this.tokenCount.toLocaleString();
    }

    updateMessages() {
        this.messagesEl.innerHTML = this.messages.map((msg, index) => `
            <div class="message ${msg.type}" style="animation-delay: ${index * 0.05}s">
                <div class="username ${msg.type}">${msg.user}</div>
                <div class="message-content">${this.formatTechMessage(msg.text)}</div>
                <div style="font-size:clamp(10px,2vw,11px);color:#66aabb;margin-top:4px;letter-spacing:1px;">
                    ${msg.time} | 進程ID:${Math.floor(Math.random()*9999)}
                </div>
            </div>
        `).join('');
        this.scrollToBottom();
    }

    formatTechMessage(text) {
        return text
            .replace(/```([\s\S]*?)```/g, '<pre style="background:#1a1a2e;padding:12px;border-radius:8px;font-size:clamp(11px,2.5vw,12px);overflow-x:auto;font-family:monospace;margin:8px 0;border-left:4px solid #00ff88;max-height:300px;overflow-y:auto;">$1</pre>')
            .replace(/(\d+%)/g, '<span style="color:#00d4ff;font-weight:bold">$1</span>')
            .replace(/(\d+\.?\d*°C)/g, '<span style="color:#ffaa00;font-weight:bold">$1</span>')
            .replace(/(\d+\.?\d*GB)/g, '<span style="color:#00ff88;font-weight:bold">$1</span>');
    }
}

window.addEventListener('load', () => new TechAIChatApp());
