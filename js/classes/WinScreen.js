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

        let bg = vars.UI.generateBackground('pixel3');
        container.add(bg);

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
        let text = this.phaserObjects.winText = scene.add.text(cC.cX, this.positionsY.text, `${name} wins with ${points}`,font).setOrigin(0.5);
        this.container.add(text);
        this.show(false);
    }

    orderPlayerScores() {
        this.scoreSets = [];
        for (let pID in this.playerScores) {
            let score = this.playerScores[pID];
            //!this.scoreSets[score] && (this.scoreSets[score] = []);
            let index = this.scoreSets.findIndex(m=>m.score===score);
            index===-1 ? this.scoreSets.push({ score: score, pID: [pID]}) : this.scoreSets[index].pID.push(pID);
        };
        arraySortByKey(this.scoreSets,'score').reverse();

        vars.DEBUG && console.table(this.scoreSets);
        return;
    }

    resetPlayerDots() {
        for (let _p in this.playersDots) {
            let p = this.playersDots[_p];
            p.setPosition(p.startX, this.positionsY.start);
        };
    }

    // this is the function that re-orders the player dots to show who came in 1st, 2nd etc
    // incoming order var: order = ['p3','p1','p2','p4']
    repositionDotsByPoints(_order=[]) {
        let max = vars.game.options.playersMax;

        // make all dots visible then hide the ones we arent interested in
        // at the same time we'll import the scores
        // the scores are needed to determine the finalY position for the
        // animation as 2 players can have the same score
        this.playerScores = { p1: null, p2: null, p3: null, p4: null };
        let players = vars.game.players;
        for (let pD in this.playersDots) { 
            this.playersDots[pD].visible=true;
            this.playerScores[pD] = players[pD] ? players[pD].score : null;
        };
        // sort the scores into groups and set the order to highest score first
        this.orderPlayerScores();
        let hidden = max-_order.length;
        for (let h=0; h<hidden; h++) { this.playersDots[`p${max-h}`].visible=false; };

        // move them into ordered position
        let cC = consts.canvas;
        let positions = [this.positionsY.win,this.positionsY.secondPlace,this.positionsY.thirdPlace,this.positionsY.fourthPlace];
        _order.forEach((_p,_i)=> {
            scene.tweens.add({
                targets: this.playersDots[_p],
                delay: _i*250, duration: 2000,
                x: cC.cX, y: positions[_i],
                ease: 'Quintic'
            });
        });
    }

    show(_show=true, _order=[]) {
        console.error(`TODO: START FROM HERE ->\n\
                        We can request a show by playing a few moves so the players have points\n\
                        we need to update the win text using this.updateWinText()\n\
                        before continuing!`);
        debugger;
        let min = 2;
        let max = vars.game.options.playersMax;
        if (_show && (!checkType(_order,'array') || _order.length<min || _order.length>max)) return `Invalid order sent, it should look something like ['p3','p1','p2','p4'] and must be at LEAST 2 in length`;

        this.container.setVisible(_show);
        if (!_show) { this.resetPlayerDots(); return; };

        this.repositionDotsByPoints(_order);
    }

    // incoming _name can be a single player eg 'SJF', or it can be multiple players eg 'SJF and ABC'
    updateWinText(_name, _points) {
        this.phaserObjects.winText.text = `${_name} wins with ${_points}`;
    }
};