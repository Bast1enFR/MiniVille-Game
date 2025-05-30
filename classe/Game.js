// classe/Game.js

import Building from './Building.js';
import config from '../config.js';

/**
 * The main class that manages the game state and logic.
 */
class Game {
    /**
     * Constructor for the Game class.
     * Initializes the game with the given configuration.
     * @param {object} config - The game configuration object.
     */
    constructor(config) {
        // Initialize resources
        this.resources = {
            'ble': 0,
            'pain': 0,
            'hommes': 0,
            'argent': config.startingMoney
        };
        this.gridSize = config.gridSize;
        this.buildingData = config.buildingData;
        this.buildings = {}; // Track the number of each building type
        this.grid = Array(this.gridSize * this.gridSize).fill(null); // Initialize the game grid

        // Timer variables
        this.timerInterval = null;
        this.realTimerInterval = null;
        this.realTimer = 0; // Actual game time

        this.draggedBuildingIndex = null; // Index of the building being dragged
        this.placingBuilding = null; // Type of building currently being placed

        // Convert building data to Building instances
        this.availableBuildings = {};
        for (const buildingType in this.buildingData) {
            if (Object.hasOwnProperty.call(this.buildingData, buildingType)) { // Safe check
                this.availableBuildings[buildingType] = new Building(buildingType, this.buildingData[buildingType]);
            }
        }

        // Bind methods to the class instance
        this.handleCellClick = this.handleCellClick.bind(this);
        this.cancelPlacement = this.cancelPlacement.bind(this);
    }

    /**
     * Initializes the game state and renders the initial view.
     */
    init() {
        this.renderGrid();
        this.updateResourceDisplay();
        this.updateRealTimerDisplay();
        this.updateBuildingSummary();
    }

    /**
     * Starts the game timers for income and real-time tracking.
     */
    startTimer() {
        // Income timer
        this.timerInterval = setInterval(() => {
            this.earnIncome();
        }, 5000);

        // Real-time timer
        this.realTimerInterval = setInterval(() => {
            this.realTimer++;
            this.updateRealTimerDisplay();
        }, 1000);
    }

    /**
     * Calculates and distributes income based on the buildings owned.
     */
    earnIncome() {
        for (const buildingType in this.buildings) {
            if (Object.hasOwnProperty.call(this.buildings, buildingType)) { // Safe check
                const building = this.availableBuildings[buildingType];
                if (building.resource) {
                    this.resources[building.resource] += building.productionRate * this.buildings[buildingType];
                }
            }
        }

        this.updateResourceDisplay();
    }

    /**
     * Initiates the building placement process.
     * @param {string} buildingType - The type of building to place.
     */
    initiateBuildingPlacement(buildingType) {
        const building = this.availableBuildings[buildingType];
        let canAfford = true;

        // Check if player can afford the building
        for (const resource in building.cost) {
            if (Object.hasOwnProperty.call(building.cost, resource)) { // Safe check
                if (this.resources[resource] < building.cost[resource]) {
                    canAfford = false;
                    break;
                }
            }
        }

        if (canAfford) {
            this.placingBuilding = buildingType;
            this.highlightAvailableCells();

            // Add listeners to cancel placement
            alert('Appuye sur ECHAP pour annuler le placement du bâtiment.');
            document.addEventListener('keydown', this.cancelPlacement);

        } else {
            alert('Pas assez de ressources!');
        }
    }

    /**
     * Cancels the building placement process.
     * @param {Event} event - The event that triggered the cancellation.
     */
    cancelPlacement(event) {
        const gridContainer = document.getElementById('grid-container');
        if (!gridContainer.contains(event.target) || event.key === 'Escape') {
            this.clearHighlighting();
            this.placingBuilding = null;

            // Remove event listeners
            document.removeEventListener('click', this.cancelPlacement);
            document.removeEventListener('keydown', this.cancelPlacement);
        }
    }

    /**
     * Highlights the available cells for building placement.
     */
    highlightAvailableCells() {
        const gridContainer = document.getElementById('grid-container');
        const cells = gridContainer.children;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (this.grid[i] === null) {
                cell.classList.add('available-cell');
                cell.addEventListener('click', this.handleCellClick);
            }
        }
    }

    /**
     * Places a building on the selected cell.
     * @param {number} index - The index of the cell to place the building on.
     */
    placeBuilding(index) {
        if (this.placingBuilding && this.grid[index] === null) {
            const buildingType = this.placingBuilding;
            const building = this.availableBuildings[buildingType];

            // Deduct the building cost
            for (const resource in building.cost) {
                if (Object.hasOwnProperty.call(building.cost, resource)) { // Safe check
                    this.resources[resource] -= building.cost[resource];
                }
            }
            this.updateResourceDisplay();

            // Increment building count
            this.buildings[buildingType] = (this.buildings[buildingType] || 0) + 1;
            this.updateBuildingSummary();

            // Place building on the grid
            this.grid[index] = buildingType;

            this.clearHighlighting();
            this.renderGrid();

            this.placingBuilding = null;

            // Remove event listeners
            document.removeEventListener('click', this.cancelPlacement);
            document.removeEventListener('keydown', this.cancelPlacement);
        }
    }

    /**
     * Clears the highlighting from available cells.
     */
    clearHighlighting() {
        const gridContainer = document.getElementById('grid-container');
        const cells = gridContainer.children;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            cell.classList.remove('available-cell');
            cell.removeEventListener('click', this.handleCellClick);
        }
    }

    /**
     * Handles a click on a grid cell.
     * @param {Event} event - The click event.
     */
    handleCellClick(event) {
        const index = event.target.dataset.index;

        if (this.placingBuilding && this.grid[index] === null) {
            this.placeBuilding(index);
        } else if (this.grid[index]) {
            const buildingType = this.grid[index];
            const building = this.availableBuildings[buildingType];

            // Refund half the building cost
            for (const resource in building.cost) {
                if (Object.hasOwnProperty.call(building.cost, resource)) { // Safe check
                    this.resources[resource] += building.cost[resource] / 2;
                }
            }
            this.updateResourceDisplay();

            // Remove building from grid and update display
            this.grid[index] = null;
            this.renderGrid();

            // Update building summary
            this.buildings[buildingType]--;
            if (this.buildings[buildingType] === 0) {
                delete this.buildings[buildingType];
            }
            this.updateBuildingSummary();
        }
    }

    /**
     * Updates the resource display in the UI.
     */
    updateResourceDisplay() {
        const bleDisplay = document.getElementById('ble-resource');
        const painDisplay = document.getElementById('pain-resource');
        const hommesDisplay = document.getElementById('hommes-resource');
        const argentDisplay = document.getElementById('argent-resource');

        bleDisplay.textContent = this.resources['ble'];
        painDisplay.textContent = this.resources['pain'];
        hommesDisplay.textContent = this.resources['hommes'];
        argentDisplay.textContent = this.resources['argent'];
    }

    /**
     * Updates the real-time timer display in the UI.
     */
    updateRealTimerDisplay() {
        const realTimerDisplay = document.getElementById('real-timer');
        realTimerDisplay.textContent = this.realTimer;
    }

    /**
     * Updates the building summary in the UI.
     */
    updateBuildingSummary() {
        const summaryList = document.getElementById('summary-list');
        summaryList.innerHTML = '';

        for (const buildingType in this.buildings) {
            if (Object.hasOwnProperty.call(this.buildings, buildingType)) { // Safe check
                const building = this.availableBuildings[buildingType];
                const count = this.buildings[buildingType];
                let incomeString = '';

                if (building.resource) {
                    incomeString = `(+${building.productionRate * count} <img src="${config.resources[building.resource].image}" alt="${building.resource}" style="width: 20px; height: 20px; vertical-align: middle;">/5s)`;
                }

                const listItem = document.createElement('li');
                listItem.innerHTML = `${building.getName()}: ${count} ${incomeString}`;
                summaryList.appendChild(listItem);
            }
        }
    }

    /**
     * Renders the game grid.
     */
    renderGrid() {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, 60px)`;
        gridContainer.style.gridTemplateRows = `repeat(${this.gridSize}, 60px)`

        const fragment = document.createDocumentFragment(); // Use a document fragment for performance

        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.dataset.index = i;

            if (this.grid[i]) {
                const buildingType = this.grid[i];
                const building = this.availableBuildings[buildingType];
                const img = document.createElement('img');
                img.src = building.getImage();
                img.style.width = '100%';
                img.style.height = '100%';
                img.dataset.index = i;
                img.draggable = true;

                img.addEventListener('dragstart', (event) => {
                    this.draggedBuildingIndex = i;
                    this.highlightDragCells();
                });

                cell.appendChild(img);
            }

            cell.addEventListener('dragover', (event) => {
                event.preventDefault();
            });

            cell.addEventListener('dragleave', (event) => {
                event.preventDefault();
            });

            cell.addEventListener('dragend', (event) => {
                this.clearDragHighlighting();
            });

            cell.addEventListener('drop', (event) => {
                event.preventDefault();
                this.clearDragHighlighting();
                if (this.draggedBuildingIndex !== null && i !== this.draggedBuildingIndex && this.grid[i] === null) {
                    const temp = this.grid[i];
                    this.grid[i] = this.grid[this.draggedBuildingIndex];
                    this.grid[this.draggedBuildingIndex] = temp;
                    this.draggedBuildingIndex = null;
                    this.renderGrid();
                }
            });

            cell.addEventListener('click', this.handleCellClick.bind(this));
            fragment.appendChild(cell);
        }

        gridContainer.appendChild(fragment); // Append the fragment to the grid
    }

    /**
     * Highlights the cells available for dragging.
     */
    highlightDragCells() {
        const gridContainer = document.getElementById('grid-container');
        const cells = gridContainer.children;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (this.grid[i] === null) {
                cell.classList.add('available-cell');
            }
        }
    }

    /**
     * Clears the drag highlighting from cells.
     */
    clearDragHighlighting() {
        const gridContainer = document.getElementById('grid-container');
        const cells = gridContainer.children;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            cell.classList.remove('available-cell');
        }
    }
}

export default Game;