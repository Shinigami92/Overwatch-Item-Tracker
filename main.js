var OWI = angular.module('OWI', [])

OWI.config(['$compileProvider', function($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}])

OWI.controller('MainCtrl', ["$scope", function($scope) {
  var vm = this;

  this.preview = false;

  // Load any saved data from localstorage
  var onStartup = function() {
    vm.checked = {
      legendary: {},
      epic: {},
      emotes: {},
      intros: {},
      sprays: {},
      voicelines: {},
      victoryposes: {},
      icons: {}
    }

    var data = localStorage.getItem('data')
    if (data) {
      vm.checked = JSON.parse(data)
      $scope.$digest()
    }
  }

  this.reset = function() {
    console.log("reset")
    localStorage.removeItem('data')
    onStartup()
  }

  // Update localstorage on new data
  this.onSelect = function() {
    localStorage.setItem('data', JSON.stringify(this.checked))
  }

  var showTimeout = undefined;
  var hideTimeout = undefined;
  this.showPreview = function(what) {
    if (showTimeout) return
    clearTimeout(hideTimeout)
    showTimeout = setTimeout(function () {
      vm.preview = what
      $scope.$digest()
    }, vm.preview ? 100 : 650);
  }

  this.hidePreview = function(what) {
    clearTimeout(showTimeout);
    showTimeout = undefined;
    hideTimeout = setTimeout(function () {
      vm.preview = false;
      $scope.$digest()
    }, 150);
  }

  var heroes = [
    "Ana", "Bastion", "D.Va", "Genji", "Hanzo",
    "Junkrat", "Lucio", "McCree", "Mei", "Mercy",
    "Pharah", "Reaper", "Reinhardt", "Roadhog",
    "Soldier: 76", "Symetra", "Torbjorn", "Tracer",
    "Widowmaker", "Winston", "Zarya", "Zenyatta"
  ]
  this.items = {
    skins: {
      legendary: [{
        name: "Junkenstein Junkrat",
        img: "./img/junkrat.jpg"
      }, {
        name: "Monster Roadhog",
        img: "./img/roadhog.jpg"
      }, {
        name: "Witch Mercy",
        img: "./img/mercy.jpg"
      }, {
        name: "Pumpkin Reaper",
        img: "./img/reaper.jpg"
      }],
      epic: [
        "Ghoul Ana", "Tombstone Bastion", "Demon Hanzo",
        "Possessed Pharah", "Coldhardt Reinhart", "Immortal Soldier: 76",
        "Vampire Symmetra", "Skullyata Zenyatta"
      ]
    },
    intros: [
      "Pumpkin Carving Genji", "Ice Scream Mei", "Eternal Rest Reaper"
    ],
    emotes: [
      "Candy Ana", "Pumpkin Smashing Reinhardt", "Shadow Puppets Winston"
    ],
    voicelines: heroes,
    victoryposes: heroes,
    "sprays": [{
      "name": "Ana",
      "img": "./img/halloween2016/sprays/ana.jpg"
    }, {
      "name": "Bastion",
      "img": "./img/halloween2016/sprays/bastion.jpg"
    }, {
      "name": "D.Va",
      "img": "./img/halloween2016/sprays/dva.jpg"
    }, {
      "name": "Genji",
      "img": "./img/halloween2016/sprays/genji.jpg"
    }, {
      "name": "Hanzo",
      "img": "./img/halloween2016/sprays/hanzo.jpg"
    }, {
      "name": "Junkrat",
      "img": "./img/halloween2016/sprays/junkrat.jpg"
    }, {
      "name": "Lucio",
      "img": "./img/halloween2016/sprays/lucio.jpg"
    }, {
      "name": "McCree",
      "img": "./img/halloween2016/sprays/mccree.jpg"
    }, {
      "name": "Mei",
      "img": "./img/halloween2016/sprays/mei.jpg"
    }, {
      "name": "Mercy",
      "img": "./img/halloween2016/sprays/mercy.jpg"
    }, {
      "name": "Pharah",
      "img": "./img/halloween2016/sprays/pharah.jpg"
    }, {
      "name": "Reaper",
      "img": "./img/halloween2016/sprays/reaper.jpg"
    }, {
      "name": "Reinhardt",
      "img": "./img/halloween2016/sprays/reinhardt.jpg"
    }, {
      "name": "Roadhog",
      "img": "./img/halloween2016/sprays/roadhog.jpg"
    }, {
      "name": "Soldier: 76",
      "img": "./img/halloween2016/sprays/soldier76.jpg"
    }, {
      "name": "Symmetra",
      "img": "./img/halloween2016/sprays/symmetra.jpg"
    }, {
      "name": "Torbjorn",
      "img": "./img/halloween2016/sprays/torbjorn.jpg"
    }, {
      "name": "Tracer",
      "img": "./img/halloween2016/sprays/tracer.jpg"
    }, {
      "name": "Widowmaker",
      "img": "./img/halloween2016/sprays/widowmaker.jpg"
    }, {
      "name": "Winston",
      "img": "./img/halloween2016/sprays/winston.jpg"
    }, {
      "name": "Zarya",
      "img": "./img/halloween2016/sprays/zarya.jpg"
    }, {
      "name": "Zenyatta",
      "img": "./img/halloween2016/sprays/zenyatta.jpg"
    }, {
      "name": "...Never Die",
      "img": "./img/halloween2016/sprays/neverdie.jpg"
    }, {
      "name": "Bats",
      "img": "./img/halloween2016/sprays/bats.jpg"
    }, {
      "name": "Boo!",
      "img": "./img/halloween2016/sprays/boo.jpg"
    }, {
      "name": "Boop!",
      "img": "./img/halloween2016/sprays/boop.jpg"
    }, {
      "name": "Candyball",
      "img": "./img/halloween2016/sprays/candyball.jpg"
    }, {
      "name": "Fangs",
      "img": "./img/halloween2016/sprays/fangs.jpg"
    }, {
      "name": "Gummy Hog",
      "img": "./img/halloween2016/sprays/gummyhog.jpg"
    }, {
      "name": "Halloween Terror",
      "img": "./img/halloween2016/sprays/halloweenterror.jpg"
    }, {
      "name": "Pumpkins",
      "img": "./img/halloween2016/sprays/pumpkins.jpg"
    }, {
      "name": "Witch's Brew",
      "img": "./img/halloween2016/sprays/witchsbrew.jpg"
    }],
    icons: [
      "Halloween Terror 2016", "The Doctor", "The Monster",
      "The Reaper", "The Witch", "...Never Die", "Candle",
      "Bewitching", "Ghostymari", "Eyeball", "Calavera",
      "Spider", "Witch's Brew", "Vampachimari", "Superstition",
      "Witch's Hat", "Tombstone", "The Wolf"
    ]
  }

  // Defer the starup so the initial digest finishes
  setTimeout(function () {
    onStartup()
  }, 0);
}])
