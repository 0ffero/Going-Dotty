let ScoreCard = class {
    constructor() {
        let gV = vars.game;
        this.players = gV.players;

        this.font = { ...vars.fonts.default, ...{fontSize: '42px', strokeThickness: 6 } };

        this.phaserObjects = {};

        // delay generating the UI as the texture is only created at the end of this frame
        scene.tweens.addCounter({ from:0,to:1,useFrames:true,duration:1,onComplete: ()=> { vars.game.scoreCard.init(); }})
    }
    
    init() {
        this.container = scene.add.container().setName('scoreCard');
        this.groups = {};

        let x = 100;
        let y = 100; let yInc = 250;
        let width;
        let containerWidth;
        for (let player in this.players) {
            if (!this.players[player]) { continue };
            let group = this.groups[player] = scene.add.group().setName(`playerGroup_${player}`);
            let pO = this.phaserObjects[player] = {};
            let playerDot = scene.add.image(x,y,`${player}_dot`).setOrigin(0,0.5);
            !width && (width = playerDot.width);
            let playerName = scene.add.text(x+width/2, y, this.players[player].name, this.font).setOrigin(0.5);
            let playerScore = pO.playerScore = scene.add.text(x+width/2, y+100, 'Score: ' + this.players[player].score, this.font).setOrigin(0.5);
            !containerWidth && ( containerWidth = playerScore.x + playerScore.width +16);
            this.container.add([playerDot,playerName,playerScore]);
            group.addMultiple([playerDot,playerName,playerScore]);

            y+=yInc;
        };

        let squaresLeft = this.phaserObjects.squaresLeft = scene.add.text(x+width/2, y+100, 'SQUARES LEFT\n0', this.font).setOrigin(0.5);
        this.container.add(squaresLeft);


        let cC = consts.canvas;
        this.container.width = containerWidth;
        this.container.height = cC.height;

        this.container.x = cC.width-this.container.width;

        this.setCurrentPlayer('p1');
    }

    destroy() {
        for (let g in this.groups) {
            this.groups[g].destroy(true,true);
        };
        this.container.destroy(true);

        vars.game.scoreCard=null;
    }

    setCurrentPlayer(_player) {
        for (let g in this.groups) {
            let alpha = g===_player ? 1 : 0.25;
            let group = this.groups[g];
            group.getChildren().forEach((_c)=> {
                _c.setAlpha(alpha);
            });
        };
    }

    updateBoxesLeft(_squaresLeft, _init=false) {
        if (_init) {
            scene.tweens.addCounter({
                from: 0, to: _squaresLeft, useFrames: true, duration: 180,
                onUpdate: (_v)=> {
                    this.phaserObjects.squaresLeft.text = `SQUARES LEFT\n${_v.getValue()|0}`;
                }
            });
        } else {
            this.phaserObjects.squaresLeft.setText('SQUARES LEFT\n' + _squaresLeft);
        };
    }

    updatePlayersScore(_playerKey, _score) {
        this.phaserObjects[_playerKey].playerScore.setText(`Score: ${_score}`);
    }
}