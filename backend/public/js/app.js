// Ganti dengan URL WebSocket server Anda
const db = new RealtimeDB('ws://localhost:8008');

// Elemen DOM
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const usernameInput = document.getElementById('username-input');
const setUsernameButton = document.getElementById('set-username');

let username = 'Anonymous';

// Set username
setUsernameButton.addEventListener('click', () => {
    const newUsername = usernameInput.value.trim();
    if (newUsername) {
        username = newUsername;
        usernameInput.value = '';
        addSystemMessage(`Username diubah menjadi: ${username}`);
    }
});

// Kirim pesan saat tombol diklik atau enter ditekan
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText) {
        const timestamp = new Date().toISOString();
        const message = {
            username,
            text: messageText,
            timestamp
        };
        
        // Simpan pesan ke database
        db.set(`messages/${timestamp}`, message);
        
        messageInput.value = '';
    }
}

// Subscribe untuk menerima update pesan
db.on('messages', (messages) => {
    // Kosongkan chat
    chatMessages.innerHTML = '';
    
    // Jika messages tidak null, tampilkan semua pesan
    if (messages) {
        // Urutkan pesan berdasarkan timestamp
        const sortedMessages = Object.entries(messages)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]));
        
        sortedMessages.forEach(([timestamp, msg]) => {
            addMessageToChat(msg);
        });
    }
});

function addMessageToChat(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    // Tentukan apakah pesan dikirim oleh user saat ini
    if (message.username === username) {
        messageDiv.classList.add('sent');
    } else {
        messageDiv.classList.add('received');
    }
    
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('message-info');
    infoDiv.textContent = `${message.username} - ${new Date(message.timestamp).toLocaleTimeString()}`;
    
    const textDiv = document.createElement('div');
    textDiv.textContent = message.text;
    
    messageDiv.appendChild(infoDiv);
    messageDiv.appendChild(textDiv);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll ke bawah
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addSystemMessage(text) {
    const systemMessage = document.createElement('div');
    systemMessage.classList.add('alert', 'alert-info', 'text-center', 'py-1', 'my-2');
    systemMessage.textContent = text;
    chatMessages.appendChild(systemMessage);
    
    // Scroll ke bawah
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Pesan selamat datang
addSystemMessage('Selamat datang di chat room! Silakan set username Anda.');