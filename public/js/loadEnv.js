
function spawnScreenTarget() {
  const etsContainer = document.getElementById("ets-container");
  if (etsContainer) {
    const etsScreen = document.createElement("div");
    etsScreen.id = "etsScreen";
    etsScreen.style.top = '0';
    etsScreen.style.left = '0';
    etsScreen.style.right = '0';
    etsScreen.style.bottom = '0';
    etsScreen.style.padding = "17% 15% 35% 15%"; // T R B L
    etsScreen.style.position = "absolute";
    etsScreen.style.boxSizing = "border-box";
    etsScreen.style.display = "flex";
    etsScreen.style.justifyContent = "flex-start"; // Align left
    etsScreen.style.alignItems = "center"; // Align Top
    etsContainer.appendChild(etsScreen);


    //Creating Target board inside etsScreen
    const target = document.createElement("img");
    target.src = "/public/assets/target-bw.PNG";  // Make sure this path is correct
    target.id = "ScreenTarget";

    target.style.alignSelf = "flex-start";
    target.style.pointerEvents = 'auto';  // allow clicks if needed
    target.style.width = "47%";       // Make it fill the padded area
    target.style.height = "auto";      // Stretches to fill the height inside the padding
    target.style.objectFit = "contain"; // Keep aspect ratio (can use cover too)

  // Add to body
    etsScreen.appendChild(target);
    etsScreen.addEventListener('click', () => {
        spawnScreenButtons();
        }, { once: true });
    }
}

function spawnScreenButtons(){
    const etsScreen = document.getElementById("etsScreen");
    const buttonsDiv = document.createElement("div");
    buttonsDiv.style.display = "flex";
    buttonsDiv.style.gap = "5px"; // spacing between buttons
    buttonsDiv.style.flexDirection = "column";
    buttonsDiv.style.alignItems = "center";
    buttonsDiv.style.padding = "3%";

    const difficulty = document.createElement("p");
    difficulty.textContent = "Difficulty Level";
    difficulty.style.color = "white";
    difficulty.style.margin = "0";
    difficulty.style.fontWeight = "bold";
    difficulty.style.textAlign = "center";

    // Function to create a styled button
    function createStyledButton(text, id) {
        const button = document.createElement("button");
        button.textContent = text;
        button.id = id;
        button.style.width = "100%";
        button.style.padding = "3px";
        button.style.boxSizing = "border-box";
        button.style.fontSize = "10px";
        button.style.cursor = "pointer";
        return button;
    }

    const easy = createStyledButton("Easy", "easy");
    const mid = createStyledButton("Mid", "mid");
    const marksmen = createStyledButton("Marksmen", "marksmen");

    buttonsDiv.appendChild(difficulty);
    buttonsDiv.appendChild(easy);
    buttonsDiv.appendChild(mid);
    buttonsDiv.appendChild(marksmen);
    etsScreen.appendChild(buttonsDiv); 

    // Level Selector
    const currentPercent = document.createElement("p");
    currentPercent.textContent = "0/0 (0%)";
    currentPercent.id = "currentPercent";
    currentPercent.style.fontSize = "22px";
    currentPercent.style.color = "white";
    currentPercent.style.margin = "0";
    currentPercent.style.fontWeight = "bold";
    currentPercent.style.textAlign = "center";

    function clearScreen(){
        buttonsDiv.innerHTML = "";
    }

    function start(mode){
        const startButton = createStyledButton("Start", "start");
        buttonsDiv.appendChild(startButton);
        startButton.addEventListener("click", () => {
            console.log("Start!")
            
        });
    }

    easy.addEventListener("click", () => {
        console.log("Easy pressed!");
        clearScreen();
        start("easy");
    });
    mid.addEventListener("click", () => {
        console.log("Mid pressed!");
        clearScreen();
        start("mid");
    });
    marksmen.addEventListener("click", () => {
        console.log("Marksmen pressed!");
        clearScreen();
        start("marksmen");
    });
}

function slideInElements() {
    // get Backdrop
    document.body.classList.add("activated");

    // Trigger slide-in after a small delay to ensure rendering
    requestAnimationFrame(() => {
        // spawnScreenTarget();
    });
}

function loadStartingEnv() {
    // Prevent page scroll
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    // Backdrop
    const backdrop = document.getElementById("backdrop");
    // Zoom out from beginning
    document.body.addEventListener('click', () => {
    slideInElements();
    }, { once: true }); // Only allow one trigger
}


