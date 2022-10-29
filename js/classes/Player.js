let Player = class {
    constructor(_playerNumber=null) {
        if (!_playerNumber) {
            console.error(`Invalid player number!`);
            return false;
        };

        let gV = vars.game;
        this.player = _playerNumber;
        let playerNames = gV.playerNames;
        this.name = playerNames[_playerNumber-1];
        
        let playerColours = gV.playerColours;
        this.colour = playerColours[_playerNumber-1]; // this is used when creating the ScoreCard

        this.score=0;

    }

    addScore(_points) {
        let currentScore = this.score;
        let countTo = this.score+=_points;
        let scoreCard = vars.game.scoreCard;
        let playerKey = `p${this.player}`;
        // update the ui
        scene.tweens.addCounter({
            from: currentScore, to: countTo, useFrames: true, duration: 60,
            onUpdate: (_v)=> {
                let value = _v.getValue()|0;
                scoreCard.updatePlayersScore(playerKey, value);
            }
        });
    }
}