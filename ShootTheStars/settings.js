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
                            "maxLevel": 100,
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
                            "name": "Dragon Collection Range",
                            "baseCost": {"currency": "starFragments", "amount": 1500000},
                            "upgradeType": "additive",
                            "scaleType": "additive",
                            "scaleAmount": 2,
                            "maxLevel": 20,
                            "fog": {"currency": "starFragments", "amount": 1300000},
                            "visible": {"currency": "starFragments", "amount": 1400000}
                        },
                    ]
                }
            }
        }
    }
}