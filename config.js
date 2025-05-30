// config.js

/**
 * Configuration du jeu.
 */
const config = {
    startingMoney: 10,
    gridSize: 14,
    buildingData: {
        ble: {
            name: 'Champs de blé',
            cost: {
                argent: 10
            },
            image: 'assets/champsblé.jpg',
            resource: 'ble',
            productionRate: 5
        },
        boulangerie: {
            name: 'Boulangerie',
            cost: {
                ble: 100
            },
            image: 'assets/boulangerie.jpg',
            resource: 'pain',
            productionRate: 5
        },
        maison: {
            name: 'Maison',
            cost: {
                pain: 50
            },
            image: 'assets/maison.jpg',
            resource: 'hommes',
            productionRate: 5
        },
        bureau: {
            name: 'Bureau',
            cost: {
                hommes: 20
            },
            image: 'assets/bureau.png',
            resource: 'argent',
            productionRate: 5
        }
    },
    productionChains: [
        {
            from: 'ble',
            to: 'boulangerie'
        },
        {
            from: 'boulangerie',
            to: 'maison'
        },
        {
            from: 'maison',
            to: 'bureau'
        },
        {
            from: 'bureau',
            to: 'maison'
        }
    ],
    resources: {
        ble: {
            name: 'Blé',
            image: 'assets/blé.png'
        },
        pain: {
            name: 'Pain',
            image: 'assets/pain.png'
        },
        hommes: {
            name: 'Hommes',
            image: 'assets/humain.png'
        },
        argent: {
            name: 'Argent',
            image: 'assets/argent.png'
        }
    }
};

export default config;