let WinScreen = class {
    constructor() {
        let cC = consts.canvas;
        let h = cC.height;
        this.phaserObjects = {};
        this.playersDots = { p1: null, p2: null, p3: null, p4: null };
        this.positionsY = { start: h*0.9, text: h*0.3, win: h*0.2, secondPlace: h*0.4, thirdPlace: h*0.5, fourthPlace: h*0.6 };
        this.initUI();
    }

    initUI() {
        let cC = consts.canvas;
        let depth = consts.depths.winScreen;
        let container = this.container = scene.add.container().setName('winScreen').setDepth(depth);

        let p = 1;
        let y = this.positionsY.start;
        for (let pDot in this.playersDots) {
            let x = cC.width*(0.2*p);
            let playerDot = this.playersDots[pDot] = scene.add.image(x,y,`${pDot}_dot`);
            container.add(playerDot);
            playerDot.startX = x;
            p++;
        };

        let font = { ...vars.fonts.default };
        let name = 'AAA'; let points = 0;
        let text = this.phaserObjects.winText = scene.add.text(cC.cX, this.positionsY.text, `${name} wins with ${points}`,font).setOrigin(0.5).setAlpha(0);
        text.show = (_show=true)=> {
            let alpha=_show?1:0;
            let delay=_show?500:10;
            let duration=_show?1000:10;
            scene.tweens.add({
                targets: text, alpha: alpha, delay: delay, duration: duration,
                onComplete: ()=> {
                    _show ? vars.game.winScreen.showContinueButton(true) : vars.game.winScreen.showContinueButton(false);
                }
            });
        }
        this.container.add(text);

        let cCon = this.continueContainer = scene.add.container().setName('winScreen_continue');
        cCon.show  = (_show=true)=> {
            if (cCon.tween) { cCon.tween.remove(); cCon.tween=null };
            let alpha=_show?1:0;
            let duration = !_show ? 100 : 2000;
            cCon.tween = scene.tweens.add({ targets: cCon, alpha: alpha, duration: duration, onComplete: ()=> { cCon.tween=null} });
        };
        
        let continueButton = scene.add.image(cC.cX,cC.height*0.8, 'newGameButtonBG').setInteractive();
        continueButton.on('pointerup', ()=> {
            // show the options screen
            vars.game.winScreen.show(false)
        });
        let continueText = scene.add.text(cC.cX,cC.height*0.8, 'CONTINUE', font).setOrigin(0.5);
        this.continueContainer.add([continueButton,continueText]);
        this.container.add(this.continueContainer);
        this.show(false);
    }

    fadeInWinText() {
        this.phaserObjects.winText.show();
    }

    generateWinVars() {
        this.playerScores = { p1: null, p2: null, p3: null, p4: null };
        let players = vars.game.players;
        for (let pD in this.playersDots) { 
            this.playersDots[pD].visible=true;
            this.playerScores[pD] = players[pD] ? players[pD].score : null;
        };
        // sort the scores into groups and set the order to highest score first
        this.orderPlayerScores();
        
        let fullString = '';
        this.scoreSets.forEach((_sS,_i)=> {
            let winPosition = _i;

            // for each of the scores add the finishing y position based on the players winning position
            switch (winPosition) {
                case 0: // winning position
                    _sS.endY = this.positionsY.win;
                    // get the xOffsets for the playerDots
                    let xOffsets = this.getXOffsets(_sS.pID.length);
                    // generate the win text
                    let pIDLen = _sS.pID.length-1;
                    _sS.pID.forEach((_pID,_i)=> {
                        let name = vars.game.players[_pID].name;
                        this.playersDots[_pID].endX = xOffsets[_i];
                        this.playersDots[_pID].endY = _sS.endY;
                        this.playersDots[_pID].winPosition = winPosition;

                        fullString+=name;
                        _i+1 < pIDLen && (fullString+=', ');
                        _i+1===pIDLen && (fullString+=' & ');
                    });
                    pIDLen++;
                    fullString+= pIDLen>1 ? ` DRAW FOR 1ST PLACE WITH ${_sS.score} POINTS.` : ` WINS WITH ${_sS.score} POINTS!`;
                break;

                case 1: // 2nd position
                    _sS.endY = this.positionsY.secondPlace;
                break;

                case 2: // 3rd position
                    _sS.endY = this.positionsY.thirdPlace;
                break;

                case 3: // 4th position
                    _sS.endY = this.positionsY.fourthPlace;
                break;
            };

            if (winPosition>0) {
                let xOffsets = this.getXOffsets(_sS.pID.length);
                _sS.pID.forEach((_pID,_i)=> {
                    this.playersDots[_pID].endX = xOffsets[_i];
                    this.playersDots[_pID].endY = _sS.endY;
                    this.playersDots[_pID].winPosition = winPosition;
                });
            };
        });
        this.updateWinText(fullString);
    }

    getXOffsets(_len) {
        let xOff = 150;
        let xOffsets;
        if (_len===1) xOffsets = [0];
        if (_len===2) xOffsets = [-xOff/2,xOff/2];
        if (_len===3) xOffsets = [-xOff,0,xOff];
        if (_len===4) xOffsets = [-xOff*1.5,-xOff/2,xOff/2,xOff*1.5];
    
        return xOffsets;
    }

    orderPlayerScores() {
        this.scoreSets = [];
        for (let pID in this.playerScores) {
            let score = this.playerScores[pID];
            if (score!==null) {
                let index = this.scoreSets.findIndex(m=>m.score===score);
                index===-1 ? this.scoreSets.push({ score: score, pID: [pID]}) : this.scoreSets[index].pID.push(pID);
            };
        };
        arraySortByKey(this.scoreSets,'score').reverse();

        vars.DEBUG && console.log(this.scoreSets);
        return;
    }

    resetPlayerDots() {
        for (let _p in this.playersDots) {
            let p = this.playersDots[_p];
            p.endX=null; p.endY=null; p.winPosition=null;
            p.setPosition(p.startX, this.positionsY.start);
        };
    }

    repositionDotsByPoints() {
        let cC = consts.canvas;
        let currentDot = 0;
        for (let pD in this.playersDots) {
            let playerDot = this.playersDots[pD];
            if (checkType(playerDot.endX,'number') && checkType(playerDot.endY,'number')) {
                playerDot.visible=true;
                scene.tweens.add({
                    targets: playerDot,
                    delay: currentDot*250, duration: 2000,
                    x: cC.cX+playerDot.endX, y: playerDot.endY,
                    ease: 'Quad.easeOut',
                    onComplete: ()=> {
                        if (!currentDot) {// first dot has moved to its end position, start fading in the win text
                            this.phaserObjects.winText.show();
                        };
                    }
                });
            } else { // hide this dot
                playerDot.visible=false;
            }

            // reset the dots vars
            playerDot.endX=null;
            playerDot.endY=null;
            playerDot.winPosition=null;

            currentDot++;
        };
    }

    show(_show=true, _order=[]) {
        let min = 2;
        let max = vars.game.options.playersMax;
        if (_show && (!checkType(_order,'array') || _order.length<min || _order.length>max)) return `Invalid order sent, it should look something like ['p3','p1','p2','p4'] and must be at LEAST 2 in length`;

        this.container.setVisible(_show);
        if (!_show) { this.phaserObjects.winText.show(false); this.resetPlayerDots(); this.showOptionsScreen(); return; };

        this.generateWinVars(); // this also updates the win string
        this.repositionDotsByPoints();
    }

    showContinueButton(_show=true) {
        this.continueContainer.show(_show);
    }

    showOptionsScreen() {
        vars.game.optionsScreen && vars.game.optionsScreen.show();
    }

    // incoming _name can be a single player eg 'SJF', or it can be multiple players eg 'SJF and ABC'
    updateWinText(_fullString) {
        this.phaserObjects.winText.text = _fullString;
        this.fadeInWinText();
    }
};