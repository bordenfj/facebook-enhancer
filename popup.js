(function() {  
  chrome.storage.sync.get(['newsFeedType'], function(result) { 
    if(result.newsFeedType === undefined) {
      document.querySelector('input[value="top-stories"]').checked = true;
    } else {
      var newsFeedElement = document.querySelector('input[value="' + result.newsFeedType + '"]');

      newsFeedElement.checked = true; 
    }
  });

  var newsFeedElements = document.querySelectorAll('input[name="news-feed"]');

  for(var i = 0; i < newsFeedElements.length; i++) {
    newsFeedElements[i].addEventListener('change', function(event) {
      var selectedNewsFeedElement = document.querySelector('input[name="news-feed"]:checked');

      setNewsFeedType(selectedNewsFeedElement.value);
    });
  }

  var setNewsFeedType = function(newsFeedType) {
    chrome.storage.sync.set({newsFeedType: newsFeedType}, function() {});
  }
})();