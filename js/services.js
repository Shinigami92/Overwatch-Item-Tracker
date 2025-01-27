OWI.factory("StorageService", function() {
  var service = {
    data: {},
    settings: {},
    defaultSettings: {
      particles: true,
      langKey: 'en_US',
      showPreviews: true,
      hdVideos: false,
      currentTheme: 'standard',
      audioVolume: 0.5,
      countIcons: true
    },
    getData: function() {
      return service.data;
    },
    getSetting: function(key) {
      return (typeof service.settings[key] !== 'undefined' ? service.settings[key] : (service.defaultSettings[key] ? service.defaultSettings[key] : false));
    },
    setSetting: function(key, value) {
      service.settings[key] = value;
      service.persist(true);
    },
    setData: function(data) {
      service.data = data;
      service.persist();
    },
    persist: function(settings) {
      localStorage.setItem(settings ? 'settings' : 'data', angular.toJson(service[settings ? 'settings' : 'data']));
    },
    init: function() {
      console.info("Init StorageService");
      var storedData = localStorage.getItem('data');
      if (storedData) {
        service.data = angular.fromJson(storedData);
      }
      var storedSettings = localStorage.getItem('settings');
      if (!storedSettings) {
        service.settings = service.defaultSettings;
      } else {
        service.settings = Object.assign({}, service.defaultSettings, angular.fromJson(storedSettings));
      }
    }
  };
  service.init();
  return service;
});

OWI.factory("DataService", ["$http", "$q", "StorageService", function($http, $q, StorageService) {
  function initialize(data) {
    console.info("Initializing");
    var storedData = StorageService.getData() || {};
    var out = {
      checked: {}
    };
    for (var hero in data.heroes) {
      out.checked[hero] = {"skins":{},"emotes":{},"intros":{},"sprays":{},"voicelines":{},"poses":{},"icons":{}};
    }

    // Use itemnames as translation key
    Object.keys(data.events).forEach(function(event) {
      var items = data.events[event].items;
      Object.keys(items).forEach(function(type) {
        items[type].forEach(function(item) {
          var langKey = event + '.' + type + '.' + item.id;
          item.name = langKey;
          //item.langKey = langKey; //TODO: later use this?
        });
      });
    });
    Object.keys(data.heroes).forEach(function(hero) {
      var items = data.heroes[hero].items;
      Object.keys(items).forEach(function(type) {
        items[type].forEach(function(item) {
          var langKey = hero + '.' + type + '.' + item.id;
          item.name = langKey;
          //item.langKey = langKey; //TODO: later use this?
        });
      });
    });

    Object.assign(out.checked, storedData);
    Object.assign(service, out, data);
    setTimeout(function() {
      service.initialized = true;
    }, 0);
  }

  var service = {
    checked: {},
    prices: {},
    events: {},
    heroes: {},
    initialized: false,
    isItemChecked: function(who, type, id) {
      return (service.checked[who] ? (service.checked[who][type] ? service.checked[who][type][id] : false) : false);
    },
    waitForInitialization: function() {
      return $q(function(resolve) {
        function waitForInitialize() {
          if (service.initialized) {
            resolve(service);
          } else {
            setTimeout(waitForInitialize, 30);
          }
        }
        waitForInitialize();
      });
    },
    init: function() {
      console.info("Fetching Data");
      $http.get('./data/master.json').then(function(resp) {
        if (resp.status == 200) {
          initialize(resp.data);
        } else {
          console.error("Failed loading master.json ???", resp.status, resp.error);
        }
      }, function(resp) {
        console.error("Failed loading master.json ???", resp.status, resp.error);
      });
    }
  };
  service.init();
  return service;
}]);

OWI.factory('CostAndTotalService', ["DataService", "StorageService", function(DataService, StorageService) {
  var TYPES = {
    skinsEpic: 'skins',
    skinsLegendary: 'skins'
  };

  var isValidItem = function(item, event) {
    var hasEvent = item.event || event;
    return !item.achievement && item.quality && (!hasEvent || (hasEvent && hasEvent !== 'SUMMER_GAMES_2016'));
  };
  
  var countIcons = StorageService.getSetting('countIcons');

  var service = {
    totals: {},
    heroes: {},
    events: {},
    init: function() {
      DataService.waitForInitialization().then(function() {
        console.info("Calculating totals and costs");
        service.recalculate();
      });
    },
    recalculate: function() {
      console.log("Calculating costs");
      service.heroes = {};
      service.events = {};
      var d = Object.assign({}, DataService.heroes, DataService.events);
      for (var heroOrEvent in d) {
        var isEvent = DataService.events[heroOrEvent];
        var what = d[heroOrEvent];
        var TYPE = isEvent ? 'events' : 'heroes';

        service[TYPE][what.id] = { events: {}, groups: {}, cost: { selected: 0, remaining: 0, total: 0, prev: 0 }, totals: { overall: { selected: 0, total: 0, percentage: 0 } } };
        var items = what.items;
        for (var type in items) {
          if (!service[TYPE][what.id].totals[type]) service[TYPE][what.id].totals[type] = { selected: 0, total: 0 };
          for (var item of items[type]) {
            if (item.standardItem) continue;
            if (!isEvent) {
              if (item.event && !service[TYPE][what.id].events[item.event]) service[TYPE][what.id].events[item.event] = true;
              if (item.group && !service[TYPE][what.id].groups[item.group]) service[TYPE][what.id].groups[item.group] = true;
            }
            var isSelected = DataService.checked[item.hero || what.id][TYPES[type] || type][item.id];
            service[TYPE][what.id].totals.overall.total++;
            service[TYPE][what.id].totals[type].total++;
            if (isSelected) {
              service[TYPE][what.id].totals.overall.selected++;
              service[TYPE][what.id].totals[type].selected++;
            }
            if (type == 'icons') {
              if (!countIcons) {
                service[TYPE][what.id].totals.overall.total--;
                if (isSelected) service[TYPE][what.id].totals.overall.selected--;
              }
              continue;
            }
            if (isValidItem(item)) {
              var price = DataService.prices[item.quality] * ((item.event || isEvent) ? 3 : 1);
              service[TYPE][what.id].cost.total += price;
              if (isSelected) {
                service[TYPE][what.id].cost.selected += price;
              } else {
                service[TYPE][what.id].cost.remaining += price;
              }
            }
          }
        }
        service[TYPE][what.id].totals.overall.percentage = ((service[TYPE][what.id].totals.overall.selected / service[TYPE][what.id].totals.overall.total) * 100);
      }
    },
    updateItem: function(item, type, hero, event) {
      var isSelected = DataService.checked[item.hero || hero][TYPES[type] || type][item.id];
      event = item.event || event;
      var eventType = type == 'skins' ? (item.quality == 'epic' ? 'skinsEpic' : 'skinsLegendary') : type;
      var val = isSelected ? 1 : -1;
      var price = DataService.prices[item.quality] * (event ? 3 : 1);
      var isValid = isValidItem(item, event);
      service.heroes[hero].cost.prev = service.heroes[hero].cost.remaining;
      service.heroes[hero].totals[type].selected += val;
      if (type != 'icons' || (type == 'icons' && countIcons)) {
        service.heroes[hero].totals.overall.selected += val;
      }
      if (type != 'icons' && isValid) {
        if (isSelected) {
          service.heroes[hero].cost.selected += price;
          service.heroes[hero].cost.remaining -= price;
        } else {
          service.heroes[hero].cost.selected -= price;
          service.heroes[hero].cost.remaining += price;
        }
      }
      if (event && (type !== 'icons' || type == 'icons' && countIcons)) {
        service.events[event].totals.overall.selected += val;
        service.events[event].totals[eventType].selected += val;
        service.events[event].cost.prev = service.events[event].cost.remaining;
        if (type !== 'icons' && isValid) {
          if (isSelected) {
            service.events[event].cost.remaining -= price;
            service.events[event].cost.selected += price;
          } else {
            service.events[event].cost.remaining += price;
            service.events[event].cost.selected -= price;
          }
        }
        service.events[event].totals.overall.percentage = ((service.events[event].totals.overall.selected / service.events[event].totals.overall.total) * 100);
      }
      service.heroes[hero].totals.overall.percentage = ((service.heroes[hero].totals.overall.selected / service.heroes[hero].totals.overall.total) * 100);
      return service.heroes[hero];
    },
    calculateFilteredHeroes: function(items, oldCost, hero) {
      var out = {
        cost: { total: 0, selected: 0, remaining: 0, prev: oldCost },
        totals: { overall: { selected: 0, total: 0, percentage: 0 } }
      };
      for (var type in items) {
        if (!out.totals[type]) out.totals[type] = { total: 0, selected: 0 };
        for (var item of items[type]) {
          if (item.standardItem) continue;
          var isSelected = DataService.checked[item.hero || hero][type][item.id];
          out.totals.overall.total++;
          out.totals[type].total++;
          if (isSelected) {
            out.totals.overall.selected++;
            out.totals[type].selected++;
          }
          if (type == 'icons') continue;
          if (isValidItem(item)) {
            var price = DataService.prices[item.quality] * (item.event ? 3 : 1);
            out.cost.total += price;
            if (isSelected) {
              out.cost.selected += price;
            } else {
              out.cost.remaining += price;
            }
          }
        }
      }
      out.totals.overall.percentage = ((out.totals.overall.selected / out.totals.overall.total) * 100);
      return out;
    }
  };
  service.init();
  return service;
}]);

OWI.factory("ImageLoader", ["$q", "$document", function($q, $document) {
  var service = {
    processing: false,
    requests: 0,
    images: [],
    loadedImages: {},
    loadImage: function(url, noQueue) {
      var deferred = $q.defer();
      if (service.loadedImages[url]) {
        setTimeout(function() {
          deferred.resolve(url);
        }, 0);
        return deferred.promise;
      } else {
        if (noQueue) {
          service.fetchImage(url, deferred, true)();
        } else {
          service.images.push(service.fetchImage(url, deferred));
          if (!service.processing) {
            service.processQueue();
          }
        }
      }
      return deferred.promise;
    },
    fetchImage: function(url, promise, ignore) {
      return function() {
        var img = $document[0].createElement('img');
        img.onload = function() {
          if (!ignore) {
            service.requests--;
          }
          service.loadedImages[url] = true;
          promise.resolve(this.src);
        };
        img.onerror = function() {
          if (!ignore) {
            service.requests--;
          }
          promise.reject();
        };
        img.src = url;
      };
    },
    processQueue: function() {
      service.processing = true;
      if (service.requests == 4) {
        setTimeout(function() {
          service.processQueue();
        }, 75);
        return;
      }

      var nextImage = service.images.shift();
      if (nextImage) {
        service.requests++;
        nextImage();
        setTimeout(function() {
          service.processQueue();
        }, 1);
      } else {
        service.processing = false;
      }
    }
  };
  return service;
}]);

OWI.factory('CompatibilityService', ["StorageService", function(StorageService) {
  var showPreviews = StorageService.getSetting('showPreviews');
  var service = {
    noSupportMsg: false,
    supportedTypes:{
      intros: true,
      emotes: true,
      voicelines: true
    },
    supportsAudio: true,
    supportsVideo: true,
    canPlayType: function(type) {
      if (!showPreviews) return 'false';
      return service.supportedTypes[type] || true;
    }
  };

  var noSupport = [];
  var messages = {
    WebM: 'view previews of emotes and intros',
    Ogg: 'listen to voicelines'
  };
  var v = document.createElement('video');
  var a = document.createElement('audio');
  if (!v.canPlayType || ("" == v.canPlayType('video/webm; codecs="vp8, opus"') && "" == v.canPlayType('video/webm; codecs="vp9, opus"'))) {
    service.supportsVideo = false;
    service.supportedTypes['intros'] = 'false';
    service.supportedTypes['emotes'] = 'false';
    noSupport.push('WebM');
  }
  if (!a.canPlayType || "" == a.canPlayType('audio/ogg; codecs="vorbis"')) {
    service.supportsAudio = false;
    service.supportedTypes['voicelines'] = 'false';
    noSupport.push('Ogg');
  }
  if (noSupport.length) {
    service.noSupportMsg = "You're browser doesn't seem to support " + noSupport.join(' and ') + ".\nThis means you won't be able to " + noSupport.map(function(n) {
      return messages[n];
    }).join(' or ') + ".";
  }

  return service;
}]);
