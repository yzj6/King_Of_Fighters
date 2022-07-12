export class Controller {//控制器 键盘输入
    constructor($canvas) {
        this.$canvas = $canvas;

        this.pressed_keys = new Set();//按住了哪个键
        this.start();
    }

    start() {
        let outer = this;//因为里外this不是一个this
        this.$canvas.keydown(function (e) {
            outer.pressed_keys.add(e.key);

        });

        this.$canvas.keyup(function (e) {
            outer.pressed_keys.delete(e.key);
        });
    }
}