let FireworksDisplay = class {
    constructor() {

        this.emitters = [];
        this.particleSets = [
            ['red'], ['green'], ['blue'], ['yellow'],
            ['white'],
            ['blue','white'],
            ['red','white'],
            ['green','white'],
            ['yellow','white']
        ];
        this.maxParticles = 96;

        this.fireworks = [];

        this.gravity=0.1;

        this.init();

    }

    init() {
        this.container = scene.add.container().setName('fireworks').setDepth(consts.depths.fireworks).setVisible(false);
        
        this.initEmitters();
    }

    initEmitters() {
        this.particleSets.forEach((_frames)=> {
            let options = {
                frame: _frames,
                x: 0, y: 0,
                quantity: this.maxParticles/_frames.length|0,
                alpha: { start: 1, end: 0 },
                speed: { min: 50, max: 150 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.3, end: 0.2 },
                lifespan: { min: 1500, max: 2500 },
                blendMode: 'SCREEN',
                gravityY: 100,
                active: false
            };
            let particle = scene.add.particles('flares');
            this.container.add(particle);
            let emitter = particle.createEmitter(options);
            this.emitters.push(emitter);
        });
    }

    destroyFirework(_f) {
        let fname = _f.name;
        let index = this.fireworks.findIndex(f=>f.name===fname);
        if (index===-1) return 'Couldnt find the firework in the array!';

        this.fireworks.splice(index,1);
        _f.destroy();

        this.container.visible && this.newFirework();
    }

    fireEmitter(_em=null,_position={x: 0, y: 0}) {
        _em===null && (_em=getRandom(0,this.particleSets.length-1));
        this.emitters[_em].setPosition(_position.x, _position.y);
        !this.emitters[_em].active && (this.emitters[_em].active=true); this.emitters[_em].explode();
        vars.audio.fireworkExplode();
    }

    newFirework(_count=1) {
        let cC = consts.canvas;
        
        for (let f=1; f<=_count; f++) {
            scene.tweens.addCounter({
                from: 0, to: 1, duration: 1000*(f-1),
                onComplete: ()=> {
                    let initialSpeed = getRandom(20,32)/2; // initial speed will be 10->16 in 0.5 inc's
                    let x = getRandom(2,cC.width*2/10-2)*5;
                    let limiter = 300000;
                    let divisor = 1000;
                    let horizontalPush = x<cC.cX ? (Math.random()/50*limiter|0)/divisor : (Math.random()/-50*limiter|0)/divisor;
                    let explodeAt = getRandom(0,3)*-1;
                    let y = cC.height+20;
                    let arr = [ ...this.particleSets ];
                    let valids = arr.splice(0,5);
                    let colour = getRandom(valids);
                    let name = `fw_${generateRandomID()}`;
                    let firework = scene.add.image(x,y,'flares', colour).setScale(0.1).setName(name).setAlpha(0.7);
                    firework.speed = initialSpeed;
                    firework.gravity = this.gravity;
                    firework.xPush = horizontalPush;
                    firework.dead = false;
                    firework.explodeAt = explodeAt;
                    firework.tracerTimeout=3;
                    firework.tracerTimeoutMax=3;
                    firework.doTracer = ()=> {
                        firework.tracerTimeout--;

                        if (!firework.tracerTimeout) {
                            firework.tracerTimeout=firework.tracerTimeoutMax;
                            let tracer = scene.add.image(firework.x,firework.y,'flares','white').setScale(0.1);
                            tracer.tween = scene.tweens.add({
                                targets: tracer,
                                duration: 1000, alpha: 0,
                                onComplete: (_t,_o)=> { _o[0].destroy(); }
                            });
                        };
                    };

                    vars.audio.fireworkTakeOff();
                    
                    this.container.add(firework);
                    this.fireworks.push(firework);
                }
            });
        };
    }

    show(_show=true) {
        this.container.visible=_show;

        _show && this.newFirework(2);
    }

    update() {
        let dead = [];
        this.fireworks.forEach((_f)=> {
            _f.doTracer();
            _f.speed-=_f.gravity;
            _f.x+=_f.xPush;
            _f.y-=_f.speed;
            if (_f.speed<=_f.explodeAt) {
                this.fireEmitter(null, { x: _f.x, y: _f.y });
                dead.push(_f);
            };
        });

        dead.forEach((_d)=> {
            this.destroyFirework(_d);
        });
    }
}