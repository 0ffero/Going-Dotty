let FireworksDisplay = class {
    constructor() {
        console.log(`Generating fireworks Display`);
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

        this.initFlower();

        this.init();

    }

    init() {
        this.container = scene.add.container().setName('fireworks').setDepth(consts.depths.fireworks).setVisible(false);
        
        this.initEmitters();
    }

    initEmitters() {
        let particle = scene.add.particles('flares');
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
            this.container.add(particle);
            let emitter = particle.createEmitter(options);
            this.emitters.push(emitter);
        });


        let flower = this.flower;
        let flowerEmitter = particle.createEmitter({
            frame: { frames: [ 'green', 'blue','yellow','red','white' ], cycle: true },
            x: 0, y: 0,
            gravityY: -60,
            scale: { start: 0.33, end: 0 },
            blendMode: 'ADD',
            active: false,
            emitZone: { type: 'edge', source: flower, quantity: 120 }
        });
        
        this.specialEmitters = { circleBurst: null, flower: flowerEmitter };

    }

    initFlower() {
        let  k = 4;
        this.flower = {
            getPoints: function (quantity, stepRate) {
                if (!stepRate) { stepRate = Phaser.Math.PI2 / quantity; };
                var input = Phaser.Utils.Array.NumberArrayStep(0, Phaser.Math.PI2, stepRate);
                var output = new Array(input.length);
                for (let i = 0; i < input.length; i++) { var angle = input[i]; output[i] = new Phaser.Math.Vector2().setToPolar(angle, 200 * Math.cos(k * angle)); };
                return output;
            }
        };
    }

    destroyFirework(_f) {
        let fname = _f.name;
        let index = this.fireworks.findIndex(f=>f.name===fname);
        if (index===-1) return 'Couldnt find the firework in the array!';

        let isChild = _f.isChild;
        this.fireworks.splice(index,1);
        _f.destroy();

        (this.container.visible && !isChild) && this.newFirework();
    }

    fireEmitter(_em=null,_position={x: 0, y: 0}) {
        vars.DEBUG && console.log(`Firing Emitter`);
        _em===null && (_em=getRandom(0,this.particleSets.length-1));
        this.emitters[_em].setPosition(_position.x, _position.y);
        !this.emitters[_em].active && (this.emitters[_em].active=true); this.emitters[_em].explode();
        vars.audio.fireworkExplode();
    }

    fireFlowerEmitter(_position={x: 0, y: 0}) {
        vars.DEBUG && console.log(`Firing Emitter`);
        let eM = this.specialEmitters.flower.setPosition(_position.x, _position.y);
        !eM.active && (eM.active=true);
        eM.explode(120);
        vars.audio.fireworkExplode();
    }

    generateFirework(_child=false,_childData=null) {
        if (_child && !_childData) return `Child fireworks need data (x,y pos), xPush (-1->1 w 0.5inc)`

        let cC = consts.canvas;

        // GENERATE THE FIREWORK
        let x = !_child ? getRandom(2,cC.width*2/10-2)*5 : _childData.x;
        let y = !_child ? cC.height+20 : _childData.y;

        let special = _child && _childData.special ? true : false; // currently unused, but will eventually generate "special" fireworks
        if (special) {
            this.specialFirework({x:x,y:y});
            return;
        };

        let arr = [ ...this.particleSets ];
        let valids = arr.splice(0,5);
        let colour = getRandom(valids);
        let name = `fw_${generateRandomID()}`;
        let firework = scene.add.image(x,y,'flares', colour).setScale(0.1).setName(name).setAlpha(0.7);
        firework.colour = colour;

        let initialSpeed = !_child ? getRandom(26,32)/2 : _childData.initialSpeed; // initial speed (for not child) will be 13->16 in 0.5 inc's. child fws have a speed of 2->3 (inc 0.5)
        firework.speed = initialSpeed;
        firework.gravity = this.gravity;


        let explodeAt = !_child ? getRandom(0,3)*-1 : _childData.explodeAt;
        firework.explodeAt = explodeAt;

        let limiter = 300000;
        let divisor = 1000;
        let horizontalPush;
        if (!_child) {
            horizontalPush = x<cC.cX ? (Math.random()/50*limiter|0)/divisor : (Math.random()/-50*limiter|0)/divisor;
        } else {
            let maxXPush = 5;
            horizontalPush = _childData.xPush*maxXPush;
        };
        firework.xPush = horizontalPush;

        firework.dead = false;
        firework.tracerTimeout=1;
        firework.tracerTimeoutMax=1;

        // does this firework birth other fireworks?
        firework.isChild=_child;
        if (!_child) { // children CANT birth other fireworks (coz that would be weird)
            let birthsOtherFireworks = firework.isMother = getRandom([true,false]);
            if (birthsOtherFireworks) {
                // how many does it generate on the way up?
                let options = [1,1,1,1,2];
                let mO = firework.motherOf = getRandom(options);
                // when do we give birth to the other fireworks?
                firework.birthSpeed = mO===1 ? [initialSpeed*(getRandom(25,40)/100)] : [initialSpeed*(getRandom(40,50)/100),initialSpeed*(getRandom(25,35)/100)];
                // and how many fireworks are generated at each point
                options = [1,2,2,2,2,2,2,4,4];
                firework.birthsPerSlot = [];
                firework.birthSpeed.forEach((_t)=> {
                    firework.birthsPerSlot.push(getRandom(options));
                });
                firework.used = new Array(firework.motherOf).fill(false);
            };
        };

        firework.doTracer = ()=> {
            firework.tracerTimeout--;

            if (!firework.tracerTimeout) {
                firework.tracerTimeout=firework.tracerTimeoutMax;
                let colour = firework.isChild ? firework.colour : 'white';
                let tracer = scene.add.image(firework.x,firework.y,'flares',colour).setScale(0.1);
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

    newFirework(_count=1, _child=false, _childData=null) {
        !this.container.visible && this.container.setVisible(true);
        
        for (let f=1; f<=_count; f++) {
            scene.tweens.addCounter({
                from: 0, to: 1, duration: 1000*(f-1),
                onComplete: ()=> { vars.game.winScreen.fireworks.generateFirework(_child,_childData); }
            });
        };
    }

    show(_show=true) {
        this.container.visible=_show;

        _show && this.newFirework(vars.game.fireworkCount);
    }

    specialFirework(_vars=null) {
        if (!_vars || !_vars.x || !_vars.y) return `Special fireworks need an x and y position!`;

        if (getRandom(0,1)) {
            this.fireFlowerEmitter({x:_vars.x,y:_vars.y});
            return;
        };

        let blooms = getRandom([0,0,0,0,0,0,1,1,2]);
        
        let delay = 500;
        for (let b=0; b<=blooms; b++) {
            let mult = b%2 ? -1 : 1;
            scene.tweens.addCounter({
                from:0,to:1,duration: b*delay,
                onComplete: ()=> {
                    let frame = getRandom(['red','white','green','yellow','blue'])
                    let stars = scene.add.group({ key: 'flares', frame: frame, repeat: 15 });
                    let circle = new Phaser.Geom.Circle(_vars.x, _vars.y, 32);
                    Phaser.Actions.PlaceOnCircle(stars.getChildren(), circle);

                    scene.tweens.addCounter({
                        from:0,to:1, useFrames: true, duration: 2, onComplete: ()=> {
                            scene.tweens.add({ targets: stars.getChildren(), alpha: 0, duration: 1250 })
                            scene.tweens.add({
                                targets: circle, radius: 200,
                                ease: 'Quintic.easeInOut',
                                duration: 1500,
                                onUpdate: function() {
                                    Phaser.Actions.RotateAroundDistance(stars.getChildren(), { x: _vars.x, y: _vars.y }, 0.02*mult, circle.radius);
                                },
                                onComplete: ()=> { stars.destroy(true,true);}
                            });
                        }
                    });
                }
            });
        };
    }

    update() {
        let dead = [];
        this.fireworks.forEach((_f)=> {
            _f.doTracer();
            _f.speed-=_f.gravity;
            _f.x+=_f.xPush;
            _f.y-=_f.speed;
            if (_f.isMother) {
                _f.used.forEach((_used,_i)=> {
                    if (_used) { return; }
                    if (_f.speed<_f.birthSpeed[_i]) {
                        let xPushes = [-1,-0.5,0.5,1];
                        let kids = _f.birthsPerSlot[_i];
                        let special = kids===1 ? true : false;
                        vars.DEBUG && console.log(` >> Birthing ${kids} ${kids===1 ? '(special)' : ''} child firework${kids>1 ? 's': ''} at slot ${_i+1}/${_f.used.length} for ${_f.name}\n    >> Special: ${special}`);
                        let xPush = kids===4 ? [...xPushes] : [...xPushes].splice(1,kids);
                        let initialSpeed = getRandom(8,14)/2
                        let explodeAt = getRandom(3,6)*-1;
                        for (let f=0; f<kids; f++) {
                            let xy = { x: _f.x, y: _f.y, xPush: xPush[f], initialSpeed: initialSpeed, explodeAt: explodeAt, special: special };
                            this.newFirework(1,true,xy);
                        };
                        _f.used[_i] = true;
                    };
                });
            };
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