/*import { PersonXP } from './classes.js';

export = {
    //returns true if leveled up
    async gainXP(person: PersonXP): Promise<boolean>{
        const xpGain = Math.ceil(Math.random() * 5) + 7
        person.xp += xpGain;
        person.date = Date.now();
        person.msg++;
        person.lvlxp += xpGain;

        if(person.lvlxp > 5 * (person.lvl ^ 2) + (50 * person.lvl) + 100){
            person.lvlxp = 0;
            person.lvl++;
            return true;
        }
        return false;
    }
}*/
