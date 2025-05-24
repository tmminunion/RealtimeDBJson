const db = new RealtimeDB(window.CONFIG.WSS_URL);
console.log(window.CONFIG.WSS_URL);
const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

let username = "Anonymous";

document.addEventListener("DOMContentLoaded", () => {
  const storedUsername = localStorage.getItem("chatUsername");
  const usernameModal = new bootstrap.Modal(
    document.getElementById("usernameModal")
  );

  if (storedUsername) {
    username = storedUsername;
    addSystemMessage(`Selamat datang kembali, ${username}`);
  } else {
    usernameModal.show();
  }

  document
    .getElementById("modal-set-username")
    .addEventListener("click", () => {
      const input = document
        .getElementById("modal-username-input")
        .value.trim();
      if (input) {
        username = input;
        localStorage.setItem("chatUsername", username);
        addSystemMessage(`Username diset: ${username}`);
        usernameModal.hide();
      }
    });
});

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
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
      timestamp,
    };

    db.push(`messages`, message);
    messageInput.value = "";
  }
}

db.on("messages", (messages) => {
  chatMessages.innerHTML = "";

  if (messages) {
    const sortedMessages = Object.entries(messages).sort(
      (a, b) => new Date(a[0]) - new Date(b[0])
    );

    sortedMessages.forEach(([_, msg]) => {
      addMessageToChat(msg);
    });
  }
});

function addMessageToChat(message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("p-2", "mb-2", "rounded");

  if (message.username === username) {
    messageDiv.classList.add("text-end");
  } else {
    messageDiv.classList.add("text-start");
  }

  messageDiv.style.backgroundColor = getUsernameColor(message.username);

  const infoDiv = document.createElement("div");
  infoDiv.classList.add("small", "fw-bold");
  infoDiv.textContent = `${message.username} - ${new Date(
    message.timestamp
  ).toLocaleTimeString()}`;

  const textDiv = document.createElement("div");
  textDiv.textContent = message.text;

  messageDiv.appendChild(infoDiv);
  messageDiv.appendChild(textDiv);
  chatMessages.appendChild(messageDiv);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addSystemMessage(text) {
  const systemMessage = document.createElement("div");
  systemMessage.classList.add(
    "alert",
    "alert-info",
    "text-center",
    "py-1",
    "my-2"
  );
  systemMessage.textContent = text;
  chatMessages.appendChild(systemMessage);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getUsernameColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 85%)`;
}

db.get("messages", (messages) => {
  chatMessages.innerHTML = "";

  if (messages) {
    const sortedMessages = Object.entries(messages).sort(
      (a, b) => new Date(a[0]) - new Date(b[0])
    );

    sortedMessages.forEach(([_, msg]) => {
      addMessageToChat(msg);
    });
  }
});
