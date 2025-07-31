
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
            clearScreen();
            buttonsDiv.appendChild(currentPercent);
            resetStats();
            updateAccuracy();
            playLevel(mode);
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
    const backdrop = document.getElementById("backdrop");

    // ----- Roof -----
    const roof = document.createElement("img");
    roof.src = "/public/assets/roof.PNG";
    roof.style.position = "absolute";
    roof.style.top = "0";
    roof.style.left = "50%";
    roof.style.transform = "translate(-50%, -150%)"; // slide in from top
    roof.style.transition = "transform 1s ease-out";
    roof.style.pointerEvents = "none";

    roof.style.width = "100vw"; // Fill top
    roof.style.maxHeight = "60vh"; // Prevent it from being too tall
    backdrop.appendChild(roof);

    // ----- Table -----
    const table = document.createElement("img");
    table.src = "/public/assets/table.PNG";
    table.style.position = "absolute";
    table.style.bottom = "0";
    table.style.left = "50%";
    table.style.transform = "translate(-50%, 150%)"; // slide in from bottom
    table.style.transition = "transform 1s ease-out";

    table.style.width = "100vw"; // Fill bottom 
    table.style.maxHeight = "60vh"; // Prevent it from being too tall
    backdrop.appendChild(table);

    // ----- ETS -----
    // Create ETS container
    const etsContainer = document.createElement("div");
    etsContainer.id = "ets-container";
    etsContainer.style.position = "fixed";
    etsContainer.style.bottom = "0";
    etsContainer.style.right = "0";
    etsContainer.style.width = "13vw";
    etsContainer.style.maxHeight = "30vh";
    etsContainer.style.overflow = "hidden"; // optional safety
    etsContainer.style.transform = "translateY(100%)";
    etsContainer.style.transition = "transform 1.2s ease-out";

    // Create ETS image
    const ets = document.createElement("img");
    ets.src = "/public/assets/ets-monitor.PNG";
    ets.style.width = "100%"; 
    ets.style.height = "auto"; 
    ets.style.objectFit = "contain"; // Maintains aspect ratio
    
    etsContainer.appendChild(ets)
    backdrop.appendChild(etsContainer);

    // Trigger slide-in after a small delay to ensure rendering
    requestAnimationFrame(() => {
        roof.style.transform = "translate(-50%, 0%)";
        table.style.transform = "translate(-50%, 0%)";
        etsContainer.style.transform = "translate(-15%, -15%)";

        spawnScreenTarget();
    });
}

function loadStartingEnv() {
    // Prevent page scroll
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    // Backdrop
    const backdrop = document.createElement("div");
    backdrop.id = "backdrop"
    backdrop.style.position = "fixed";
    backdrop.style.top = "0";
    backdrop.style.left = "0";
    backdrop.style.width = "100vw";
    backdrop.style.height = "100vh";
    backdrop.style.backgroundImage = "url('/public/assets/range.PNG')";
    backdrop.style.backgroundSize = "cover";
    backdrop.style.backgroundPosition = "center";
    backdrop.style.backgroundRepeat = "no-repeat";
    backdrop.style.zIndex = "-1"; // Put behind everything

    backdrop.style.transform = "scale(1.5)";
    backdrop.style.filter = "blur(10px)";
    backdrop.style.transition = "transform 1s ease, filter 1s ease";

    document.body.appendChild(backdrop);

    // Humps
    const humps = document.createElement("img");
    humps.style.position = "fixed";
    humps.style.top = "0";
    humps.style.left = "0";
    humps.style.width = "100vw";
    humps.style.height = "100vh";
    humps.style.backgroundImage = "url('/public/assets/humps.PNG')";
    humps.style.backgroundSize = "cover";
    humps.style.backgroundPosition = "center";
    humps.style.backgroundRepeat = "no-repeat";
    humps.style.pointerEvents = "none";
    humps.style.zIndex = "1";

    backdrop.appendChild(humps);

    // Zoom out from beginning
    document.body.addEventListener('click', () => {
    backdrop.style.transform = "scale(1)";
    backdrop.style.filter = "blur(0px)";
    slideInElements();
    }, { once: true }); // Only allow one trigger
}


