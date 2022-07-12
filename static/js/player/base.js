import { GameObject } from "/static/js/game_object/base.js";

export class Player extends GameObject {
    constructor(root, info) {//root方便索引地图上每个元素
        super();

        this.root = root;
        this.id = info.id;
        this.x = info.x;//位置
        this.y = info.y;//位置
        this.width = info.width;
        this.height = info.height;
        this.color = info.color;

        this.direction = 1;//方向 1右 -1左

        this.vx = 0;//横向速度
        this.vy = 0;//纵向速度

        this.speedx = 400;//人物水平速度
        this.speedy = -1200;//人物跳跃速度

        this.gravity = 50;//重力

        this.ctx = this.root.game_map.ctx;//同理2d渲染
        this.pressed_keys = this.root.game_map.controller.pressed_keys;

        this.status = 3;// 状态机: 0:idle 不动, 1:(1:向前, 2:向后), 3:跳跃, 4:攻击, 5:被打, 6:死亡
        this.animations = new Map();//角色的动画
        this.frame_current_cnt = 0;//当前记录了多少帧 控制渲染速度

        this.hp = 100;//血量
        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`);//找到对应血条
        this.$hp2 = this.$hp.find('div');//以及外层血条
    }

    start() {

    }

    update_move() {//人物移动
        this.vy += this.gravity;

        //坐标变化
        this.x += this.vx * this.timedelta / 1000;//父类里的timedelta
        this.y += this.vy * this.timedelta / 1000;

        // //两个角色不重叠 //有bug
        // let [a, b] = this.root.players;
        // if (a !== this) [a, b] = [b, a];

        // let r1 = {
        //     x1: a.x,
        //     y1: a.y,
        //     x2: a.x + a.width,
        //     y2: a.y + a.height
        // }
        // let r2 = {
        //     x1: b.x,
        //     y1: b.y,
        //     x2: b.x + b.width,
        //     y2: b.y + b.height
        // }
        // if (this.is_collision(r1, r2)) {
        //     b.x += this.vx * this.timedelta / 1000;
        //     b.y += this.vy * this.timedelta / 1000;

        //     if (this.status === 3) this.status = 0;
        // }


        if (this.y > 450) {//落地
            this.y = 450;
            this.vy = 0;

            if (this.status === 3) {//空中落地才恢复静止
                this.status = 0;
            }

        }

        if (this.x < 0) {//移动区域边界限制
            this.x = 0;
        } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        }
    }

    update_control() {
        let w, a, d, space;//上 左 右 攻击
        if (this.id === 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        } else {
            w = this.pressed_keys.has('ArrowUp');
            a = this.pressed_keys.has('ArrowLeft');
            d = this.pressed_keys.has('ArrowRight');
            space = this.pressed_keys.has('Enter');
        }

        if (this.status === 0 || this.status === 1) {//静止或移动
            if (space) {//攻击
                this.status = 4;
                this.vx = 0;
                this.frame_current_cnt = 0;//从第0帧开始渲染
            }
            else if (w) {//跳跃
                if (d) {//右跳
                    this.vx = this.speedx;
                } else if (a) {//左跳
                    this.vx = -this.speedx;
                } else {//原地跳
                    this.vx = 0;
                }
                this.vy = this.speedy;
                this.status = 3;
                this.frame_current_cnt = 0;

            } else if (d) {//右移
                this.vx = this.speedx;
                this.status = 1;
            } else if (a) {//左移
                this.vx = -this.speedx;
                this.status = 1;//这里统一为1 渲染时再分
            } else {//静止
                this.vx = 0;
                this.status = 0;
            }
        }
    }

    update_direction() {//使玩家面对面
        if (this.status === 6) return;//死亡就不用换方向了

        let players = this.root.players;
        if (players[0] && players[1]) {
            let me = this, you = players[1 - this.id];
            if (me.x < you.x) me.direction = 1;
            else me.direction = -1;
        }
    }

    is_attack() {//被攻击到
        if (this.status === 6) return;//死亡不会被攻击

        this.status = 5;
        this.frame_current_cnt = 0;

        this.hp = Math.max(this.hp - 20, 0);//血量减少

        // this.$hp.width(this.$hp.parent().width() * this.hp / 100);//血条变化
        this.$hp2.animate({//先绿的变化
            width: this.$hp.parent().width() * this.hp / 100
        }, 300);//逐渐血条减少
        this.$hp.animate({//再红的变化
            width: this.$hp.parent().width() * this.hp / 100
        }, 600);//逐渐血条减少

        if (this.hp <= 0) {
            this.status = 6;//死亡倒地状态
            this.frame_current_cnt = 0;
        }
    }

    is_collision(r1, r2) {//判断两个矩形有没有交集 即是否有物理碰撞
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2)) {
            return false;
        }
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2)) {
            return false;
        }
        return true;
    }

    update_attack() {//攻击碰撞
        if (this.status === 4 && this.frame_current_cnt === 18) {//攻击状态及对应帧数
            let me = this, you = this.root.players[1 - this.id];
            let r1;//不同面向的方向 自己选用不同的拳头
            if (this.direction > 0) {//正方向 朝右
                r1 = {
                    x1: me.x + 125,
                    y1: me.y + 42,
                    x2: me.x + 125 + 100,
                    y2: me.y + 42 + 20,
                };
            } else {//朝左
                r1 = {
                    x1: me.x + me.width - 125 - 100,
                    y1: me.y + 42,
                    x2: me.x + me.width - 125 - 100 + 100,
                    y2: me.y + 42 + 20,
                };
            }

            let r2 = {//对方的身体
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height,
            };

            if (this.is_collision(r1, r2)) {//碰到
                you.is_attack();//被攻击到
            }

        }
    }

    update() {
        this.update_control();
        this.update_move();
        this.update_direction();
        this.update_attack();

        this.render();
    }

    render() {//渲染人物

        // //碰撞盒子
        // this.ctx.fillStyle = this.color;
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);
        // //攻击碰撞
        // //拳头 //攻击范围
        // if (this.direction > 0) {//正方向
        //     this.ctx.fillStyle = 'green';
        //     this.ctx.fillRect(this.x + 125, this.y + 42, 100, 20);
        // } else {
        //     this.ctx.fillStyle = 'green';
        //     this.ctx.fillRect(this.x + this.width - 125 - 100, this.y + 42, 100, 20);
        // }

        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + 40, this.y + this.height + 40);
        this.ctx.lineTo(this.x + this.width - 40, this.y + this.height + 40);
        this.ctx.lineTo(this.x + this.width / 2, this.y + this.height + 20);
        this.ctx.fill();

        //对应状态渲染对应动作
        let status = this.status;//状态

        if (this.status === 1 && this.direction * this.vx < 0) status = 2;//后退移动

        let obj = this.animations.get(status);//对应动作

        if (obj && obj.loaded) {//如果已经被加载出来
            if (this.direction > 0) {//正方向
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;//循环渲染
                let image = obj.gif.frames[k].image;//对应那一帧的图片
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
            } else {
                this.ctx.save();
                this.ctx.scale(-1, 1);//翻转画布
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0);//移动画布

                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;//循环渲染
                let image = obj.gif.frames[k].image;//对应那一帧的图片
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.width - this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);

                this.ctx.restore();
            }
        }

        if (status === 4 || status === 5 || status === 6) {
            if (this.frame_current_cnt === obj.frame_rate * (obj.frame_cnt - 1)) {//不循环 渲染完一遍后停止
                if (status === 6) {//死亡特判
                    this.frame_current_cnt--;
                    this.vx = 0;
                } else {
                    this.status = 0;
                }
            }
        }


        this.frame_current_cnt++;//换帧
    }
}