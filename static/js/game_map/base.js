import { GameObject } from '/static/js/game_object/base.js';
import { Controller } from '../controller/base.js';
export class GameMap extends GameObject {
    constructor(root) {//KOF类的root 在总体div上画图
        super();//父类构造函数

        this.root = root;
        this.$canvas = $('<canvas width="1280" height="700" tabindex=0></canvas>');//新建画布 可以获取用户输入 //取出来的是数组
        this.ctx = this.$canvas[0].getContext('2d');//使用画布 渲染上下文
        this.root.$kof.append(this.$canvas);//把画布添加到用户输入的地方
        this.$canvas.focus();//聚焦 默认接受键盘相关事件的元素

        this.controller = new Controller(this.$canvas);

        this.root.$kof.append($(`
        <div class="kof-head">
        
            <!-- 血条 -->
            <div class="kof-head-hp-0">
                <div>
                    <div></div>
                </div>
            </div>
            
            <!-- 计时器 -->
            <div class="kof-head-timer">60</div>
            
            <div class="kof-head-hp-1">
                <div>
                    <div></div>
                </div>
            </div>
        
        </div>
        `));//等价html

        this.time_left = 60000;//毫秒
        this.$timer = this.root.$kof.find(".kof-head-timer");//获取计时器数字
    }

    start() {

    }

    update() {
        this.time_left -= this.timedelta;
        if (this.time_left < 0) {
            this.time_left = 0;

            let [a, b] = this.root.players;
            if (a.status !== 6 && b.status !== 6) {
                if (a.hp > b.hp) b.status = 6;
                else if (a.hp < b.hp) a.status = 6;
                else a.status = b.status = 6;
                a.frame_current_cnt = b.frame_current_cnt = 0;
            }

        }

        this.$timer.text(parseInt(this.time_left / 1000));//改变计时器数字

        this.render();
    }

    render() {//渲染
        // this.ctx.fillStyle = "black";
        // this.ctx.fillRect(0, 0, this.$canvas.width(), this.$canvas.height());

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);//每一帧清空一次

    }
}