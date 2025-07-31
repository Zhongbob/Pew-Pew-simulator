function placeFireAt(xPercent, yPercent) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const x = xPercent * screenWidth;
    const y = yPercent * screenHeight;

    console.log(`Placing fire at x: ${x}, y: ${y}`);

    const img = document.createElement('img');
    img.src = "img/bullet.png"
    img.style.position = 'absolute';
    img.style.left = x + 'px';
    img.style.top = y + 'px';
    img.style.width = '20px';  // small size
    img.style.height = '20px';
    img.style.pointerEvents = 'none'; // clicks pass through

    document.body.appendChild(img);

  // Remove the image after 1 second (1000 ms)
    setTimeout(() => {
        img.remove();
        console.log('Fire removed');
    }, 1000);
}

