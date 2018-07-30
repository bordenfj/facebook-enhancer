(function() {
  var recentPathName = location.pathname;

  window.addEventListener('message', function (event) {
    var currentPathName = event.currentTarget.location.pathname;

    if(location.pathname === '/' && currentPathName !== recentPathName) {
      recentPathName = currentPathName;

      getNewsFeedTypeAndSetIt();
    } else {
      recentPathName = currentPathName;
    }
  });

  var sortOptionsElementClicked = false;
  var manualTriggerCompleted = false;

  function hideContextMenu() {
    var styleElement = document.getElementById('facebook-enhancer-second');
    
    if(styleElement !== null) {
      document.getElementsByTagName('head')[0].removeChild(styleElement);
    }

    styleElement = document.createElement('style');

    styleElement.id   = 'facebook-enhancer-second';
    styleElement.type = 'text/css';
    styleElement.innerHTML = '.uiContextualLayerBelowRight { visibility: hidden; }';

    appendElementToHead(styleElement);

    return true;
  }

  function showContextMenu() {
    var styleElement = document.getElementById('facebook-enhancer-second');
        
    if(styleElement !== null) {
      document.getElementsByTagName('head')[0].removeChild(styleElement);
    }

    styleElement = document.createElement('style');

    styleElement.id   = 'facebook-enhancer-second';
    styleElement.type = 'text/css';
    styleElement.innerHTML = '.uiContextualLayerBelowRight { visibility: visible; }';

    appendElementToHead(styleElement);
  }

  function selectNewsFeedType(newsFeedType) {
    if(!sortOptionsElementClicked) {
      var sortOptionsElement = document.querySelector('[aria-label="Sort options"]');

      if(sortOptionsElement !== null) {
        sortOptionsElement.click();
        sortOptionsElementClicked = true;
      }
    } else if(!manualTriggerCompleted) {
      switch(newsFeedType) {
        case 'top-stories':
          var targetLabel = 'Top Stories';
          break;
        case 'most-recent':
          var targetLabel = 'Most recent';
      }

      var targetNewsFeedElement = document.querySelector('[aria-label="' + targetLabel + '"] a');
      
      if(targetNewsFeedElement !== null) {
        var targetNewsFeedElementChecked = targetNewsFeedElement.getAttribute('aria-checked');

        if(targetNewsFeedElementChecked !== 'true') {
          manualTriggerCompleted = true;
          targetNewsFeedElement.click();
        } else if(targetNewsFeedElementChecked === 'true') {
          manualTriggerCompleted = true;
          document.querySelector('[aria-label="Sort options"]').click();
        }

        setTimeout(function(){ showContextMenu(); }, 1000);
      }
    }
  }

  function prepareStyleElement() {
    var styleElement = document.createElement('style');

    styleElement.id   = 'facebook-enhancer';
    styleElement.type = 'text/css';

    return styleElement;
  };

  function appendElementToHead(element) {
    document.getElementsByTagName('head')[0].appendChild(element);
  };

  function toggleNewsFeed(newsFeedType) {
    var styleElement = document.getElementById('facebook-enhancer');

    if(styleElement !== null) {
      document.getElementsByTagName('head')[0].removeChild(styleElement);
    }

    styleElement = prepareStyleElement();

    if(newsFeedType === 'disabled') {
      styleElement.innerHTML = '.newsFeedComposer #contentArea {visibility: hidden;}';
    } else {
      styleElement.innerHTML = '.newsFeedComposer #contentArea {visibility: visible;}';
    }

    appendElementToHead(styleElement);
  };

  function runLoop(newsFeedType) {
    sortOptionsElementClicked = false;
    manualTriggerCompleted    = false;

    if(hideContextMenu()) {
      var runInLoop = setInterval(function() {  
        selectNewsFeedType(newsFeedType);

        if(manualTriggerCompleted) {
          clearInterval(runInLoop);
        }

      }, 500);
    }
  }

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      if(key === 'newsFeedType' && location.pathname === '/') {
        var newsFeedType = changes[key].newValue;
        toggleNewsFeed(newsFeedType);

        if(newsFeedType !== 'disabled') {
          runLoop(newsFeedType);
        }
      }
    }
  });

  function getNewsFeedTypeAndSetIt() {
    chrome.storage.sync.get(['newsFeedType'], function(result) { 
      if(result.newsFeedType === undefined) {
        chrome.storage.sync.set({newsFeedType: 'top-stories'}, function() {});
      } else if(result.newsFeedType === 'disabled') {
        toggleNewsFeed(result.newsFeedType); 
      } else {
        runLoop(result.newsFeedType);
      }
    });
  }

  if(location.pathname === '/') {
    getNewsFeedTypeAndSetIt();
  }
})();