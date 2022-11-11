let DotString = class {
    constructor() {
        this.init();
    }

    init() {
        this.container = scene.add.container().setName('playerLetters').setDepth(consts.depths.fireworks).setVisible(false);
        
        this.initLetters();

        this.animationTypes = ['fade_top_bottom','fade_left_right_per_column','fade_diagonal','fade_diagonal_2','fade_by_letter'];
        this.dotTexture = 'dot'; // assumption! can be changed via this.setDotTexture
        
        this.directions = ['left','right','bottom','top'];
        this.moveFrom = null;
        this.moveDotsIntoPosition = false;
    }

    initLetters() {
        this.letters = {
            A: [
                ['01110'],
                ['10001'],
                ['11111'],
                ['10001'],
                ['10001']
            ],
            B: [
                ['11110'],
                ['10001'],
                ['11110'],
                ['10001'],
                ['11110']
            ],
            C: [
                ['01110'],
                ['10001'],
                ['10000'],
                ['10001'],
                ['01110']
            ],
            D: [
                ['11110'],
                ['10001'],
                ['10001'],
                ['10001'],
                ['11110']
            ],
            E: [
                ['11111'],
                ['10000'],
                ['11110'],
                ['10000'],
                ['11111']
            ],
            F: [
                ['11111'],
                ['10000'],
                ['11100'],
                ['10000'],
                ['10000']
            ],
            G: [
                ['01110'],
                ['10000'],
                ['10011'],
                ['10001'],
                ['01110']
            ],
            H: [
                ['10001'],
                ['10001'],
                ['11111'],
                ['10001'],
                ['10001']
            ],
            I: [
                ['11111'],
                ['00100'],
                ['00100'],
                ['00100'],
                ['11111']
            ],
            J: [
                ['01111'],
                ['00001'],
                ['10001'],
                ['10001'],
                ['01110']
            ],
            K: [
                ['10001'],
                ['10001'],
                ['11110'],
                ['10001'],
                ['10001']
            ],
            L: [
                ['10000'],
                ['10000'],
                ['10000'],
                ['10000'],
                ['11111']
            ],
            M: [
                ['11111'],
                ['10101'],
                ['10101'],
                ['10101'],
                ['10101']
            ],
            N: [
                ['10001'],
                ['11001'],
                ['10101'],
                ['10011'],
                ['10001']
            ],
            O: [
                ['01110'],
                ['10001'],
                ['10001'],
                ['10001'],
                ['01110']
            ],
            P: [
                ['11110'],
                ['10001'],
                ['11110'],
                ['10000'],
                ['10000']
            ],
            Q: [
                ['01110'],
                ['10001'],
                ['10001'],
                ['10010'],
                ['01101']
            ],
            R: [
                ['11110'],
                ['10001'],
                ['11110'],
                ['10001'],
                ['10001']
            ],
            S: [
                ['01111'],
                ['10000'],
                ['01110'],
                ['00001'],
                ['11110']
            ],
            T: [
                ['11111'],
                ['10101'],
                ['00100'],
                ['00100'],
                ['00100']
            ],
            U: [
                ['10001'],
                ['10001'],
                ['10001'],
                ['10001'],
                ['01110']
            ],
            V: [
                ['10001'],
                ['10001'],
                ['10001'],
                ['01010'],
                ['00100']
            ],
            W: [
                ['10001'],
                ['10001'],
                ['10101'],
                ['10101'],
                ['11111']
            ],
            X: [
                ['10001'],
                ['01010'],
                ['00100'],
                ['01010'],
                ['10001']
            ],
            Y: [
                ['10001'],
                ['10001'],
                ['01110'],
                ['00100'],
                ['00100']
            ],
            Z: [
                ['11111'],
                ['00010'],
                ['00100'],
                ['01000'],
                ['11111']
            ],
            0: [
                ['01111'],
                ['10011'],
                ['10101'],
                ['11001'],
                ['11110']
            ],
            1: [
                ['01100'],
                ['10100'],
                ['00100'],
                ['00100'],
                ['11111']
            ],
            2: [
                ['01110'],
                ['10001'],
                ['00110'],
                ['01000'],
                ['11111']
            ],
            3: [
                ['01110'],
                ['10001'],
                ['00110'],
                ['10001'],
                ['01110']
            ],
            4: [
                ['10010'],
                ['10010'],
                ['11111'],
                ['00010'],
                ['00010']
            ],
            5: [
                ['11111'],
                ['10000'],
                ['11110'],
                ['00001'],
                ['11110']
            ],
            6: [
                ['01110'],
                ['10000'],
                ['11111'],
                ['10001'],
                ['01110']
            ],
            7: [
                ['11111'],
                ['00001'],
                ['00010'],
                ['00100'],
                ['00100']
            ],
            8: [
                ['01110'],
                ['10001'],
                ['01110'],
                ['10001'],
                ['01110']
            ],
            9: [
                ['01111'],
                ['10001'],
                ['01111'],
                ['00001'],
                ['00001']
            ],
            '.': [
                ['00000'],
                ['00000'],
                ['00000'],
                ['00000'],
                ['00100']
            ],
            '-': [
                ['00000'],
                ['00000'],
                ['01110'],
                ['00000'],
                ['00000']
            ],
            '*': [
                ['10101'],
                ['01110'],
                ['11111'],
                ['01110'],
                ['10101']
            ],
            ' ': [
                ['00000'],
                ['00000'],
                ['00000'],
                ['00000'],
                ['00000']
            ]
        }
    }

    destroy() {
        this.container.destroy(true);
    }

    generateString(_string) {
        let cC = consts.canvas;
        let screenWidth = cC.width;
        let screenHeight = cC.height;
        this.animationType = getRandom(this.animationTypes);
        vars.DEBUG && console.log(`Selected animation type = ${this.animationType}`);
        let arr = _string.split('');
        let xyInc = 26;
        let xMax = xyInc/2+(((arr.length*6)-2)*xyInc);
        let yOff = (screenHeight-(xyInc/2+5*xyInc/2))/2;
        // reposition the container
        let xOff = (screenWidth-xMax)/2;
        this.container.setPosition(xOff,yOff);
        let container = this.container;
        let containerOffset = { x: container.x, y: container.y };
        let x = xyInc/2; let y=xyInc/2;
        let texture = this.dotTexture;
        arr.forEach((_l,_li)=>{
            let letter = this.letters[_l];
            letter.forEach((_row,_r)=> {
                let _col = _row[0].split('');
                _col.forEach((_val,_c)=> {
                    if (_val==='1') {
                        let x1 = x + xyInc*_c;
                        let y1 = y + xyInc*_r;
                        let dot = scene.add.image(x1,y1,texture).setScale(0.5).setAlpha(0);
                        container.add(dot);
                        let delay = 0;
                        let hold = 120;

                        switch (this.animationType) {
                            case 'fade_top_bottom': delay = _r*10; break;
                            case 'fade_left_right_per_column': delay = _c*10; break;
                            case 'fade_diagonal': delay = _r*10+_li*20; hold=180; break;
                            case 'fade_diagonal_2': delay = _c*20+_r*10+_li*10; hold=180; break;
                            case 'fade_by_letter': delay = _li*20; break;
                        };

                        let finalXY = { x: dot.x, y: dot.y };
                        if (this.moveDotsIntoPosition) {
                            let startXY = {};
                            switch (this.moveFrom) {
                                case 'left':    startXY = { x: 0-containerOffset.x, y: dot.y }; break;
                                case 'right':   startXY = { x: cC.width-containerOffset.x, y: dot.y }; break;
                                case 'top':     startXY = { x: dot.x, y: 0-containerOffset.y }; break;
                                case 'bottom':  startXY = { x: dot.x, y: cC.height-containerOffset.y }; break;
                            };

                            dot.setPosition(startXY.x,startXY.y);
                        };
                        
                        scene.tweens.add({
                            targets: dot, alpha: 1, x: finalXY.x, y: finalXY.y, useFrames: true, yoyo: true, delay: delay, hold: hold, duration: 60,
                            onComplete: (_t,_o)=> {
                                _o[0].destroy();
                                if (!container.getAll().length) { vars.UI.doIntro(); }
                            }
                        });
                    };
                });
            });
            x+=xyInc*6;
        });
    }

    setDotTexture(_texture=null) {
        if (_texture===null) return 'Invalid texture requested!';
        this.dotTexture = _texture;
    }

    setMoveFrom(_direction=null) {
        if (_direction===null) return 'Invalid direction set!';

        if (_direction==='none') { this.moveFrom=null; this.moveDotsIntoPosition = false; return 'Reset moveFrom and set moveDotsIntoPosition to false'; };

        this.moveFrom = !this.directions.includes(_direction) ? this.directions[0] : _direction;
        this.moveDotsIntoPosition = true;

        return `Move into position is now true. Direction set to ${_direction}`;
    }

    show(_show=true) {
        this.container.visible=_show;
    }
}