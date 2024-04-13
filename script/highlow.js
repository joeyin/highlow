class HighLow {
  // This value records the player's results
  histories = [];

  // Current balance
  balance = 100;

  // Current card
  card = 0;

  // Current bet
  bet = 0;

  // Debug
  debug = false;

  constructor(options = {}) {
    this.bet = options.bet;
    this.balance = options.balance;
    this.debug = options.debug;
  }

  // Start a new round
  start(isHigher) {
    return new Promise(function(resolve, reject) {
      if (!this.checkBalance(this.bet)) {
        return reject(new Error("You don\'t have enough balance to play the game."));
      }
      if (this.bet <= 0) {
        return reject(new Error("Invalid amount of bet."));
      }
      var self = this;
      // move out the chips, then place chips and start a new round
      this.moveoutChips().then(function() {
        self.placeChips();
        self.draw().then(function(newCard) {
          var isWin;
          // check if the round is win or lose
          if (isHigher) {
            isWin = newCard > self.card;
          } else {
            isWin = newCard < self.card;
          }
          if (isWin) {
            self.win().then(function() {
              self.card = newCard;
              self.record(true);
              resolve();
            }).catch(reject);
          } else {
            self.lose().then(function() {
              self.card = newCard;
              self.record(true);
              resolve();
            }).catch(reject);
          }
        }).catch(reject);
      }).catch(reject);
    }.bind(this));
  }

  // Poker animations (deal and flip)
  draw() {
    return new Promise(function (resolve) {
      var newCard = this.randomNumber(0, 51);
      var pokerImage = $('<img class="poker" src="./images/pokers/back.png"/>').appendTo('#frame');
      pokerImage.on('animationend', function() {
        $(this).addClass('poker-flip');
        $(this).on('animationstart', function() {
          new Audio('./sounds/carddrop2-92718.mp3').play();
          $(this).attr('src', './images/pokers/' + newCard + '.png');
          resolve(newCard);
        })
      });
    }.bind(this));
  }

  moveoutChips() {
    return new Promise(function (resolve) {
      var total = $('.chip').length;
      if (total) {
        $('.chip').each(function(index) {
          $(this).addClass('chip-moveout');
          var self = this;
          $(this).on('animationend', function() {
            $(self).remove();
            if (index + 1 === total) {
              resolve();
            }
          });
        });
        new Audio('./sounds/poker-chip-dropping-80329.mp3').play();
      } else {
        resolve();
      }
    });
  }

  placeChips() {
    for (var i = 0; i < Math.ceil(this.bet / 10); i++) {
      var chipElement = '<div class="chip" style="top:' + this.randomNumber(0, 60) + 'px;left:' + this.randomNumber(0, 60) + 'px;"></div>';
      $("#chip-tray").append(chipElement);
    }
    setTimeout(function() {
      new Audio('./sounds/poker-chip-drop-38461.mp3').play()
    }, 150);
  }

  // Win the round
  win() {
    return new Promise(function(resolve) {
      this.balance += this.bet;
      var self = this;
      $("#win").css({ display: 'flex' }).hide().fadeIn(600, function () {
        $(this).fadeOut(600, function () {
          resolve(true, self.balance);
        });
      });
    }.bind(this));
  }

  // Lose the round
  lose() {
    return new Promise(function(resolve) {
      this.balance -= this.bet;
      var self = this;
      $("#lose").css({ display: 'flex' }).hide().fadeIn(600, function () {
        $(this).fadeOut(600, function () {
          resolve(false, self.balance);
        });
      });
    }.bind(this));
  }

  // Record the bet and balance, etc
  record(isWin) {
    this.histories.push({
      timestamp: new Date().getTime(),
      result: isWin,
      balance: this.balance,
      bet: this.bet,
    })
  }

  // This method generates a random number between min and max.
  // Ref: https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
  randomNumber(min = 0, max = 10) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // Check player balance before starting a new round
  checkBalance(bet) {
    if (this.debug) {
      console.log(this);
    }
    return this.balance >= bet;
  }

  // Player updated their bet amount
  setBet(number) {
    this.bet = parseInt(number);
  }

  // Init game
  init() {
    return new Promise(function(resolve) {
      this.draw().then((newCard) => {
        this.card = newCard;
        resolve();
      });
    }.bind(this));
  }
}
