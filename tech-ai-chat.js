// tech-ai-chat.js - 真正的AI連接版本
class TechAIChatApp {
    constructor() {
        this.messages = [];
        this.currentUser = '用戶';
        this.aiName = '神經鏈AI';
        this.isTyping = false;
        this.tokenCount = 0;
        this.conversationContext = [];
        this.API_KEY = 'Aimer's Organization'; // 替換成你的API Key
        this.init();
    }

    init() {
        // ... 保持原有初始化代碼 ...
        this.messagesEl = document.getElementById('messages');
        this.inputEl = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.typingEl = document.getElementById('typing-indicator');
        this.sidebarEl = document.getElementById('sidebar');
        this.menuToggle = document.getElementById('menu-toggle');
        this.chatContainer = document.querySelector('.chat-container');
        
        // 原有事件綁定保持不變
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.inputEl.value = btn.dataset.reply;
                this.sendMessage();
            });
        });

        // 智能歡迎訊息
        setTimeout(() => {
            this.addAIMessage('⟐ 神經鏈AI已連線雲端\n✅ 支援Perplexity/OpenAI實時對話\n請輸入問題開始對話...');
        }, 800);
        
        this.updateMessages();
        this.updateLatency();
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
            const response = await this.callRealAI(text);
            this.addAIMessage(response);
        } catch (error) {
            this.addAIMessage('❌ 連線錯誤，請檢查API Key或網路連線\n' + error.message);
        } finally {
            this.hideTyping();
            this.sendBtn.disabled = false;
            this.inputEl.focus();
        }
    }

    // 🔥 核心：連接真實AI API
    async callRealAI(message) {
        // 選項1: Perplexity API (推薦)
        return await this.callPerplexityAPI(message);
        
        // 選項2: OpenAI API (備用)
        // return await this.callOpenAIAPI(message);
    }

    // Perplexity API 整合
    async callPerplexityAPI(message) {
        const apiKey = this.API_KEY;
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            throw new Error('請先設定API Key');
        }

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama-3.1-sonar-small-128k-online", // 或其他模型
                messages: [
                    {
                        role: "system",
                        content: "你是神經鏈AI，科技專家，使用專業技術語言回應，保持cyberpunk風格。"
                    },
                    { role: "user", content: message }
                ],
                max_tokens: 1000,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`API錯誤: ${response.status}`);
        }

        const data = await response.json();
        this.tokenCount += data.usage?.total_tokens || message.length * 2;
        this.updateTokens();
        
        return data.choices[0].message.content;
    }

    // OpenAI API 備用方案
    async callOpenAIAPI(message) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "你是神經鏈AI，科技專家，回應簡潔專業，cyberpunk風格。"
                    },
                    { role: "user", content: message }
                ],
                max_tokens: 800
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // 保持原有UI方法不變
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
}

// 啟動應用
window.addEventListener('load', () => new TechAIChatApp());
