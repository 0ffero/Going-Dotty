"use strict";
var vars = {
    DEBUG: false,
    name: 'Going Dotty',

    version: 1.31,

    versionInfo: [
        { v: 0.99,
            info: 'Actually v1.0. The reason for the numbering discrepency is because Ive made new pixel colours for the players (as the current ones are too bright).\
                    Unfortunately my base64 script is on my main machine. So the game IS 1.0 sans the new square colours'
        },
        { v: 1.01,
            info: 'Added particles to the new game screen'
        },
        { v: 1.1,
            info: 'Updated to new squares colours.\
                    Added the difficulty selector the the options screen. Works well :)'
        },
        { v: 1.11,
            info: 'Minor timing bug causing the win screen to break is now fixed'
        },
        { v: '1.12->1.15',
            info: 'UI Overhaul',
        },
        { v: '1.16->1.18',
            info: 'Animations added. Audio added.',
        },
        { v: '1.2->1.25',
            info: 'Added (enhanced) fireworks (with tracers) to the win screen along with sound effects',
        },
        { v: '1.26->1.28',
            info: 'Firework "mothers" can generate more fireworks',
        },
        { v: '1.29->1.3',
            info: 'Added special fireworks (only one type just now)',
        },
        { v: 1.31,
            info: 'Flower particle emitter added to fireworks'
        }
    ],

    fonts: {
        default:  { fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '36px', color: '#ffffff', stroke: '#111111', strokeThickness: 3, align: 'center', lineSpacing: 20 }
    },

    init: function(_phase) {
        switch (_phase) {
            case 'PRELOAD': // PRELOADS
                vars.files.loadAssets();
                vars.localStorage.init();
                break;
            case 'CREATE': // CREATES
                vars.anims.init();
                vars.audio.init();
                vars.containers.init();
                vars.groups.init();
                vars.input.init();
                //vars.particles.init();
                //vars.shaders.init();
                vars.UI.init();
                break;
            case 'STARTAPP': // GAME IS READY TO PLAY
                vars.game.init();
            break;

            default:
                console.error(`Phase (${_phase}) was invalid!`);
                return false;
            break;
        }
    },

    files: {
        audio: {
            load: function() {
                scene.load.audio('fillSquare', 'audio/fillSquare.ogg');
                scene.load.audio('buttonClick', 'audio/buttonClick.ogg');
                scene.load.audio('singleClick', 'audio/singleClick.ogg');
                
                scene.load.audio('deleteLetter', 'audio/deleteLetter.ogg');
                
                ['fireworkExplode_1','fireworkExplode_2'].forEach((_fe)=> {
                    vars.audio.available.fireworkExplode.push(_fe);
                    scene.load.audio(_fe, `audio/${_fe}.ogg`);
                });

                ['fireworkTakeOff_1'].forEach((_fto)=> {
                    vars.audio.available.fireworkTakeOff.push(_fto);
                    scene.load.audio(_fto, `audio/${_fto}.ogg`);
                });
            }
        },

        images: {
            available: [],
            header: 'data:image/png;base64,',
            preA: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCA',
            preB: 'AAAAA6fptV[d]QIHW',
            postC: 'AAAABJRU5ErkJggg==',
            postD: 'AAAACklEQV',
            postE: 'IAAACQd1Pe',
            postF: 'AAAADElEQVR42m',
            postG: 'AAAAAElFTkSuQmCC',
            base64s: {
                'blackpixel'        : '[a][e][d]R4AWMAAgAABAABsYaQRA[c]',
                'whitepixel'        : '[a][b]P4DwABAQEANl9ngA[c]',
                'pixel2'            : '[a][b]NQAgAAJAAjw8NKCg[c]',
                'pixel3'            : '[a][b]MwBgAANQA0TdMIeQ[c]',
                'pixel6'            : '[a][b]NIAwAAaABnVJ+6Kw[c]',
                'pixel9'            : '[a][b]OYCQAAmwCaKknZIA[c]',
                'pixel15'           : '[a][b]MQBQAAFwAW6lOQIQ[c]',
                'pixelC'            : '[a][b]M4AwAAzgDNUwEBJA[c]',

                'pixelp1'           : '[a][e][f]No8PUFAAJrARu8dLmV[g]',
                'pixelp2'           : '[a][e][f]PwbfAFAAI4ARtFfkfd[g]',
                'pixelp3'           : '[a][e][f]Pw9W0AAAIFARtLehgV[g]',
                'pixelp4'           : '[a][e][f]NoaPAFAALRAU7B4efL[g]',
            },
            init: ()=> {
                let fIV = vars.files.images;
                let base64s = fIV.base64s;
                let header = fIV.header;
                let preA = fIV.preA;
                let preB = fIV.preB;
                let postC = fIV.postC;
                let postD = fIV.postD;
                let postE = fIV.postE;
                let postF = fIV.postF;
                let postG = fIV.postG;
                for (let b in base64s) {
                    let b64 = header + base64s[b];
                    let newb64 = b64.replace('[a]', preA).replace('[b]',preB).replace('[c]',postC).replace('[d]',postD).replace('[e]',postE).replace('[f]',postF).replace('[g]',postG);
                    scene.textures.addBase64(b, newb64);
                    fIV.available.push(b);
                };

            },
            load: ()=> {
                vars.files.images.init();

                scene.load.atlas('ui', 'images/ui.png', 'images/ui.json');
                scene.load.atlas('flares', 'images/flares.png', 'images/flares.json');
            }
        },

        loadAssets: ()=> {
            let fV = vars.files;
            scene.load.path='assets/';

            fV.images.load();
            fV.audio.load();
        }
    },

    containers: {
        init: ()=> {
            let depths = consts.depths;
            !scene.containers ? scene.containers = {} : null;
            //scene.containers.game = scene.add.container().setName('game').setDepth(depths.gameMap);
        }
    },

    groups: {
        init: ()=> {
            scene.groups = { };
            //scene.groups.groupName = scene.add.group().setName('groupName');
        }
    },

    localStorage: {
        pre: 'GDY_',

        init: ()=> {
            let lV = vars.localStorage;
            let lS = window.localStorage;
            let pre = lV.pre;

            if (!lS[`${pre}options`]) {
                //generate the options string
                let options = { names: vars.game.playerNames, options: vars.game.options };
                lS[`${pre}options`] = JSON.stringify(options);
            };

            let options = JSON.parse(lS[`${pre}options`]);
            vars.game.playerNames = options.names;
            vars.game.options = options.options;
        },

        saveOptions: ()=> {
            vars.DEBUG && console.log(`%cSaving options`, 'color: #ff4d4d');
            let lV = vars.localStorage;
            let lS = window.localStorage;
            let pre = lV.pre;

            let options = { names: vars.game.playerNames, options: vars.game.options };
            lS[`${pre}options`] = JSON.stringify(options);
        }
    },



    // GAME/APP
    anims: {
        init: ()=> {
            vars.DEBUG ? console.log(`FN: anims > init`) : null;
            
        }
    },

    audio: {
        available: {
            fireworkTakeOff: [],
            fireworkExplode: [],
        },
        detunes: [],

        init: ()=> {
            vars.DEBUG ? console.log(`FN: audio > init`) : null;

            scene.sound.volume=0.4;

            for (let i=-1000; i<=1000; i+=200) {
                vars.audio.detunes.push(i);
            };
        },

        fireworkExplode: ()=> {
            let aV = vars.audio;
            let key = getRandom(aV.available.fireworkExplode);
            let detunes = [ ...aV.detunes ];
            detunes = detunes.splice(0,(detunes.length+1)/2|0);
            let detune = getRandom(detunes);
            scene.sound.play(key, { detune: detune });
        },

        fireworkTakeOff: ()=> {
            let aV = vars.audio;
            let key = getRandom(aV.available.fireworkTakeOff);
            let detune = getRandom(aV.detunes);
            scene.sound.play(key, { detune: detune });
        },

        playButtonClick: ()=> {
            vars.audio.playSound('buttonClick');
        },

        playSingleClick: ()=> {
            vars.audio.playSound('singleClick');
        },

        playSound: (_key)=> {
            scene.sound.play(_key);
        },
    },

    camera: {
        // cameras
        mainCam: null,

        init: ()=> {
            vars.DEBUG && console.log(`FN: camera > init`);
            vars.camera.mainCam = scene.cameras.main;
        }
    },

    game: {
        board: null,
        fireworkCount: 2,
        nameEntry: null,
        options: { difficulty: 1, difficultySettings: [5,10,15,20], playerCurrent: 1, playersTotal: 2, playersMin: 2, playersMax: 4 },
        players: {
            p1: null,
            p2: null,
            p3: null,
            p4: null
        },
        playerColours: [0xff4d4d,0x4dff4d,0x4d4dff,0xffff4d,0x0],
        playerNames: ['P1','P2','P3','P4'],
        getCurrentPlayer: ()=> {
            return vars.game.players[`p${vars.game.options.playerCurrent}`];
        },
        getNextPlayer: (_returnPlayer=false)=> {
            let gV = vars.game;
            let options = gV.options;

            options.playerCurrent++;
            options.playerCurrent>options.playersTotal && (options.playerCurrent=1);

            if (!_returnPlayer) return (`p${options.playerCurrent}`); // the actual player wasnt needed, just the player id, se return it

            return gV.players[`p${options.playerCurrent}`];
        },
        playersReset() {
            let players = vars.game.players;
            for (let p in players) { players[p]=null; };
        },

        init: ()=> {
           vars.DEBUG ? console.log(`\nFN: game > init`) : null;

        },

        generateNewBoardAndScoreCard: ()=> {
            let gV = vars.game;
            gV.board = new Board();
            gV.scoreCard = new ScoreCard();
            
            scene.tweens.addCounter({
                from: 0, to: 1, useFrames: true, duration: 10,
                onComplete: ()=> { gV.scoreCard.updateBoxesLeft(gV.board.squaresLeft, true); }
            });
            
        },

        generatePlayers: ()=> {
            let gV = vars.game;
            let options = gV.options;
            for (let p=1; p<=options.playersTotal; p++) {
                gV.players[`p${p}`] = new Player(p);
            };
        },

        showNameEntry: (_playerID)=> {
            if (_playerID<0 || _playerID>3) return `Invalid player ID ${_playerID}`;
            vars.game.nameEntry.show(true, _playerID);
        },

        start: ()=> {
            vars.game.generatePlayers();
            vars.game.generateNewBoardAndScoreCard();            
        }
    },

    input: {
        cursors: null,
        locked: false,

        init: ()=> {
            vars.DEBUG ? console.log(`FN: input > init`) : null;

            scene.input.on('pointermove', (_pointer)=> {

            });
            scene.input.on('pointerdown', (_pointer)=> {
                
            });
            scene.input.on('pointerup', (_pointer)=> {
                
            });

            // mouse scroll (zoom in / out)
            scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ)=> {

            });

            // phaser objects
            scene.input.on('gameobjectdown', (pointer, gameObject)=> {
                //let name = gameObject.name;
            });
            scene.input.on('gameobjectup', (pointer, gameObject)=> {
                vars.input.click(gameObject);
            });

            scene.input.on('gameobjectover', (pointer, gameObject)=> {
                vars.input.over(gameObject);
            });

            scene.input.on('gameobjectout', (pointer, gameObject)=> {
                vars.input.out(gameObject);
            });
        },

        click: (_gameObject)=> {
            let name = _gameObject.name;

            if (name.startsWith('dot_')) {
                vars.game.board.clickDot(_gameObject);
                return;
            };

            if (name.startsWith('nameEntry_')) {
                vars.game.nameEntry.click(_gameObject);
                return;
            }
        },
        out: (_gameObject)=> {
            let name = _gameObject.name;
            // BOARD OBJECTS
            if (name.startsWith('dot_')) {
                game.canvas.style.cursor='default';
                return;
            };

            if (name.startsWith('nameDot_p')) {
                vars.game.optionsScreen.showHoverText(false);
                return;
            };
        },
        over: (_gameObject)=> {
            let name = _gameObject.name;
            // BOARD OBJECTS
            if (name.startsWith('dot_')) {
                game.canvas.style.cursor='crosshair';
                return;
            };

            if (name.startsWith('nameDot_p')) {
                let p = name.replace('nameDot_p','');
                vars.game.optionsScreen.showHoverText(true, p, _gameObject.x);
                return;
            };
        }
    },

    particles: {
        init: ()=> {
            vars.DEBUG ? console.log(`FN: particles > init`) : null;

            scene.particles = {}
        },

        generateBubbles: ()=> {
            let bubblesContainer = scene.containers.bubble =  scene.add.container().setName('bubblesContainer').setDepth(consts.depths.bubbles);
            bubblesContainer.bubblesTween = scene.tweens.addCounter({
                from: 0, to: 1, duration: 1000, repeat: -1,
                onRepeat: ()=> {
                    if (!bubblesContainer.visible) return;
                    let x = getRandom(5, consts.canvas.width/10-5)*10;
                    let y = getRandom(5, consts.canvas.height/10-5)*10;
                    let texture = getRandom(['dotConnectable','dotUsed','dotUnused']);
                    let bubble = scene.add.image(x,y,texture);
                    bubblesContainer.add(bubble);
                    let duration = getRandom(2,4)*1000;
                    let finalScale = getRandom(2,5);
                    scene.tweens.add({
                        targets: bubble, alpha: 0, scale: finalScale, duration: duration, onComplete: (_t,_o)=> { _o[0].destroy(); }
                    });
                }
            });

            bubblesContainer.show = (_show=true)=> {
                bubblesContainer.visible=_show;
                !_show && bubblesContainer.removeAll(true);
            };
        }
    },

    phaserObjects: {},

    shaders: {
        available: [],

        init: ()=> {
            vars.DEBUG ? console.log(`FN: shaders > init`) : null;

        }
    },

    UI: {
        repeats: ['repeat_1','repeat_2','repeat_3'],

        init: ()=> {
            vars.DEBUG ? console.log(`FN: ui > init`) : null;

            vars.UI.generateRepeatingBackground();

            vars.game.nameEntry = new NameEntry();
            vars.game.optionsScreen = new OptionsScreen();

            scene.tweens.addCounter({ from:0, to:1, useFrames: true, duration: 10, onComplete: ()=> { vars.UI.generateWinScreen(); }});

        },

        generateBackground: (_colour,_w=null, _h=null)=> {
            if (!vars.files.images.available.includes(_colour)) return false;

            let cC = consts.canvas;
            let width = _w||cC.width;
            let height = _h||cC.height;

            let bg = scene.add.image(width/2, height/2, _colour).setScale(width,height);
            return bg;
        },
        generateRepeatingBackground: (_frame)=> {
            if (!_frame) _frame = getRandom(vars.UI.repeats);
            let cC = consts.canvas;

            let frame = scene.textures.getFrame('ui',_frame);
            if (frame.name !==_frame) return `Frame ${_frame} not found`; // Phaser will return the first frame in the texture if the frame requested wasnt found, coz dumb. this is the fix

            let fW = frame.width;
            let fH = frame.height;

            let wRepeats = (cC.width/fW|0)+1;
            let hRepeats = (cC.height/fH|0)+1;
            let totalRepeats = wRepeats*hRepeats-1;
            let group = scene.add.group({ key: 'ui', frame: _frame, repeat: totalRepeats });
            //  Align them in a grid
            Phaser.Actions.GridAlign(group.getChildren(), { width: wRepeats, cellWidth: fW, cellHeight: fH, x: fW/2, y: fH/2 });

            return group;
        },
        generateTextShadow(_object, _offsets={x:8, y:8}) {
            let text = _object.text;
            let font = { ..._object.font };
            font.color = '#000000';
            let position = _object.getCenter();
            let origin = { x: _object.originX, y: _object.originY };
            // i need the font
            let textShadow = scene.add.text(position.x+_offsets.x,position.y+_offsets.y,text,font).setOrigin(origin.x,origin.y).setAlpha(0.25);
            return textShadow;
        },

        generateWinScreen() {
            vars.game.winScreen = new WinScreen();
        }
    }
};