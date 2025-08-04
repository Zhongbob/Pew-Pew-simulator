const saveBtn = document.getElementById('saveBtn');
const clientIdInput = document.getElementById('clientIdInput');
const message = document.getElementById('message');
const freeplayBtn = document.getElementById('freeplayBtn');
const survivalBtn = document.getElementById('survivalBtn');
const createRoomBtn = document.querySelector('.create');
const error = document.getElementById('error');
let roomType = null; // Default room type
freeplayBtn.addEventListener('click', () => {
  roomType = 'freeplay';
  freeplayBtn.setAttribute('data-selected', 'true');
  survivalBtn.setAttribute('data-selected', 'false');
});

survivalBtn.addEventListener('click', () => {
  roomType = 'survival';
  survivalBtn.setAttribute('data-selected', 'true');
  freeplayBtn.setAttribute('data-selected', 'false');
});

createRoomBtn.addEventListener('click', (event) => {
  event.preventDefault();
  if (!roomType) {
    error.textContent = "Please select a room type.";
    return
  }
  fetch('/create_room', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ room_type: roomType }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.error) {
      error.textContent = data.error;
    } else {
      window.location.href = `/room/${data.id}`;
    }
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
    error.textContent = "An error occurred while creating the room.";
  });
})