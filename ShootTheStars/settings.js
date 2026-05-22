export const settings = {
    "refreshRate": 1000 / 60, // 60 fps
    "defaultSave":{
        "upgrades" : {
            "stars": {
                "minSize": 1,
                "maxSize": 3,
                "color": ['white'],
                "minSpeed": 0.05,
                "maxSpeed": 0.08
            },
            "upgrades": {
                "maxStars": 100
            },
            "unlockedItems":["starFragments"],
            "itemData": {
                "starFragments":{
                    "value": 0,
                    "key": "starFragments",
                    "displayName": "Star Fragments",
                    "description": "Fragments of stars",
                    "shopData":[
                        {
                            "id":"fragments+",
                            "level":0,
                            "name": "More fragments",
                            "baseCost": {"currency": "starFragments", "amount": 10},
                            "upgradeType": "additive",
                            "scaleType": "additive",
                            "scaleAmount": 10,
                            "maxLevel": 250,
                            "fog": {"currency": "starFragments", "amount": 5},
                            "visible": {"currency": "starFragments", "amount": 15}
                        },
                        {
                            "id":"fragmentsx2",
                            "level":0,
                            "name": "2x fragments",
                            "baseCost": {"currency": "starFragments", "amount": 30},
                            "upgradeType": "multiplicative",
                            "scaleType": "multiplicative",
                            "scaleAmount": 3,
                            "maxLevel": 10,
                            "fog": {"currency": "starFragments", "amount": 50},
                            "visible": {"currency": "starFragments", "amount": 100}
                        },
                        {
                            "id":"unlockDragons",
                            "level":0,
                            "name": "Unlock dragons",
                            "baseCost": {"currency": "starFragments", "amount": 1000},
                            "upgradeType": "additive",
                            "scaleType": "additive",
                            "scaleAmount": 1,
                            "maxLevel": 1,
                            "fog": {"currency": "starFragments", "amount": 500000},
                            "visible": {"currency": "starFragments", "amount": 1000000}
                        },
                        {
                            "id":"unlockPaint",
                            "level":0,
                            "name": "Unlock paint",
                            "baseCost": {"currency": "starFragments", "amount": 10000000},
                            "upgradeType": "additive",
                            "scaleType": "additive",
                            "scaleAmount": 1,
                            "maxLevel": 1,
                            "fog": {"currency": "starFragments", "amount": 9000000},
                            "visible": {"currency": "starFragments", "amount": 10000000}
                        },
                    ]
                },
                "dragons":{
                    "value": 0,
                    "key": "dragons",
                    "displayName": "Dragons",
                    "description": "Dragons that collect stars for you, that for some reason hate falling blocks",
                    "shopData":[
                        {
                            "id":"dragon+",
                            "level":0,
                            "name": "More dragons",
                            "baseCost": {"currency": "starFragments", "amount": 1200000},
                            "upgradeType": "additive",
                            "scaleType": "multiplicative",
                            "scaleAmount": 1.5,
                            "maxLevel": 10,
                            "fog": {"currency": "starFragments", "amount": 1000000},
                            "visible": {"currency": "starFragments", "amount": 1100000}
                        },
                        {
                            "id":"dragonAccuracy",
                            "level":0,
                            "name": "Dragon Accuracy",
                            "baseCost": {"currency": "starFragments", "amount": 2200000},
                            "upgradeType": "additive",
                            "scaleType": "multiplicative",
                            "scaleAmount": 1.2,
                            "maxLevel": 20,
                            "fog": {"currency": "starFragments", "amount": 2000000},
                            "visible": {"currency": "starFragments", "amount": 2100000}
                        },
                        {
                            "id":"dragonCollectionRadius",
                            "level":0,
                            "name": "Dragon Reach",
                            "baseCost": {"currency": "starFragments", "amount": 1500000},
                            "upgradeType": "additive",
                            "scaleType": "additive",
                            "scaleAmount": 2,
                            "maxLevel": 20,
                            "fog": {"currency": "starFragments", "amount": 1300000},
                            "visible": {"currency": "starFragments", "amount": 1400000}
                        },
                        {
                            "id":"sacrificeDragon",
                            "level":0,
                            "name": "Sacrifice Dragon",
                            "description": "Sacrifice one dragon to increase fragment gain.",
                            "baseCost": {"currency": "dragons", "amount": 1},
                            "upgradeType": "multipliciative",
                            "scaleType": "multiplicative",
                            "scaleAmount": 2,
                            "maxLevel": 50,
                            "fog": {"currency": "dragons", "amount": 2},
                            "visible": {"currency": "dragons", "amount": 2}
                        },
                    ]
                },
                "paint":{
                    "value": 0,
                    "key": "paint",
                    "displayName": "Paint",
                    "description": "Factory paint gathered from altered stars",
                    "shopData":[
                        {
                            "id":"paintConversion",
                            "level":0,
                            "name": "Paint conversion",
                            "baseCost": {"currency": "paint", "amount": 10},
                            "upgradeType": "utility",
                            "scaleType": "multiplicative",
                            "scaleAmount": 1.8,
                            "maxLevel": 9,
                            "fog": {"currency": "paint", "amount": 1},
                            "visible": {"currency": "paint", "amount": 5}
                        },
                        {
                            "id":"paintValue",
                            "level":0,
                            "name": "Paint value",
                            "baseCost": {"currency": "paint", "amount": 20},
                            "upgradeType": "additive",
                            "scaleType": "multiplicative",
                            "scaleAmount": 1.9,
                            "maxLevel": 40,
                            "fog": {"currency": "paint", "amount": 5},
                            "visible": {"currency": "paint", "amount": 10}
                        },
                        {
                            "id":"paintMaxStars",
                            "level":0,
                            "name": "Paint more stars",
                            "baseCost": {"currency": "paint", "amount": 30},
                            "upgradeType": "utility",
                            "scaleType": "multiplicative",
                            "scaleAmount": 1.85,
                            "maxLevel": 30,
                            "fog": {"currency": "paint", "amount": 12},
                            "visible": {"currency": "paint", "amount": 20}
                        },
                        {
                            "id":"paintFragmentGain",
                            "level":0,
                            "name": "Fancier explosions",
                            "baseCost": {"currency": "paint", "amount": 40},
                            "upgradeType": "utility",
                            "scaleType": "multiplicative",
                            "scaleAmount": 2,
                            "maxLevel": 25,
                            "fog": {"currency": "paint", "amount": 15},
                            "visible": {"currency": "paint", "amount": 25}
                        },
                        {
                            "id":"paintMoreDragons",
                            "level":0,
                            "name": "Paint dragons",
                            "baseCost": {"currency": "paint", "amount": 60},
                            "upgradeType": "utility",
                            "scaleType": "multiplicative",
                            "scaleAmount": 2.2,
                            "maxLevel": 10,
                            "fog": {"currency": "paint", "amount": 25},
                            "visible": {"currency": "paint", "amount": 40}
                        },
                        {
                            "id":"dragonPaintTargeting",
                            "level":0,
                            "name": "Dragon artists",
                            "baseCost": {"currency": "paint", "amount": 500},
                            "upgradeType": "utility",
                            "scaleType": "additive",
                            "scaleAmount": 500,
                            "maxLevel": 1,
                            "fog": {"currency": "paint", "amount": 250},
                            "visible": {"currency": "paint", "amount": 400}
                        }
                    ]
                }
            }
        }
    }
}