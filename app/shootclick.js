function placeShotAt(x, y) {
    const img = document.createElement('img');
    img.src = 'img/bullet.png';
    img.style.position = 'absolute';
    const imgWidth = 20;
    const imgHeight = 20;
    img.style.width = imgWidth + 'px';
    img.style.height = imgHeight + 'px';
    img.style.pointerEvents = 'none';

    // Center the image on (x, y)
    img.style.left = (x - imgWidth / 2) + 'px';
    img.style.top = (y - imgHeight / 2) + 'px';

    document.body.appendChild(img);

    setTimeout(() => {
        img.remove();
  }, 500);
}

document.addEventListener('click', (event) => {
  placeShotAt(event.clientX, event.clientY, 'img/bullet.png');
});