/*import { LevelRole } from "./models/LevelRole.js";
import { GuildMember } from "discord.js";
import fs from 'fs';

export default {
    async nextRole(user: GuildMember){
        const roleList = new Array<LevelRole>(0);
        const previousRoleList = new Array<string>(0);
        try{
            const userList = JSON.parse(fs.readFileSync("./server_roles/" + user.guild.id + ".json").toString());
            for(const item of userList){
                if(user.roles.cache.has(item.id.toString()) && item.level !== 0){
                    await user.roles.remove(item.id.toString());
                    previousRoleList.push(item.id.toString());
                }
                    
                roleList.push(new LevelRole(item.id, item.level));
            }
        }catch(err){
            console.log(err);
            console.log("Maybe the server has no role for this?");
            return;
        }
        let tempLevelRole = new LevelRole("0", -1);
        let personLvl = 0;
        try{
            const userList = JSON.parse(fs.readFileSync("./leaderboards/" + user.guild.id + ".json").toString());
            for(const item of userList){
                if(user.id === item.id){
                    personLvl = item.lvl;
                }
                break;
            }
            console.log(roleList);
            for(const item of roleList){
                if(item.level <= personLvl && item.level > tempLevelRole.level){
                    tempLevelRole = new LevelRole(item.id, item.level);
                    console.log("new item id: " + item.id);
                }
            }
        }catch(err){
            console.log(err);
        }
        console.log(tempLevelRole.id);
        if(tempLevelRole.level !== -1){
            await user.roles.add((tempLevelRole.id).toString()).catch((err:Error) => console.log("error on last role step: \n" + err));
        }else{
            console.log("ERROR: couldn't find available role");
            for(const item of previousRoleList){
                await user.roles.add((item).toString()).catch((err:Error) => console.log("error on adding roles back last step: \n" + err));
            }
        }
    }
}*/
