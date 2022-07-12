import { Player } from "./base.js";
import { GIF } from "../utils/gif.js";//第三方 抽取gif的每一帧

export class Kyo extends Player {
    constructor(root, info) {
        super(root, info);
        this.init_animations();
    }

    init_animations() {
        let outer = this;
        let offsets = [0, -22, -22, -140, 0, 0, 0];//y方向偏移量 因为每张gif人物高度不一定一样
        for (let i = 0; i < 7; i++) {//每一张gif
            let gif = GIF();
            gif.load(`/static/images/player/kyo/${i}.gif`);//用`不是'
            this.animations.set(i, {//对应gif
                gif: gif,
                frame_cnt: 0,//总帧数 总图片数
                frame_rate: 5,//每秒刷帧的速率 每5帧渲染下一张
                offset_y: offsets[i],//y方向偏移量
                loaded: false,//是否已被加载完整
                scale: 2,//图片缩放
            });

            gif.onload = function () {//加载gif
                let obj = outer.animations.get(i);
                obj.frame_cnt = gif.frames.length;
                obj.loaded = true;

                if (i === 3) {
                    obj.frame_rate = 4;//跳跃更连贯
                }
            }

        }
    }
}