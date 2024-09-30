jQuery(document).ready(function(){

  var resultArray = null;
  var itemsOnPage = 3;
  var store = window.store;
  var searchResults = document.getElementById('search-results');
  var currLang = 'en';
  var langJSON = {};

  function populateJSON(){
    langJSON = {
      "no_result" : [
        {"en" : "No results found"},
        {"de" : "Keine Ergebnisse gefunden"},
        {"ko" : "결과 내용이 없습니다"} 
      ],
      "input_needed" : [
        {"en" : "Please give some input to start"},
        {"de" : "Bitte geben Sie eine Eingabe zu starten"},
        {"ko" : "값을 입력해 주세요"}
      ],
      "read_more" : [
        {"en" : "Read more"},
        {"de" : "Mehr"},
        {"ko" : "읽기"}
      ],
      "prev": [
        {"en": "Prev"}, 
        {"de": "Zurück"}, 
        {"ko": "이전"}
      ],
      "next": [
        {"en": "Next"}, 
        {"de": "Weiter"}, 
        {"ko": "다음"}
      ]
    };
  }

  function getJSON(string, lang){
    var stringArray = langJSON[string];
    for(var i = 0; i < stringArray.length; i++){
      var currObj = stringArray[i];
      for( var lang in currObj){
        if(lang == currLang) 
          return currObj[lang];
      }
    }
  }

  function initLang(){
    currLang = jQuery('.container-main-language-link.active').attr('id');
    populateJSON();
  }

  function paginationGoTo(){
    var pageNumber = jQuery('.pagination').pagination('getCurrentPage');
    displaySearchResultsForPage(pageNumber, itemsOnPage);
  }

  function loadPagination(itemSize){

    if(itemSize == 0){
      searchResults.innerHTML = '<div class=\"post-list-no-results\"><svg class=\"icon-wrench\"><use xlink:href=\"/assets/images/graphics/svg-symbols.svg\#wrench"></use></svg><li class="no-results">' + getJSON("no_result", currLang) + '</li></div>';
      return;
    }

    jQuery('.pagination').pagination({
      items: itemSize,
      itemsOnPage: itemsOnPage,
      prevText: getJSON("prev", currLang),
      nextText: getJSON("next", currLang),
      cssStyle: 'light-theme',
      onPageClick: function(){
        paginationGoTo();
      },
      onInit: function(){
        initSearchResults();
      }
    });
  }

  function renderResultList(array, startIdx, endIdx){
    var appendString = '';

    for (var i = startIdx; i <= endIdx; i++) {
      var item = store[array[i].ref];
      appendString += '<li class="post-list-enclosure-1pr">';
      appendString += '<div class="card-details">';
      appendString += '<div class="card-details-header">';
      appendString += '<span class="card-details-header-title">' + item.title + '</span>';
      appendString += '<span class="card-details-header-category">' + item.category + '</span>';
      appendString += '<span class="card-details-header-date">' + item.date + '</span>';
      appendString += '</div>';
      appendString += '<div class="card-details-main">';
      if(item.content.length <= 149) appendString += item.content + '</div>';
      else appendString += item.content.substring(0, 300) + '...</div>';
      appendString += '<div class="card-details-readmore">' + '<a href="' + item.url + '">' + getJSON("read_more", currLang) + ' > </a></div>';
      appendString += '</div>';
      appendString += '</li>';
    }

    return appendString;
  }

  function displaySearchResultsForPage(pageNumber, itemsOnPage){

    searchResults.innerHTML = '';

    var startIndex = itemsOnPage * (pageNumber - 1);
    var endIndex = startIndex + (itemsOnPage - 1);
    var totalPageCount = $('.pagination').pagination('getPagesCount');

    if( pageNumber == totalPageCount && endIndex > (resultArray.length - 1))
      var endIndex = resultArray.length -1;

    searchResults.innerHTML = renderResultList(resultArray, startIndex, endIndex);
  }

  function initSearchResults() {

    if(resultArray === null){
      if(searchResults != null)
        searchResults.innerHTML = '<div class=\"post-list-input-required\"><svg class=\"icon-warning\"><use xlink:href=\"/assets/images/graphics/svg-symbols.svg\#warning"></use></svg><li class="ask-input">' + getJSON("input_needed", currLang) + '<blink>_</blink> </li></div>';
      return;
    }
    
    if(resultArray.length < itemsOnPage - 1)
      searchResults.innerHTML = renderResultList(resultArray, 0, resultArray.length - 1);
    else
      searchResults.innerHTML = renderResultList(resultArray, 0, itemsOnPage - 1);

  }

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');

      if (pair[0] === variable)
        return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
    }
  }

  var searchTerm = getQueryVariable('query');
  initLang();

  if (searchTerm) {
    document.getElementById('search-box').setAttribute("value", searchTerm);

    var idx = lunr(function () {
      this.field('id');
      this.field('title', { boost: 10 });
      this.field('author');
      this.field('category');
      this.field('content');
    });

    for (var key in store) {
      idx.add({
        'id': key,
        'title': store[key].title,
        'author': store[key].author,
        'category': store[key].category,
        'content': store[key].content
      });
    }

    var resultArray = idx.search(searchTerm);
    loadPagination(resultArray.length);
  }else initSearchResults();

});
