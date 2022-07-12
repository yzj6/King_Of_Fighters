import { GameMap } from '/static/js/game_map/base.js';
import { Kyo } from '/static/js/player/kyo.js';

class KOF {
    constructor(id) {
        this.$kof = $('#' + id);//获取该id的用户输入信息

        this.game_map = new GameMap(this);//人物活动区
        this.players = [//两名角色
            //一名角色 //new Player
            new Kyo(this, {
                id: 0,
                x: 200,
                y: 0,
                width: 120,
                height: 200,
                color: 'blue',
            }),
            //另一名角色 //new Player
            new Kyo(this, {
                id: 1,
                x: 950,
                y: 0,
                width: 120,
                height: 200,
                color: 'red',
            }),
        ];
    }
}

export {
    KOF
}