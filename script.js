class CravtAI {
    constructor() {
        this.url = 'http://localhost:5000/chat'; // ← ЗАМЕНИ НА RENDER URL
        this.chats = JSON.parse(localStorage.chats||'[]');
        this.curChat = null;
        this.init();
    }
    init() {
        if(!this.chats.length) this.newChat();
        else this.curChat = this.chats[0].id;
        this.renderChats();
        this.renderMessages();
        document.getElementById('input').addEventListener('keypress',e=>{
            if(e.key==='Enter') this.sendMsg();
        });
    }
    async sendMsg() {
        const text = document.getElementById('input').value.trim();
        if(!text) return;
        this.addMsg('user',text);
        document.getElementById('input').value = '';
        document.getElementById('send').disabled = true;
        const aiId = this.addMsg('ai','');
        try {
            const res = await fetch(this.url,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({message:text})
            });
            const data = await res.json();
            this.updateMsg(aiId,data.reply);
        } catch(e) {
            this.updateMsg(aiId,'Backend недоступен');
        }
        document.getElementById('send').disabled = false;
    }
    addMsg(role,text) {
        const chat = this.getChat();
        const msg = {id:Date.now(),role,text,t: new Date().toISOString()};
        chat.messages.push(msg);
        localStorage.chats = JSON.stringify(this.chats);
        this.renderMessages();
        return msg.id;
    }
    updateMsg(id,text) {
        const chat = this.getChat();
        const msg = chat.messages.find(m=>m.id===id);
        msg.text = text;
        localStorage.chats = JSON.stringify(this.chats);
        this.renderMessages();
    }
    getChat() {
        return this.chats.find(c=>c.id===this.curChat)||this.newChat();
    }
    newChat() {
        const chat = {id:`c${Date.now()}`,title:'Новый чат',messages:[]};
        this.chats.unshift(chat);
        this.curChat = chat.id;
        localStorage.chats = JSON.stringify(this.chats);
        this.renderChats();
        this.renderMessages();
    }
    deleteChat() {
        if(confirm('Удалить?')) {
            this.chats = this.chats.filter(c=>c.id!==this.curChat);
            if(this.chats.length) this.curChat = this.chats[0].id;
            else this.newChat();
            localStorage.chats = JSON.stringify(this.chats);
            this.renderChats();
            this.renderMessages();
        }
    }
    renderChats() {
        document.getElementById('chats').innerHTML = this.chats.map(chat=>
            `<div class="chat-item ${chat.id===this.curChat?'active':''}" onclick="aiChat.setChat('${chat.id}')">
                <i class="fas fa-message"></i>
                <div>${chat.title}</div>
            </div>`
        ).join('');
    }
    renderMessages() {
        const chat = this.getChat();
        document.getElementById('messages').innerHTML = chat.messages.map(msg=>
            `<div class="message ${msg.role}">${msg.text}</div>`
        ).join('');
        document.getElementById('title').textContent = chat.title;
        setTimeout(()=>document.getElementById('messages').scrollTop=99999,100);
    }
    setChat(id) {
        this.curChat = id;
        this.renderChats();
        this.renderMessages();
        toggleSidebar();
    }
    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('collapsed');
    }
    copyLast() {
        const chat = this.getChat();
        const last = chat.messages.filter(m=>m.role==='ai').pop();
        if(last) navigator.clipboard.writeText(last.text);
    }
    exportChat() {
        const chat = this.getChat();
        const text = chat.messages.map(m=>`${m.role==='user'?'You':'AI'}: ${m.text}`).join('\n\n');
        const a = document.createElement('a');
        a.href = 'data:text/plain;charset=utf-8,'+encodeURIComponent(text);
        a.download = 'cravt-chat.txt';
        a.click();
    }
}
const aiChat = new CravtAI();
function newChat(){aiChat.newChat()}
function deleteChat(){aiChat.deleteChat()}
function sendMsg(){aiChat.sendMsg()}
function toggleSidebar(){aiChat.toggleSidebar()}
function copyLast(){aiChat.copyLast()}
function exportChat(){aiChat.exportChat()}
