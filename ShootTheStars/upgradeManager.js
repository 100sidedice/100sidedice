import { save } from "../Support/save.js"
import { loadSave } from "../Support/save.js"
import { Star } from "./star.js";

export default class UpgradeManager {
    constructor(save) {
        this.data = save.upgrades;
        this.upgrades = save.upgrades
        this.save = save
    }
    update(){

    }
    getData(...path) {
        let current = this.data
        for (const key of path) {
            if (current[key] === undefined) {
                return null
            }
            current = current[key]
        }
        return current
    }
}