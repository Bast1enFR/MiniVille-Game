// script.js

import Game from './classe/Game.js';
import config from './config.js';
import { saveGame, loadGame, clearSave } from './save/save.js';

/**
 * Displays a popup message at the top center of the screen.
 * @param {string} message - The message to display in the popup.
 */
function showPopup(message) {
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 1000;
    `;
    document.body.appendChild(popup);

    // Remove the popup after 3 seconds
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

/**
 * Animates the production of resources from one cell to another.
 * Creates an image element and moves it from the center of the fromCell to the center of the toCell.
 * @param {HTMLElement} fromCell - The cell from which the resource is being produced.
 * @param {HTMLElement} toCell - The cell to which the resource is being produced.
 * @param {string} resourceImage - The URL of the image representing the resource.
 */
function animateProduction(fromCell, toCell, resourceImage) {
    const fromRect = fromCell.getBoundingClientRect();
    const toRect = toCell.getBoundingClientRect();

    const img = document.createElement('img');
    img.src = resourceImage;
    img.style.cssText = `
        position: absolute;
        width: 20px;
        height: 20px;
        z-index: 1001;
        border-radius: 50%;
        pointer-events: none;
    `;
    document.body.appendChild(img);

    // Animate the image
    img.animate([
        {
            top: fromRect.top + fromRect.height / 2 - 10 + 'px',
            left: fromRect.left + fromRect.width / 2 - 10 + 'px',
            opacity: 1
        },
        {
            top: toRect.top + toRect.height / 2 - 10 + 'px',
            left: toRect.left + toRect.width / 2 - 10 + 'px',
            opacity: 0
        }
    ], {
        duration: 1000,
        iterations: 1,
        easing: 'ease-in-out'
    }).finished.then(() => {
        img.remove();
    });
}

// Event listener to initialize the game after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const game = new Game(config);

    // Load saved game state, if available
    const savedState = loadGame();
    if (savedState) {
        game.resources = savedState.resources;
        game.grid = savedState.grid;
        game.buildings = savedState.buildings;
        game.realTimer = savedState.realTimer;
        game.init();
        game.updateBuildingSummary();
    }

    game.init();
    game.startTimer();

    const buildingButtonsContainer = document.getElementById('building-buttons-container');

    // Create building buttons dynamically based on the configuration
    for (const buildingType in config.buildingData) {
        if (Object.hasOwnProperty.call(config.buildingData, buildingType)) { // Safe check
            const building = config.buildingData[buildingType];
            const button = document.createElement('button');
            button.dataset.building = buildingType;

            // Format the building cost string with resource images
            let costString = '';
            for (const resource in building.cost) {
                if (Object.hasOwnProperty.call(building.cost, resource)) { // Safe check
                    costString += `<img src="${config.resources[resource].image}" alt="${resource}" style="width: 20px; height: 20px; vertical-align: middle;"> ${building.cost[resource]}  `;
                }
            }

            button.innerHTML = `${building.name} : (${costString})`;
            button.id = `building-button-${buildingType}`;
            buildingButtonsContainer.appendChild(button);
        }
    }

    // Attach event listener to the building buttons container
    buildingButtonsContainer.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON') {
            const buildingType = event.target.dataset.building;
            game.initiateBuildingPlacement(buildingType);
        }
    });

    /**
     * Updates the background color of the building buttons based on resource availability.
     */
    game.updateButtonColors = function() {
        for (const buildingType in config.buildingData) {
            if (Object.hasOwnProperty.call(config.buildingData, buildingType)) { // Safe check
                const building = config.buildingData[buildingType];
                const button = document.getElementById(`building-button-${buildingType}`);
                let canAfford = true;

                // Check if the player can afford the building
                for (const resource in building.cost) {
                    if (Object.hasOwnProperty.call(building.cost, resource)) { // Safe check
                        if (game.resources[resource] < building.cost[resource]) {
                            canAfford = false;
                            break;
                        }
                    }
                }

                button.style.backgroundColor = canAfford ? '#4CAF50' : '#f44336';
            }
        }
    };

    // Initial button color update
    game.updateButtonColors();

    /**
     * Updates the resource display in the sidebar.
     */
    game.updateResourceDisplay = function() {
        const bleDisplay = document.getElementById('ble-resource');
        const painDisplay = document.getElementById('pain-resource');
        const hommesDisplay = document.getElementById('hommes-resource');
        const argentDisplay = document.getElementById('argent-resource');

        bleDisplay.textContent = game.resources['ble'];
        painDisplay.textContent = game.resources['pain'];
        hommesDisplay.textContent = game.resources['hommes'];
        argentDisplay.textContent = game.resources['argent'];

        this.updateButtonColors(); // Update button colors after resource update
    };

    // Save and clear save buttons event listeners
    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', () => {
        saveGame(game);
        showPopup('Jeu sauvegardé !');
    });

    const clearSaveButton = document.getElementById('clear-save-button');
    clearSaveButton.addEventListener('click', () => {
        clearSave();
        showPopup('Sauvegarde effacée !');
        location.reload();
    });

    // Override the default alert function
    window.alert = showPopup;

    /**
     * Starts random production animations between buildings.
     */
    game.startRandomProductionAnimations = function() {
        config.productionChains.forEach(({ from, to }) => {
            const fromBuildingData = config.buildingData[from];
            const toBuildingData = config.buildingData[to];

            // Skip if building data is missing
            if (!fromBuildingData || !toBuildingData) {
                return;
            }

            const fromCells = Array.from(document.querySelectorAll(`#grid-container > div > img[src*='${fromBuildingData.image}']`));
            const toCells = Array.from(document.querySelectorAll(`#grid-container > div > img[src*='${toBuildingData.image}']`));

            // Skip if no buildings of this type are present
            if (!fromCells.length || !toCells.length) {
                return;
            }

            const availableToCells = [...toCells]; // Create a copy of toCells

            for (let i = 0; i < fromCells.length; i++) {
                const fromCell = fromCells[i];

                // If all toCells have been used, reset the available cells
                if (availableToCells.length === 0) {
                    availableToCells.push(...toCells);
                }

                // Select a random toCell from the available cells
                const randomIndex = Math.floor(Math.random() * availableToCells.length);
                const toCell = availableToCells[randomIndex];

                availableToCells.splice(randomIndex, 1); // Remove the selected cell from available cells

                // Get the resource image from the configuration
                const resourceImage = config.resources[fromBuildingData.resource].image;

                animateProduction(fromCell.parentElement, toCell.parentElement, resourceImage);
            }
        });
    };

    // Set interval for random production animations
    setInterval(() => {
        game.startRandomProductionAnimations();
    }, 5000);
});