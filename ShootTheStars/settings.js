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
                        }
                    ]
                }
            }
        }
    }
}