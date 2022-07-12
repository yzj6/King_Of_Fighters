import { GameObject } from '/static/js/game_object/base.js';
import { Controller } from '../controller/base.js';
export class GameMap extends GameObject {
    constructor(root) {//KOF类的root 在总体div上画图
        super();//父类构造函数

        this.root = root;
        this.$canvas = $('<canvas width="1280" height="720" tabindex=0></canvas>');//新建画布 可以获取用户输入 //取出来的是数组
        this.ctx = this.$canvas[0].getContext('2d');//使用画布 渲染上下文
        this.root.$kof.append(this.$canvas);//把画布添加到用户输入的地方
        this.$canvas.focus();//聚焦 默认接受键盘相关事件的元素

        this.controller = new Controller(this.$canvas);
    }

    start() {

    }

    update() {
        this.render();
    }

    render() {//渲染
        // this.ctx.fillStyle = "black";
        // this.ctx.fillRect(0, 0, this.$canvas.width(), this.$canvas.height());

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);//每一帧清空一次

    }
}