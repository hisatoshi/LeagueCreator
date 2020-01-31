var express = require("express");
var router = express.Router();
var fs = require("fs");
/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

const players = [
  "蜂屋大樹",
  "田代真悟",
  "高橋大",
  "稲葉大貴",
  "宮本佳菜子",
  "山添久稔"
];

let state = {};
router.get("/players", function(req, res) {
  res.json({
    players: players
  });
});

router.post("/repair", function(req, res) {
  if (Object.keys(state).length === 0) {
    res.json({ success: false });
    return;
  }
  for (var i = 0; i < state.matchList.length; i++) {
    const match = state.matchList[i];
    if (
      (match.player1 === req.body.player1 &&
        match.player2 === req.body.player2) ||
      (match.player1 === req.body.player2 && match.player2 === req.body.player1)
    ) {
      match._result = req.body._result;
      res.json({ success: true });
      return;
    }
  }
  res.json({ success: true });
  return;
});

router.get("/repair", function(req, res) {
  res.json({ state: state });
});

router.post("/result", function(req, res) {
  state = req.body;
  fs.writeFile(
    "results/result" + req.body.matchIndex + ".json",
    JSON.stringify(req.body),
    function() {
      res.json({ result: "success" });
    }
  );
});

router.get("/result", function(req, res) {
  file_num = (players.length * (players.length - 1)) / 2;
  fs.readFile("results/result" + file_num + ".json", "utf-8", function(
    err,
    _data
  ) {
    let _result = {};
    for (player of players) {
      _result[player] = {
        playerName: player,
        winCount: 0,
        point: 0,
        win: []
      };
    }
    const data = JSON.parse(_data);
    for (match of data.matchList) {
      _result[getWinner(match)].winCount++;
      _result[match.player1].point =
        _result[match.player1].point + parseInt(match._result[0]);
      _result[match.player2].point =
        _result[match.player2].point + parseInt(match._result[1]);
      if (parseInt(match._result[0]) < parseInt(match._result[1])) {
        _result[match.player2].win.push(match.player1);
      } else {
        _result[match.player1].win.push(match.player2);
      }
    }
    let result = [];
    Object.keys(_result).forEach(key => {
      result.push(_result[key]);
    });
    result.sort(comp);
    console.log(result);
    res.json({ result: result });
  });
});
module.exports = router;

function comp(a, b) {
  if (parseInt(a.winCount) < parseInt(b.winCount)) return 1;
  if (parseInt(b.winCount) < parseInt(a.winCount)) return -1;
  if (parseInt(a.point) < parseInt(b.point)) return 1;
  if (parseInt(b.point) < parseInt(a.point)) return -1;
  if (a.win.contains(b.playerName)) return 1;
}

function getWinner(match) {
  return parseInt(match._result[0]) < parseInt(match._result[1])
    ? match.player2
    : match.player1;
}
