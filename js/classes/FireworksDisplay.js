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
    }

    newFirework() {
        let cC = consts.canvas;
        let initialSpeed = getRandom(20,32)/2;

        let x = getRandom(2,cC.width*2/10-2)*5;
        let y = cC.height+20;
        let arr = [ ...this.particleSets ];
        let valids = arr.splice(0,5);
        let colour = getRandom(valids);
        let name = `fw_${generateRandomID()}`;
        let firework = scene.add.image(x,y,'flares', colour).setScale(0.1).setName(name);
        firework.speed = initialSpeed;
        firework.gravity = this.gravity;
        firework.dead = false;
        
        this.container.add(firework);
        this.fireworks.push(firework);
    }

    show(_show=true) {
        this.container.visible=_show;

        _show && this.newFirework();
    }

    update() {
        let dead = [];
        this.fireworks.forEach((_f)=> {
            _f.speed-=_f.gravity;
            _f.y-=_f.speed;
            if (_f.speed<=0) {
                this.fireEmitter(null, { x: _f.x, y: _f.y });
                dead.push(_f);
            };
        });

        dead.forEach((_d)=> {
            this.destroyFirework(_d);
        });
    }
}