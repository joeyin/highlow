function togglePlayButtons(playable) {
  $("#higher, #lower").attr("disabled", playable ? false : true);
}

function updateBalance(balance) {
  // If support property
  if (window.getComputedStyle(document.documentElement).getPropertyValue('--support')) {
    // using css counter
    $("#balance").css({
      'transition': '--balance 1s',
      'counter-reset': 'balance var(--balance)',
      '--balance': balance,
    });
  } else {
    $("#balance").text(parseInt(balance).toLocaleString());
  }
}

function updateBetValue(value) {
  $("#bet").val(value).trigger("change");
}

function initDigitalPanel() {
  window.CSS.registerProperty({
    name: "--support",
    syntax: '<color>',
    initialValue: '#000',
    inherits: false,
  });
  window.CSS.registerProperty({
    name: "--balance",
    syntax: '<integer>',
    initialValue: 0,
    inherits: false,
  });
}

$(document).ready(function () {
  initDigitalPanel();

  /* Init High-Low */
  const hl = new HighLow({
    bet: 10,
    balance: 100,
    debug: false
  });

  $('#start').click(function() {
    $(this).hide();
    hl.init().then(function() {
      togglePlayButtons(true);
      updateBalance(hl.balance);
    }).catch(function(err) {
      alert(err)
    });
  });

  /* Update amount of betting */
  var inputBet = $("#bet");
  $("#plus").click(function() {
    updateBetValue(parseInt(inputBet.val()) + 10);
  });
  $("#minus").click(function() {
    if (inputBet.val() > 1) {
      updateBetValue(parseInt(inputBet.val()) - 10);
    }
  });
  $("#allin").click(function() {
    updateBetValue(hl.balance);
  });
  inputBet.on("change", function() {
    hl.setBet(inputBet.val())
  });

  /* Start a new round */
  $("#higher, #lower").click(function() {
    var isHigher = $(this).attr('id') === 'higher';
    togglePlayButtons(false);
    hl.start(isHigher)
      .then(function() {
        updateBalance(hl.balance);
      }).catch(function(err) {
        alert(err);
      }).finally(function() {
        togglePlayButtons(true);
      });
  });
});
