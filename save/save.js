// save/save.js

/**
 * Saves the game state to localStorage.
 * @param {Game} game - The game instance to save.
 */
export function saveGame(game) {
    try {
        const gameState = {
            resources: game.resources,
            grid: game.grid,
            buildings: game.buildings,
            realTimer: game.realTimer
        };
        localStorage.setItem('gameState', JSON.stringify(gameState));
    } catch (e) {
        console.error("Erreur lors de la sauvegarde du jeu:", e);
        alert("Erreur lors de la sauvegarde du jeu. Veuillez vérifier si le stockage local est activé.");
    }
}

/**
 * Loads the game state from localStorage.
 * @returns {object | null} - The loaded game state, or null if no save exists.
 */
export function loadGame() {
    try {
        const gameStateString = localStorage.getItem('gameState');
        return gameStateString ? JSON.parse(gameStateString) : null;
    } catch (e) {
        console.error("Erreur lors du chargement du jeu:", e);
        alert("Erreur lors du chargement du jeu. La sauvegarde pourrait être corrompue.");
        return null;
    }
}

/**
 * Clears the saved game state from localStorage.
 */
export function clearSave() {
    localStorage.removeItem('gameState');
}