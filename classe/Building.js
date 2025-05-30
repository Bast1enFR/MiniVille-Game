// classe/Building.js

/**
 * Represents a building in the game.
 */
class Building {
    /**
     * Constructor for the Building class.
     * @param {string} type - The type of the building (e.g., 'ble', 'boulangerie').
     * @param {object} data - The building data (name, cost, image, resource, productionRate).
     */
    constructor(type, data) {
        this.type = type;
        this.name = data.name;
        this.cost = data.cost;
        this.income = data.income;
        this.image = data.image;
        this.resource = data.resource; // Resource produced by the building
        this.productionRate = data.productionRate; // Rate at which the resource is produced
    }

    /**
     * Returns the cost of the building.
     * @returns {object} The cost of the building.
     */
    getCost() {
        return this.cost;
    }

    /**
     * Returns the income of the building.
     * @returns {number} The income of the building.
     */
    getIncome() {
        return this.income;
    }

    /**
     * Returns the type of the building.
     * @returns {string} The type of the building.
     */
    getType() {
        return this.type;
    }

    /**
     * Returns the name of the building.
     * @returns {string} The name of the building.
     */
    getName() {
        return this.name;
    }

    /**
     * Returns the image URL of the building.
     * @returns {string} The image URL of the building.
     */
    getImage() {
        return this.image;
    }

    /**
     * Returns the resource produced by the building.
     * @returns {string} The resource produced by the building.
     */
    getResource() {
        return this.resource;
    }

    /**
     * Returns the production rate of the resource.
     * @returns {number} The production rate of the resource.
     */
    getProductionRate() {
        return this.productionRate;
    }
}

export default Building;