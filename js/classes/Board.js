let Board = class {
    constructor(_defaults) {
        this.difficulty = vars.game.options.difficulty;
        this.difficultySettings = [5,10,15,20];
        this.pointsInc = 10;
        this.scorePopups = [];
        let pointsOnBoard = this.difficultySettings[this.difficulty];
        this.positions = {
            x: pointsOnBoard+1,
            y: pointsOnBoard+1,
            maxWidth: 1200,
            maxHeight: 1200
        };

        this.squaresLeft = (this.positions.x-1)*(this.positions.y-1 ); // x and y are always equal but I prefer to think of it as a 2D board rather than 1D²

        let p = this.positions;
        p.xMod = p.maxWidth/(p.x-1);
        p.yMod = p.maxHeight/(p.y-1);

        this.connectables = [];
        this.connectedLines = [];
        this.selectedDot = null;

        this.init();
    }

    init() {
        this.dotRadius = vars.game.optionsScreen.dotRadius;
        this.buildUI();
    }
    initLine(_w) {
        if (scene.textures.list[`line_${this.difficulty}`]) return false;
        let graphics = scene.add.graphics();
        let fillColour = 0xcccccc;
        let _h = 12;
        graphics.fillStyle(fillColour);
        graphics.fillRect(0, 0, _w+12, _h);
        graphics.generateTexture(`line_${this.difficulty}`,_w+12,_h);
        graphics.clear().destroy();
    }

    buildUI() {
        this.container = scene.containers.board = scene.add.container().setName('board').setDepth(consts.depths.board);

        this.groups = {};
        this.groups.dots = scene.add.group().setName('dots');
        this.groups.lines = scene.add.group().setName('lines');
        this.groups.playerSquares = scene.add.group().setName('playerSquares');

        let border = 20;
        let bg = this.bg = vars.UI.generateBackground('pixel15', this.positions.maxWidth+border*2, this.positions.maxHeight+border*2).setAlpha(0.66);
        bg.x-=border;
        bg.y-=border;
        this.container.add(bg);

        let points = this.positions.x;
        let maxWidth = this.positions.maxWidth;
        let inc = this.dotsDelta = maxWidth/(points-1);

        // nos we know the spacing between the dots, we can create the connector line
        this.initLine(inc);
    
        for (let _y=0; _y<points; _y++) {
            for (let _x=0; _x<points; _x++) {
                let x = _x*inc;
                let y = _y*inc;
    
                let dot = scene.add.image(x,y,'dotUnused').setName(`dot_${_x+1}_${_y+1}`).setInteractive();
                this.groups.dots.add(dot);
                dot.highlighted=false;
                this.container.add(dot);
            };
        };

        this.positionContainer();
    }

    clickDot(_gameObject) {
        let name = _gameObject.name;
        
        // if the dot is highlighted already, unhighlight it
        if (_gameObject.highlighted) {
            this.unhighlightDot();
            return;
        };

        // player clicked on a dot that isnt the highlighted one
        if (this.selectedDot && !_gameObject.highlighted) {
            // is this dot a CONNECTABLE ?
            let dot = this.connectables.find(m=>m.name===name);
            if (dot) { this.connectDots(_gameObject); return; }; // it is

            // this isnt a connectable
            // unhighlight the current dot
            this.unhighlightDot();
            // highlight the new one
            this.highlightDot(_gameObject);
            return;
        };

        // no dots have been clicked yet, highlight this one and its connectables
        if (!this.selectedDot) {
            this.highlightDot(_gameObject);
            return;
        };
        
    }

    checkForBoxes(_objects, _lineType, _link) {
        // the incoming objects var is a pair of xy objects in the following form
        // _objects = [left/topmost dot x, y] and [right/lowest dot x, y]

        // upper/left lines
        let linesTestsA = [];
        let linesTestsB = [];

        switch (_lineType) {
            case 'h':
                // upper lines
                linesTestsA.push(`${_objects[0][0]},${_objects[0][1]-1},${_objects[1][0]},${_objects[1][1]-1}`);
                linesTestsA.push(`${_objects[0][0]},${_objects[0][1]-1},${_objects[0][0]},${_objects[0][1]}`);
                linesTestsA.push(`${_objects[1][0]},${_objects[1][1]-1},${_objects[1][0]},${_objects[1][1]}`);
                // lower lines
                linesTestsB.push(`${_objects[0][0]},${_objects[0][1]+1},${_objects[1][0]},${_objects[1][1]+1}`);
                linesTestsB.push(`${_objects[0][0]},${_objects[0][1]},${_objects[0][0]},${_objects[0][1]+1}`);
                linesTestsB.push(`${_objects[1][0]},${_objects[1][1]},${_objects[1][0]},${_objects[1][1]+1}`);
            break;

            case 'v':
                // left lines
                linesTestsA.push(`${_objects[0][0]-1},${_objects[0][1]},${_objects[0][0]},${_objects[0][1]}`);
                linesTestsA.push(`${_objects[0][0]-1},${_objects[0][1]},${_objects[1][0]-1},${_objects[1][1]}`); // adjacent left
                linesTestsA.push(`${_objects[1][0]-1},${_objects[1][1]},${_objects[1][0]},${_objects[1][1]}`);
                // right lines
                linesTestsB.push(`${_objects[0][0]},${_objects[0][1]},${_objects[0][0]+1},${_objects[0][1]}`);
                linesTestsB.push(`${_objects[0][0]+1},${_objects[0][1]},${_objects[1][0]+1},${_objects[1][1]}`); // adjacent right
                linesTestsB.push(`${_objects[1][0]},${_objects[1][1]},${_objects[1][0]+1},${_objects[1][1]}`);
            break;
        };
            
        let boxAtA = false;
        let boxAtB = false;

        let validCount = 0;
        linesTestsA.forEach((_l)=> {
            let valid = this.connectedLines.find(m=>m===_l);
            valid && (validCount++);
        });
        validCount===3 && (boxAtA=true);

        validCount = 0;
        linesTestsB.forEach((_l)=> {
            let valid = this.connectedLines.find(m=>m===_l);
            valid && (validCount++);
        });
        validCount===3 && (boxAtB=true);

        if (!boxAtA && !boxAtB) {
            this.getNextPlayer();
            return false;
        };


        // A BOX WAS FOUND

        // its possible a connecting line can create two boxes
        // so both have to be tested
        let points = 0;
        this.boxPositions = [];
        if (boxAtA) {
            vars.DEBUG && console.log('Box found at A');
            let x = Infinity; let y=Infinity;

            points+=this.pointsInc;
            // add the connecting line to the array
            linesTestsA.push(_link);
            linesTestsA.forEach((_l)=> {
                let xys = _l.split(',');
                let xy = this.container.getByName(`dot_${xys[0]}_${xys[1]}`).getCenter();
                xy.x<x && (x=xy.x);
                xy.y<y && (y=xy.y);
                xy = this.container.getByName(`dot_${xys[2]}_${xys[3]}`).getCenter();
                xy.x<x && (x=xy.x);
                xy.y<y && (y=xy.y);
                let lineObject = this.container.getByName(`line_${_l}`);
                scene.tweens.addCounter({
                    from: 3, to: 12, duration: 1000,
                    onUpdate: (_v)=> {
                        let alpha = _v.getValue()/10;
                        alpha>1 && (alpha = 2-alpha);
                        lineObject.setAlpha(alpha);
                    }
                });
            });
            this.boxPositions.push({x: x, y: y});
            this.squaresLeft--;
        };

        if (boxAtB) {
            vars.DEBUG && console.log('Box found at B');
            let x = Infinity; let y=Infinity;

            points+=this.pointsInc;
            !boxAtA && linesTestsB.push(_link);
            linesTestsB.forEach((_l)=> {
                let xys = _l.split(',');
                let xy = this.container.getByName(`dot_${xys[0]}_${xys[1]}`).getCenter();
                xy.x<x && (x=xy.x);
                xy.y<y && (y=xy.y);
                xy = this.container.getByName(`dot_${xys[2]}_${xys[3]}`).getCenter();
                xy.x<x && (x=xy.x);
                xy.y<y && (y=xy.y);
                let lineObject = this.container.getByName(`line_${_l}`);
                scene.tweens.addCounter({
                    from: 3, to: 12, duration: 1000,
                    onUpdate: (_v)=> {
                        let alpha = _v.getValue()/10;
                        alpha>1 && (alpha = 2-alpha);
                        lineObject.setAlpha(alpha);
                    }
                });
            });
            this.boxPositions.push({x: x, y: y});
            this.squaresLeft--;
        };

        (boxAtA || boxAtB) && (this.flashAllDots(), this.scorePopups = [], this.generateSquare());

        this.givePlayerPoints(points);
        vars.game.scoreCard.updateBoxesLeft(this.squaresLeft);

        !this.squaresLeft && this.finished();
    }

    checkForConnection(_from,_to) {
        let rv;
        if (_from.x===_to.x) { // vertical
            if (_from.y<_to.y) {
                rv = `${_from.x},${_from.y},${_to.x},${_to.y}`;
            } else {
                rv = `${_to.x},${_to.y},${_from.x},${_from.y}`;
            };
        } else { // horizontal
            if (_from.x<_to.x) {
                rv = `${_from.x},${_from.y},${_to.x},${_to.y}`;
            } else {
                rv = `${_to.x},${_to.y},${_from.x},${_from.y}`;
            };
        };
    
        return this.connectedLines.includes(rv);
    }

    connectDots(_gameObject) {
        vars.DEBUG && console.log(`Joining ${this.selectedDot.name} and ${_gameObject.name} together`);
        let startXY = { x: this.selectedDot.x, y: this.selectedDot.y };
        let endXY = { x: _gameObject.x, y: _gameObject.y };

        let from = this.selectedDot.name.split('_').splice(1,2)
        from.forEach((_n,_i)=> { from[_i]=_n|0 });
        let to = _gameObject.name.split('_').splice(1,2);
        to.forEach((_n,_i)=> { to[_i]=_n|0 });
        
        // draw the line
        let line = scene.add.image(startXY.x,startXY.y,`line_${this.difficulty}`);
        // reposition it to connect the dots
        let lineType;
        if (startXY.x===endXY.x) { // vertical line
            lineType = 'v';
            line.setAngle(90);
            startXY.y>endXY.y ? line.y-=line.width/2-this.dotRadius : line.y+=line.width/2-this.dotRadius;
        } else { // horizontal line
            lineType = 'h';
            startXY.x>endXY.x ? line.x-=line.width/2-this.dotRadius : line.x+=line.width/2-this.dotRadius;
        };
        // drop the lines alpha
        line.setAlpha(0.33);
        
        // create the objects array and set the lines name
        let objects;
        if (lineType==='v') {
            objects = from[1]<to[1] ? [from,to] : [to,from];
        } else if (lineType==='h') {
            objects = from[0]<to[0] ? [from,to] : [to,from];
        };
        let lineName = `line_${objects[0][0]},${objects[0][1]},${objects[1][0]},${objects[1][1]}`;
        line.setName(lineName);
        this.container.add(line);
        this.sendToBack(line);
        this.groups.lines.add(line);
        
        let link = objects[0].join(',') +','+ objects[1].join(',');
        this.connectedLines.push(link);
        this.unhighlightDot();
        
        // now we need to check if this line created a box
        this.checkForBoxes(objects,lineType,link);
    }

    destroy(){
        this.scorePopups.forEach((_c)=> { _c.remove(); });
        this.scorePopups = [];
        
        for (let g in this.groups) { this.groups[g].destroy(true,true); };
        this.container.destroy(true);

        // reset everything in the score card
        vars.game.scoreCard.destroy();
        // reset the players
        vars.game.playersReset();
    }

    finished() {
        console.log(`All Squares have been outlined`);

        let optionsScreen = vars.game.optionsScreen;
        let players = vars.game.players;
        // figure out the order of the players
        let scores = [];
        for (let p=1; p<=optionsScreen.players; p++) {
            let playerID = `p${p}`;
            let playerScore = players[playerID].score;
            scores.push({ score: playerScore, playerID: playerID });
        };
        arraySortByKey(scores,'score').reverse();
        let playersOrder = [];
        scores.forEach((_s)=> {
            playersOrder.push(_s.playerID);
        });

        // now show the win screen
        scene.tweens.addCounter({
            from:0, to:1, duration:1500, onComplete: ()=> { vars.game.winScreen.show(true,playersOrder); vars.game.board.destroy(); }
        });
    }

    flashAllDots() {
        let v = this.difficulty>1 ? { delayMult: 2, duration: 125 } :  { delayMult: 8, duration: 250 };
        this.groups.dots.getChildren().forEach((_c,_i)=> {
            scene.tweens.add({ targets: _c, alpha: 0.1, useFrames: false, delay: _i*v.delayMult, duration: v.duration, yoyo: true });
        });
    }

    generateSquare() {
        let fontSize = this.difficulty>1 ? '18px' : '36px';
        let font = { ...vars.fonts.default, ...{ fontSize: fontSize} };
        let pID = `p${vars.game.options.playerCurrent}`;
        let offset = this.dotsDelta/2;
        this.scorePopups = [];
        this.boxPositions.forEach((_bp,_i)=> {
            let x = _bp.x+offset;
            let y = _bp.y+offset;
            let square = scene.add.image(x,y,`pixel${pID}`).setScale(this.dotsDelta/2).setAlpha(0.3);
            let name = vars.game.players[pID].name;
            let text = scene.add.text(x,y,name,font).setOrigin(0.5).setScale(0.5).setAlpha(0.3);
            square.belongsToPlayer = pID;
            this.groups.playerSquares.addMultiple([square, text]);
            this.container.add([square, text]);

            // tween the square and text
            let duration = 750;
            scene.tweens.add({
                targets: square, alpha: 1, scale: this.dotsDelta, duration: duration,
                onComplete: ()=> { vars.game.board.sendToBack(text); vars.game.board.sendToBack(square); }
            });
            scene.tweens.add({ targets: text, alpha: 1, scale: 1, duration: duration });

            this.scorePopup({x:x,y:y});

            scene.tweens.addCounter({
                from: 0, to: 1, duration: _i*500,
                onComplete: ()=> { vars.audio.playSound('fillSquare'); }
            });
        });

        this.boxPositions = [];
    }

    getNextPlayer() {
        let playerkey = vars.game.getNextPlayer();
        vars.game.scoreCard.setCurrentPlayer(playerkey)
    }

    givePlayerPoints(_points) {
        let gV = vars.game;

        let p = gV.getCurrentPlayer();
        p.addScore(_points);

        // get the next player
        this.getNextPlayer();
    }

    highlightDot(_gameObject) {
        let xy = _gameObject.name.split('_');
        xy.splice(0,1);
        vars.DEBUG && console.log(`Dot at position ${xy[0]},${xy[1]} clicked`);

        _gameObject.highlighted=true;
        _gameObject.setTexture('dotUsed');
        this.selectedDot = _gameObject;

        this.highlightSurrounding(~~xy[0],~~xy[1]);
    }

    highlightSurrounding(_x,_y) {
        vars.DEBUG && console.log(`  >> Highlighting positions around ${_x},${_y}`);

        let checks = [[_x-1,_y],[_x+1,_y],[_x,_y-1],[_x,_y+1]];
        checks.forEach((_pos,_i)=> {
            if ((_pos[0] && _pos[0]<=this.positions.x) && (_pos[1] && _pos[1]<=this.positions.y)) {
                let rS = this.checkForConnection({ x: _x, y: _y }, { x:_pos[0], y:_pos[1] });
                if (!rS) {
                    vars.DEBUG && console.log(`    >> Highlighting ${_pos[0]},${_pos[1]}`);
                    let connectable = this.container.getByName(`dot_${_pos[0]}_${_pos[1]}`);
                    this.connectables.push(connectable);
                    connectable.setTexture('dotConnectable');
                };
            };
        });
    }

    positionContainer() {
        let cC = consts.canvas;
        let x = (cC.width-this.positions.maxWidth)/2;
        let y = (cC.height-this.positions.maxHeight)/2;

        this.container.setPosition(x,y);
    }

    scorePopup(_position) {
        let font = { ...vars.fonts.default, ...{ fontSize: '32px' } };
        let name = `s_${getRandom(0,99999)}`;
        let s = scene.add.text(_position.x, _position.y-32,`+${this.pointsInc}`, font).setOrigin(0.5).setName(name);
        this.container.add(s);
        this.scorePopups.push(s);
        s.tween = scene.tweens.add({
            targets: s, y: s.y-64, alpha: 0, duration: 1250, onComplete: (_t,_o)=> {
                let b = vars.game.board;
                let index = b.scorePopups.find(m=>m===_o[0].name);
                b.scorePopups.splice(index,1);
                _o[0].destroy();
            }
        });
    }

    sendToBack(_object) {
        this.container.sendToBack(_object);
        this.container.sendToBack(this.bg);
    }

    unhighlightDot() {
        let _gameObject = this.selectedDot;
        _gameObject.highlighted=false;
        _gameObject.setTexture('dotUnused');

        // reset the connectables that were highlighted
        this.connectables.forEach((_c)=> {
            _c.setTexture('dotUnused');
        });
        this.connectables = [];
        this.selectedDot = null;
    }
};