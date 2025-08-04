const saveBtn = document.getElementById('saveBtn');
const clientIdInput = document.getElementById('clientIdInput');
const message = document.getElementById('message');

saveBtn.addEventListener('click', () => {
  const clientId = clientIdInput.value.trim();
  if (clientId) {
    localStorage.setItem('clientId', clientId);
    message.textContent = "✅ Client ID saved!";
  } else {
    message.textContent = "⚠️ Please enter a valid Client ID.";
  }
});
