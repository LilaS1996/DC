class TechAIChatApp {
    constructor() {
        this.messages = [];
        this.currentUser = '用戶';
        this.aiName = '神經鏈AI';
        this.isTyping = false;
        this.tokenCount = 0;
        this.conversationContext = []; // 對話上下文
        this.init();
    }
    
    init() {
        this.messagesEl = document.getElementById('messages');
        this.inputEl = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.typingEl = document.getElementById('typing-indicator');
        
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.inputEl.value = btn.dataset.reply;
                this.sendMessage();
            });
        });
        
        // 智能歡迎訊息
        setTimeout(() => {
            this.addAIMessage('⟐ 神經網路已啟動\n智能對話模式啟用\n請問有什麼可以協助您的？（系統狀態/程式碼/數據分析）');
        }, 1000);
        
        this.updateMessages();
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
        
        setTimeout(() => this.getSmartResponse(text), 800 + Math.random() * 1200);
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
    
    getSmartResponse(userMessage) {
        this.showTyping();
        
        setTimeout(() => {
            const response = this.generateSmartResponse(userMessage);
            this.conversationContext.push({role: 'ai', content: response});
            // 保留最近10條對話
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
    
    showTyping() { this.isTyping = true; this.typingEl.style.display = 'flex'; }
    hideTyping() { this.isTyping = false; this.typingEl.style.display = 'none'; }
    
    // === 智能中文NLP引擎 ===
    generateSmartResponse(message) {
        const msg = message.toLowerCase().trim();
        let confidence = 0;
        let bestResponse = '';
        
        // 1. 天氣查詢（多種說法）
        if (this.checkWeatherIntent(msg)) {
            return `🌤️ **台北即時天氣**\n溫度: ${20+Math.floor(Math.random()*15)}°C\n狀態: ${['晴天', '多雲', '小雨', '陰天'][Math.floor(Math.random()*4)]}\n舒適度: 良好\n💡 建議: ${msg.includes('明天') ? '明天穿薄外套' : '今天適合出門'}`;
        }
        
        // 2. 程式相關（超強關鍵字）
        if (this.checkCodeIntent(msg)) {
            return this.generateCodeResponse(msg);
        }
        
        // 3. 系統狀態
        if (msg.includes('系統狀態') || msg.includes('狀態') || msg.includes('status')) {
            return `⟐ **系統診斷報告**
🖥️ CPU: ${Math.floor(Math.random()*10)+90}% | 💾 記憶體: ${Math.floor(Math.random()*20)+20}/${64}GB
🎮 GPU: ${Math.floor(Math.random()*10)+80}% | 🌐 網路: 1.${Math.floor(Math.random()*9)+1}Gbps
⏱️ 延遲: ${30+Math.floor(Math.random()*20)}ms | 🔋 狀態: 所有系統正常運作`;
        }
        
        // 4. 數據分析
        if (this.checkDataIntent(msg)) {
            return `📊 **智能數據分析**
✅ 模式辨識率: ${(92+Math.random()*8).toFixed(1)}%
⚠️ 異常偵測: ${(Math.random()*2).toFixed(2)}%
🎯 預測準確度: ${(87+Math.random()*13).toFixed(1)}%
📈 趨勢: ${['上升', '穩定', '下降'][Math.floor(Math.random()*3)]}
💡 建議: ${['持續觀察', '優化參數', '調整策略'][Math.floor(Math.random()*3)]}`;
        }
        
        // 5. 笑話/娛樂
        if (this.checkJokeIntent(msg)) {
            const jokes = [
                '🐱 為什麼程式設計師喜歡貓？因為 cat 命令很方便！😸',
                '🤖 問：AI最怕什麼？答：沒電的時候！⚡️',
                '💻 為什麼電腦喜歡跳舞？因為它會『運算』！💃'
            ];
            return `😂 **AI笑話時間**\n${jokes[Math.floor(Math.random()*3)]}`;
        }
        
        // 6. 自我介紹
        if (this.checkAboutIntent(msg)) {
            return `👋 **關於神經鏈AI**\n我是基於深度學習的神經網路助手\n💾 參數量: 1750億\n⚙️ 架構: Transformer + 神經鏈技術\n🎯 專長: 程式碼生成、數據分析、系統診斷\n🚀 目標: 成為您最可靠的數字夥伴！`;
        }
        
        // 7. 時間/日期查詢
        if (msg.includes('現在幾點') || msg.includes('時間') || msg.includes('日期')) {
            const now = new Date();
            return `🕐 **即時時間**\n${now.toLocaleString('zh-TW', { 
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false 
            })}`;
        }
        
        // 8. 數學計算
        if (this.checkMathIntent(msg)) {
            return this.handleMath(msg);
        }
        
        // 9. 通用智能回應（基於上下文）
        return this.generateContextualResponse(msg);
    }
    
    // === 智能意圖識別 ===
    checkWeatherIntent(msg) {
        const weatherKeywords = ['天氣', '溫度', '氣溫', '雨', '晴', '陰天', '多雲'];
        return weatherKeywords.some(keyword => msg.includes(keyword));
    }
    
    checkCodeIntent(msg) {
        const codeKeywords = ['程式', '代碼', 'html', 'css', 'javascript', 'js', 'python', '寫', '生成'];
        return codeKeywords.some(keyword => msg.includes(keyword));
    }
    
    checkDataIntent(msg) {
        const dataKeywords = ['分析', '數據', '資料', '統計', '圖表'];
        return dataKeywords.some(keyword => msg.includes(dataKeyword));
    }
    
    checkJokeIntent(msg) {
        const jokeKeywords = ['笑話', '搞笑', '好笑', '開心'];
        return jokeKeywords.some(keyword => msg.includes(keyword));
    }
    
    checkAboutIntent(msg) {
        const aboutKeywords = ['你', '誰', '什麼', '介紹', '你是'];
        return aboutKeywords.some(keyword => msg.includes(keyword));
    }
    
    checkMathIntent(msg) {
        return /\d+[\+\-\*\/]\d+/.test(msg) || msg.includes('計算');
    }
    
    // === 專用回應生成 ===
    generateCodeResponse(msg) {
        if (msg.includes('按鈕')) {
            return `🎨 **響應式按鈕程式碼**
\`\`\`html
<button class="neon-btn">霓虹按鈕</button>
<style>
.neon-btn {
  background: linear-gradient(45deg, #00ff88, #00d4ff);
  border: none; padding: 15px 30px;
  border-radius: 50px; color: #000;
  font-weight: bold; cursor: pointer;
  box-shadow: 0 5px 20px rgba(0,255,136,0.4);
  transition: all 0.3s;
}
.neon-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 30px rgba(0,255,136,0.6);
}
</style>
\`\`\`
✨ 複製貼上即可使用！`;
        }
        return `💻 **動態計數器範例**
\`\`\`javascript
// 數字滾動動畫
function countUp(target, duration = 2000) {
  let start = 0, startTime = Date.now();
  function update() {
    const elapsed = Date.now() - startTime;
    start = Math.min(elapsed * (target / duration) * 60, target);
    document.getElementById('counter').textContent = Math.floor(start);
    if (start < target) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
\`\`\`
⚡ 支援任何數字動畫效果！`;
    }
    
    handleMath(msg) {
        const match = msg.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/);
        if (match) {
            const [, a, op, b] = match.map(Number, parseFloat);
            let result;
            switch(op) {
                case '+': result = a + b; break;
                case '-': result = a - b; break;
                case '*': result = a * b; break;
                case '/': result = b !== 0 ? a / b : '∞'; break;
            }
            return `🧮 **運算結果**
${a} ${op} ${b} = **${result}**`;
        }
        return `❓ 請輸入明確的數學運算，如「25 + 17」或「100 * 3.5」`;
    }
    
    generateContextualResponse(msg) {
        const contextualReplies = [
            '🤔 很有意思的問題！可以再詳細說明嗎？',
            '💡 我理解您的意思，是否需要程式碼範例或數據分析？',
            '🔍 正在分析您的問題，請問是關於程式、天氣還是系統狀態？',
            '⚙️ 建議使用快捷按鈕：系統狀態 / 生成程式碼 / 數據分析'
        ];
        return contextualReplies[Math.floor(Math.random() * contextualReplies.length)];
    }
    
    updateTokens() {
        document.getElementById('tokens').textContent = this.tokenCount.toLocaleString();
    }
    
    updateMessages() {
        this.messagesEl.innerHTML = this.messages.map((msg, index) => `
            <div class="message ${msg.type}" style="animation-delay: ${index * 0.1}s">
                <div class="username ${msg.type}">${msg.user}</div>
                <div class="message-content">${this.formatTechMessage(msg.text)}</div>
                <div style="font-size:11px;color:#66aabb;margin-top:6px;letter-spacing:1px;">
                    ${msg.time} | 進程ID:${Math.floor(Math.random()*9999)}
                </div>
            </div>
        `).join('');
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }
    
    formatTechMessage(text) {
        return text
            .replace(/```([\s\S]*?)```/g, '<pre style="background:#1a1a2e;padding:15px;border-radius:8px;font-size:12px;overflow-x:auto;font-family:monospace;margin:10px 0;border-left:4px solid #00ff88;">$1</pre>')
            .replace(/(\d+%)/g, '<span style="color:#00d4ff;font-weight:bold">$1</span>')
            .replace(/(\d+\.?\d*°C)/g, '<span style="color:#ffaa00;font-weight:bold">$1</span>')
            .replace(/(\d+\.?\d*GB)/g, '<span style="color:#00ff88;font-weight:bold">$1</span>');
    }
}

window.addEventListener('load', () => new TechAIChatApp());
