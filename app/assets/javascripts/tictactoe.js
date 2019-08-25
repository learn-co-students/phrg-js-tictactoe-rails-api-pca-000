var WIN = [
  [0, 1, 2], [0, 2, 1], [1, 2, 0], [1, 0, 2], [2, 1, 0], [2, 0, 1],
  [3, 4, 5], [3, 5, 4], [4, 3, 5], [4, 5, 3], [5, 4, 3], [5, 3, 4],
  [6, 7, 8], [6, 8, 7], [7, 6, 8], [7, 8, 6], [8, 6, 7], [8, 7, 6],
  [0, 3, 6], [0, 6, 3], [6, 0, 3], [6, 3, 0], [3, 0, 6], [3, 6, 0],
  [1, 4, 7], [1, 7, 4], [4, 7, 1], [4, 1, 7], [7, 4, 1], [7, 1, 4],
  [2, 5, 8], [2, 8, 5], [5, 2, 8], [5, 8, 2], [8, 2, 5], [8, 5, 2],
  [0, 4, 8], [0, 8, 4], [4, 0, 8], [4, 8, 0], [8, 0, 4], [8, 4, 0],
  [2, 4, 6], [2, 6, 4], [4, 2, 6], [4, 6, 2], [6, 4, 2], [6, 2, 4]
]
var turn = 0;
var gameCounter;

$(document).ready(function() {
  attachListeners();
});

function player() {
  return turn % 2 ? "O" : "X"
}

function updateState(el) {
  var state = player();
  el.append(state)
}

function setMessage(str) {
  $("#message").text(str);
}

function checkWinner() {
  var result = false
  var setX = []
  var setO = []

  for (let i=0; i<9; i++) {
    if ($('td')[i].innerHTML === "X") {
      setX.push(i)
    } else if ($('td')[i].innerHTML === "O") {
      setO.push(i)
    }
  }

  for (let i=0; i<WIN.length; i++) {
    if (JSON.stringify(setX) === JSON.stringify(WIN[i])) {
      setMessage("Player X Won!");
      result = true
    } else if (JSON.stringify(setO) === JSON.stringify(WIN[i])) {
      result = true
      setMessage("Player O Won!");
    }
  }
  return result
}

function doTurn(el) {
  updateState(el);
  turn ++;
  if (checkWinner()) {
    saveGame();
    clearGame();
  } else if (turn === 9) {
    if (!checkWinner()) {
      setMessage("Tie game.");
    }
    saveGame();
    clearGame();
  }
}

/*------------------------------------NOT DONE-------------------------------------*/
function saveGame() {
  var status = []
  var pushData;
  for (let i=0; i<9; i++) {
    status.push($('td')[i].innerHTML)
  }
  pushData = {state: status}
  if (gameCounter) {
    $.ajax({
      type: "PATCH",
      url: `/games/${gameCounter}`,
      data: pushData
    });
  } else {
    $.post('/games', pushData, function(data) {
          gameCounter = data.data.id;
          $("#games").append('<button class="js-game" data-id="' + data.data.id + '">Game ' + data.data.id + '</button>');
        });
      }
    }

function previousGame() {
  $.get("/games", function(data) {
    var prevGames = data["data"]
    var availableGames = []

    $('.js-game').each(function(index, el) {
      var id = $(el).attr("data-id");
      availableGames.push((id));
    });
    prevGames.forEach(function(i) {
      if (!availableGames.includes(i.id)) {
        $("#games").append('<button class="js-game" data-id="' + i.id + '">Game ' + i.id + '</button>');
        availableGames.push(i.id);
      }
    });
  });
}

function restorePreviousGame(el) {
  var id = $(el).data("id");
  gameCounter = id
  $.get(`/games/${id}`, function(data) {
    var status = data.data.attributes["state"]
    for (let i=0; i<9; i++) {
      $('td')[i].innerHTML = status[i]
    }
    var moves = status.filter(i => {return i !== ""});
    turn = moves.length
  });
}

function clearGame() {
  $('td').empty();
  turn = 0;
  gameCounter = 0;
  setMessage("")
}

function attachListeners() {
  $('#save').on('click', () => saveGame());
  $('#previous').on('click', () => previousGame());
  $('#clear').on('click', () => clearGame());

  $('td').on('click', function(event) {
    if (!checkWinner() && !$.text(this)) {
      doTurn(this);
    }
  });

  $('#games').on('click', '.js-game', function() {
    restorePreviousGame(this);
  });
}

