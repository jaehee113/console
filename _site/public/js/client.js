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

jQuery(document).ready(function(){
  svg4everybody();
  $(".icon-hamburger").on('click', function(event){
    $(".site-navigation").toggleClass('active');
    if($(".container-search-main").hasClass('active'))
      $(".container-search-main").toggleClass('active');
  });

  $(".icon-cross").on('click', function(event){
    $(".site-navigation").toggleClass('active');
  });

  $(".icon-search").on('click', function(event){
    $(".container-search-main").toggleClass('active');
    if($(".site-navigation").hasClass('active'))
      $(".site-navigation").toggleClass('active');
  });

  $('.anchor').click(function(e){
    e.preventDefault();
    setTimeout(function(){
      $('body,html').animate({scrollTop:$('#top').offset().top},500);
    }, 100);
  });

});

/**
 * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 0.7.2
 * Copyright (C) 2016 Oliver Nightingale
 * @license MIT
 */
!function(){var t=function(e){var n=new t.Index;return n.pipeline.add(t.trimmer,t.stopWordFilter,t.stemmer),e&&e.call(n,n),n};t.version="0.7.2",t.utils={},t.utils.warn=function(t){return function(e){t.console&&console.warn&&console.warn(e)}}(this),t.utils.asString=function(t){return void 0===t||null===t?"":t.toString()},t.EventEmitter=function(){this.events={}},t.EventEmitter.prototype.addListener=function(){var t=Array.prototype.slice.call(arguments),e=t.pop(),n=t;if("function"!=typeof e)throw new TypeError("last argument must be a function");n.forEach(function(t){this.hasHandler(t)||(this.events[t]=[]),this.events[t].push(e)},this)},t.EventEmitter.prototype.removeListener=function(t,e){if(this.hasHandler(t)){var n=this.events[t].indexOf(e);this.events[t].splice(n,1),this.events[t].length||delete this.events[t]}},t.EventEmitter.prototype.emit=function(t){if(this.hasHandler(t)){var e=Array.prototype.slice.call(arguments,1);this.events[t].forEach(function(t){t.apply(void 0,e)})}},t.EventEmitter.prototype.hasHandler=function(t){return t in this.events},t.tokenizer=function(e){if(!arguments.length||null==e||void 0==e)return[];if(Array.isArray(e))return e.map(function(e){return t.utils.asString(e).toLowerCase()});var n=t.tokenizer.seperator||t.tokenizer.separator;return e.toString().trim().toLowerCase().split(n)},t.tokenizer.seperator=!1,t.tokenizer.separator=/[\s\-]+/,t.tokenizer.load=function(t){var e=this.registeredFunctions[t];if(!e)throw new Error("Cannot load un-registered function: "+t);return e},t.tokenizer.label="default",t.tokenizer.registeredFunctions={"default":t.tokenizer},t.tokenizer.registerFunction=function(e,n){n in this.registeredFunctions&&t.utils.warn("Overwriting existing tokenizer: "+n),e.label=n,this.registeredFunctions[n]=e},t.Pipeline=function(){this._stack=[]},t.Pipeline.registeredFunctions={},t.Pipeline.registerFunction=function(e,n){n in this.registeredFunctions&&t.utils.warn("Overwriting existing registered function: "+n),e.label=n,t.Pipeline.registeredFunctions[e.label]=e},t.Pipeline.warnIfFunctionNotRegistered=function(e){var n=e.label&&e.label in this.registeredFunctions;n||t.utils.warn("Function is not registered with pipeline. This may cause problems when serialising the index.\n",e)},t.Pipeline.load=function(e){var n=new t.Pipeline;return e.forEach(function(e){var i=t.Pipeline.registeredFunctions[e];if(!i)throw new Error("Cannot load un-registered function: "+e);n.add(i)}),n},t.Pipeline.prototype.add=function(){var e=Array.prototype.slice.call(arguments);e.forEach(function(e){t.Pipeline.warnIfFunctionNotRegistered(e),this._stack.push(e)},this)},t.Pipeline.prototype.after=function(e,n){t.Pipeline.warnIfFunctionNotRegistered(n);var i=this._stack.indexOf(e);if(-1==i)throw new Error("Cannot find existingFn");i+=1,this._stack.splice(i,0,n)},t.Pipeline.prototype.before=function(e,n){t.Pipeline.warnIfFunctionNotRegistered(n);var i=this._stack.indexOf(e);if(-1==i)throw new Error("Cannot find existingFn");this._stack.splice(i,0,n)},t.Pipeline.prototype.remove=function(t){var e=this._stack.indexOf(t);-1!=e&&this._stack.splice(e,1)},t.Pipeline.prototype.run=function(t){for(var e=[],n=t.length,i=this._stack.length,r=0;n>r;r++){for(var o=t[r],s=0;i>s&&(o=this._stack[s](o,r,t),void 0!==o&&""!==o);s++);void 0!==o&&""!==o&&e.push(o)}return e},t.Pipeline.prototype.reset=function(){this._stack=[]},t.Pipeline.prototype.toJSON=function(){return this._stack.map(function(e){return t.Pipeline.warnIfFunctionNotRegistered(e),e.label})},t.Vector=function(){this._magnitude=null,this.list=void 0,this.length=0},t.Vector.Node=function(t,e,n){this.idx=t,this.val=e,this.next=n},t.Vector.prototype.insert=function(e,n){this._magnitude=void 0;var i=this.list;if(!i)return this.list=new t.Vector.Node(e,n,i),this.length++;if(e<i.idx)return this.list=new t.Vector.Node(e,n,i),this.length++;for(var r=i,o=i.next;void 0!=o;){if(e<o.idx)return r.next=new t.Vector.Node(e,n,o),this.length++;r=o,o=o.next}return r.next=new t.Vector.Node(e,n,o),this.length++},t.Vector.prototype.magnitude=function(){if(this._magnitude)return this._magnitude;for(var t,e=this.list,n=0;e;)t=e.val,n+=t*t,e=e.next;return this._magnitude=Math.sqrt(n)},t.Vector.prototype.dot=function(t){for(var e=this.list,n=t.list,i=0;e&&n;)e.idx<n.idx?e=e.next:e.idx>n.idx?n=n.next:(i+=e.val*n.val,e=e.next,n=n.next);return i},t.Vector.prototype.similarity=function(t){return this.dot(t)/(this.magnitude()*t.magnitude())},t.SortedSet=function(){this.length=0,this.elements=[]},t.SortedSet.load=function(t){var e=new this;return e.elements=t,e.length=t.length,e},t.SortedSet.prototype.add=function(){var t,e;for(t=0;t<arguments.length;t++)e=arguments[t],~this.indexOf(e)||this.elements.splice(this.locationFor(e),0,e);this.length=this.elements.length},t.SortedSet.prototype.toArray=function(){return this.elements.slice()},t.SortedSet.prototype.map=function(t,e){return this.elements.map(t,e)},t.SortedSet.prototype.forEach=function(t,e){return this.elements.forEach(t,e)},t.SortedSet.prototype.indexOf=function(t){for(var e=0,n=this.elements.length,i=n-e,r=e+Math.floor(i/2),o=this.elements[r];i>1;){if(o===t)return r;t>o&&(e=r),o>t&&(n=r),i=n-e,r=e+Math.floor(i/2),o=this.elements[r]}return o===t?r:-1},t.SortedSet.prototype.locationFor=function(t){for(var e=0,n=this.elements.length,i=n-e,r=e+Math.floor(i/2),o=this.elements[r];i>1;)t>o&&(e=r),o>t&&(n=r),i=n-e,r=e+Math.floor(i/2),o=this.elements[r];return o>t?r:t>o?r+1:void 0},t.SortedSet.prototype.intersect=function(e){for(var n=new t.SortedSet,i=0,r=0,o=this.length,s=e.length,a=this.elements,h=e.elements;;){if(i>o-1||r>s-1)break;a[i]!==h[r]?a[i]<h[r]?i++:a[i]>h[r]&&r++:(n.add(a[i]),i++,r++)}return n},t.SortedSet.prototype.clone=function(){var e=new t.SortedSet;return e.elements=this.toArray(),e.length=e.elements.length,e},t.SortedSet.prototype.union=function(t){var e,n,i;this.length>=t.length?(e=this,n=t):(e=t,n=this),i=e.clone();for(var r=0,o=n.toArray();r<o.length;r++)i.add(o[r]);return i},t.SortedSet.prototype.toJSON=function(){return this.toArray()},t.Index=function(){this._fields=[],this._ref="id",this.pipeline=new t.Pipeline,this.documentStore=new t.Store,this.tokenStore=new t.TokenStore,this.corpusTokens=new t.SortedSet,this.eventEmitter=new t.EventEmitter,this.tokenizerFn=t.tokenizer,this._idfCache={},this.on("add","remove","update",function(){this._idfCache={}}.bind(this))},t.Index.prototype.on=function(){var t=Array.prototype.slice.call(arguments);return this.eventEmitter.addListener.apply(this.eventEmitter,t)},t.Index.prototype.off=function(t,e){return this.eventEmitter.removeListener(t,e)},t.Index.load=function(e){e.version!==t.version&&t.utils.warn("version mismatch: current "+t.version+" importing "+e.version);var n=new this;return n._fields=e.fields,n._ref=e.ref,n.tokenizer(t.tokenizer.load(e.tokenizer)),n.documentStore=t.Store.load(e.documentStore),n.tokenStore=t.TokenStore.load(e.tokenStore),n.corpusTokens=t.SortedSet.load(e.corpusTokens),n.pipeline=t.Pipeline.load(e.pipeline),n},t.Index.prototype.field=function(t,e){var e=e||{},n={name:t,boost:e.boost||1};return this._fields.push(n),this},t.Index.prototype.ref=function(t){return this._ref=t,this},t.Index.prototype.tokenizer=function(e){var n=e.label&&e.label in t.tokenizer.registeredFunctions;return n||t.utils.warn("Function is not a registered tokenizer. This may cause problems when serialising the index"),this.tokenizerFn=e,this},t.Index.prototype.add=function(e,n){var i={},r=new t.SortedSet,o=e[this._ref],n=void 0===n?!0:n;this._fields.forEach(function(t){var n=this.pipeline.run(this.tokenizerFn(e[t.name]));i[t.name]=n;for(var o=0;o<n.length;o++){var s=n[o];r.add(s),this.corpusTokens.add(s)}},this),this.documentStore.set(o,r);for(var s=0;s<r.length;s++){for(var a=r.elements[s],h=0,u=0;u<this._fields.length;u++){var l=this._fields[u],c=i[l.name],f=c.length;if(f){for(var d=0,p=0;f>p;p++)c[p]===a&&d++;h+=d/f*l.boost}}this.tokenStore.add(a,{ref:o,tf:h})}n&&this.eventEmitter.emit("add",e,this)},t.Index.prototype.remove=function(t,e){var n=t[this._ref],e=void 0===e?!0:e;if(this.documentStore.has(n)){var i=this.documentStore.get(n);this.documentStore.remove(n),i.forEach(function(t){this.tokenStore.remove(t,n)},this),e&&this.eventEmitter.emit("remove",t,this)}},t.Index.prototype.update=function(t,e){var e=void 0===e?!0:e;this.remove(t,!1),this.add(t,!1),e&&this.eventEmitter.emit("update",t,this)},t.Index.prototype.idf=function(t){var e="@"+t;if(Object.prototype.hasOwnProperty.call(this._idfCache,e))return this._idfCache[e];var n=this.tokenStore.count(t),i=1;return n>0&&(i=1+Math.log(this.documentStore.length/n)),this._idfCache[e]=i},t.Index.prototype.search=function(e){var n=this.pipeline.run(this.tokenizerFn(e)),i=new t.Vector,r=[],o=this._fields.reduce(function(t,e){return t+e.boost},0),s=n.some(function(t){return this.tokenStore.has(t)},this);if(!s)return[];n.forEach(function(e,n,s){var a=1/s.length*this._fields.length*o,h=this,u=this.tokenStore.expand(e).reduce(function(n,r){var o=h.corpusTokens.indexOf(r),s=h.idf(r),u=1,l=new t.SortedSet;if(r!==e){var c=Math.max(3,r.length-e.length);u=1/Math.log(c)}o>-1&&i.insert(o,a*s*u);for(var f=h.tokenStore.get(r),d=Object.keys(f),p=d.length,v=0;p>v;v++)l.add(f[d[v]].ref);return n.union(l)},new t.SortedSet);r.push(u)},this);var a=r.reduce(function(t,e){return t.intersect(e)});return a.map(function(t){return{ref:t,score:i.similarity(this.documentVector(t))}},this).sort(function(t,e){return e.score-t.score})},t.Index.prototype.documentVector=function(e){for(var n=this.documentStore.get(e),i=n.length,r=new t.Vector,o=0;i>o;o++){var s=n.elements[o],a=this.tokenStore.get(s)[e].tf,h=this.idf(s);r.insert(this.corpusTokens.indexOf(s),a*h)}return r},t.Index.prototype.toJSON=function(){return{version:t.version,fields:this._fields,ref:this._ref,tokenizer:this.tokenizerFn.label,documentStore:this.documentStore.toJSON(),tokenStore:this.tokenStore.toJSON(),corpusTokens:this.corpusTokens.toJSON(),pipeline:this.pipeline.toJSON()}},t.Index.prototype.use=function(t){var e=Array.prototype.slice.call(arguments,1);e.unshift(this),t.apply(this,e)},t.Store=function(){this.store={},this.length=0},t.Store.load=function(e){var n=new this;return n.length=e.length,n.store=Object.keys(e.store).reduce(function(n,i){return n[i]=t.SortedSet.load(e.store[i]),n},{}),n},t.Store.prototype.set=function(t,e){this.has(t)||this.length++,this.store[t]=e},t.Store.prototype.get=function(t){return this.store[t]},t.Store.prototype.has=function(t){return t in this.store},t.Store.prototype.remove=function(t){this.has(t)&&(delete this.store[t],this.length--)},t.Store.prototype.toJSON=function(){return{store:this.store,length:this.length}},t.stemmer=function(){var t={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},e={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""},n="[^aeiou]",i="[aeiouy]",r=n+"[^aeiouy]*",o=i+"[aeiou]*",s="^("+r+")?"+o+r,a="^("+r+")?"+o+r+"("+o+")?$",h="^("+r+")?"+o+r+o+r,u="^("+r+")?"+i,l=new RegExp(s),c=new RegExp(h),f=new RegExp(a),d=new RegExp(u),p=/^(.+?)(ss|i)es$/,v=/^(.+?)([^s])s$/,g=/^(.+?)eed$/,m=/^(.+?)(ed|ing)$/,y=/.$/,S=/(at|bl|iz)$/,w=new RegExp("([^aeiouylsz])\\1$"),k=new RegExp("^"+r+i+"[^aeiouwxy]$"),x=/^(.+?[^aeiou])y$/,b=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,E=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,F=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,_=/^(.+?)(s|t)(ion)$/,z=/^(.+?)e$/,O=/ll$/,P=new RegExp("^"+r+i+"[^aeiouwxy]$"),T=function(n){var i,r,o,s,a,h,u;if(n.length<3)return n;if(o=n.substr(0,1),"y"==o&&(n=o.toUpperCase()+n.substr(1)),s=p,a=v,s.test(n)?n=n.replace(s,"$1$2"):a.test(n)&&(n=n.replace(a,"$1$2")),s=g,a=m,s.test(n)){var T=s.exec(n);s=l,s.test(T[1])&&(s=y,n=n.replace(s,""))}else if(a.test(n)){var T=a.exec(n);i=T[1],a=d,a.test(i)&&(n=i,a=S,h=w,u=k,a.test(n)?n+="e":h.test(n)?(s=y,n=n.replace(s,"")):u.test(n)&&(n+="e"))}if(s=x,s.test(n)){var T=s.exec(n);i=T[1],n=i+"i"}if(s=b,s.test(n)){var T=s.exec(n);i=T[1],r=T[2],s=l,s.test(i)&&(n=i+t[r])}if(s=E,s.test(n)){var T=s.exec(n);i=T[1],r=T[2],s=l,s.test(i)&&(n=i+e[r])}if(s=F,a=_,s.test(n)){var T=s.exec(n);i=T[1],s=c,s.test(i)&&(n=i)}else if(a.test(n)){var T=a.exec(n);i=T[1]+T[2],a=c,a.test(i)&&(n=i)}if(s=z,s.test(n)){var T=s.exec(n);i=T[1],s=c,a=f,h=P,(s.test(i)||a.test(i)&&!h.test(i))&&(n=i)}return s=O,a=c,s.test(n)&&a.test(n)&&(s=y,n=n.replace(s,"")),"y"==o&&(n=o.toLowerCase()+n.substr(1)),n};return T}(),t.Pipeline.registerFunction(t.stemmer,"stemmer"),t.generateStopWordFilter=function(t){var e=t.reduce(function(t,e){return t[e]=e,t},{});return function(t){return t&&e[t]!==t?t:void 0}},t.stopWordFilter=t.generateStopWordFilter(["a","able","about","across","after","all","almost","also","am","among","an","and","any","are","as","at","be","because","been","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","off","often","on","only","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","to","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your"]),t.Pipeline.registerFunction(t.stopWordFilter,"stopWordFilter"),t.trimmer=function(t){return t.replace(/^\W+/,"").replace(/\W+$/,"")},t.Pipeline.registerFunction(t.trimmer,"trimmer"),t.TokenStore=function(){this.root={docs:{}},this.length=0},t.TokenStore.load=function(t){var e=new this;return e.root=t.root,e.length=t.length,e},t.TokenStore.prototype.add=function(t,e,n){var n=n||this.root,i=t.charAt(0),r=t.slice(1);return i in n||(n[i]={docs:{}}),0===r.length?(n[i].docs[e.ref]=e,void(this.length+=1)):this.add(r,e,n[i])},t.TokenStore.prototype.has=function(t){if(!t)return!1;for(var e=this.root,n=0;n<t.length;n++){if(!e[t.charAt(n)])return!1;e=e[t.charAt(n)]}return!0},t.TokenStore.prototype.getNode=function(t){if(!t)return{};for(var e=this.root,n=0;n<t.length;n++){if(!e[t.charAt(n)])return{};e=e[t.charAt(n)]}return e},t.TokenStore.prototype.get=function(t,e){return this.getNode(t,e).docs||{}},t.TokenStore.prototype.count=function(t,e){return Object.keys(this.get(t,e)).length},t.TokenStore.prototype.remove=function(t,e){if(t){for(var n=this.root,i=0;i<t.length;i++){if(!(t.charAt(i)in n))return;n=n[t.charAt(i)]}delete n.docs[e]}},t.TokenStore.prototype.expand=function(t,e){var n=this.getNode(t),i=n.docs||{},e=e||[];return Object.keys(i).length&&e.push(t),Object.keys(n).forEach(function(n){"docs"!==n&&e.concat(this.expand(t+n,e))},this),e},t.TokenStore.prototype.toJSON=function(){return{root:this.root,length:this.length}},function(t,e){"function"==typeof define&&define.amd?define(e):"object"==typeof exports?module.exports=e():t.lunr=e()}(this,function(){return t})}();
/**
* simplePagination.js v1.6
* A simple jQuery pagination plugin.
* http://flaviusmatis.github.com/simplePagination.js/
*
* Copyright 2012, Flavius Matis
* Released under the MIT license.
* http://flaviusmatis.github.com/license.html
*/

(function($){

	var methods = {
		init: function(options) {
			var o = $.extend({
				items: 1,
				itemsOnPage: 1,
				pages: 0,
				displayedPages: 5,
				edges: 2,
				currentPage: 0,
				hrefTextPrefix: '#page-',
				hrefTextSuffix: '',
				prevText: 'Prev',
				nextText: 'Next',
				ellipseText: '&hellip;',
				ellipsePageSet: true,
				cssStyle: 'light-theme',
				listStyle: '',
				labelMap: [],
				selectOnClick: true,
				nextAtFront: false,
				invertPageOrder: false,
				useStartEdge : true,
				useEndEdge : true,
				onPageClick: function(pageNumber, event) {
					// Callback triggered when a page is clicked
					// Page number is given as an optional parameter
				},
				onInit: function() {
					// Callback triggered immediately after initialization
				}
			}, options || {});

			var self = this;

			o.pages = o.pages ? o.pages : Math.ceil(o.items / o.itemsOnPage) ? Math.ceil(o.items / o.itemsOnPage) : 1;
			if (o.currentPage)
				o.currentPage = o.currentPage - 1;
			else
				o.currentPage = !o.invertPageOrder ? 0 : o.pages - 1;
			o.halfDisplayed = o.displayedPages / 2;

			this.each(function() {
				self.addClass(o.cssStyle + ' simple-pagination').data('pagination', o);
				methods._draw.call(self);
			});

			o.onInit();

			return this;
		},

		selectPage: function(page) {
			methods._selectPage.call(this, page - 1);
			return this;
		},

		prevPage: function() {
			var o = this.data('pagination');
			if (!o.invertPageOrder) {
				if (o.currentPage > 0) {
					methods._selectPage.call(this, o.currentPage - 1);
				}
			} else {
				if (o.currentPage < o.pages - 1) {
					methods._selectPage.call(this, o.currentPage + 1);
				}
			}
			return this;
		},

		nextPage: function() {
			var o = this.data('pagination');
			if (!o.invertPageOrder) {
				if (o.currentPage < o.pages - 1) {
					methods._selectPage.call(this, o.currentPage + 1);
				}
			} else {
				if (o.currentPage > 0) {
					methods._selectPage.call(this, o.currentPage - 1);
				}
			}
			return this;
		},

		getPagesCount: function() {
			return this.data('pagination').pages;
		},

		setPagesCount: function(count) {
			this.data('pagination').pages = count;
		},

		getCurrentPage: function () {
			return this.data('pagination').currentPage + 1;
		},

		destroy: function(){
			this.empty();
			return this;
		},

		drawPage: function (page) {
			var o = this.data('pagination');
			o.currentPage = page - 1;
			this.data('pagination', o);
			methods._draw.call(this);
			return this;
		},

		redraw: function(){
			methods._draw.call(this);
			return this;
		},

		disable: function(){
			var o = this.data('pagination');
			o.disabled = true;
			this.data('pagination', o);
			methods._draw.call(this);
			return this;
		},

		enable: function(){
			var o = this.data('pagination');
			o.disabled = false;
			this.data('pagination', o);
			methods._draw.call(this);
			return this;
		},

		updateItems: function (newItems) {
			var o = this.data('pagination');
			o.items = newItems;
			o.pages = methods._getPages(o);
			this.data('pagination', o);
			methods._draw.call(this);
		},

		updateItemsOnPage: function (itemsOnPage) {
			var o = this.data('pagination');
			o.itemsOnPage = itemsOnPage;
			o.pages = methods._getPages(o);
			this.data('pagination', o);
			methods._selectPage.call(this, 0);
			return this;
		},

		getItemsOnPage: function() {
			return this.data('pagination').itemsOnPage;
		},

		_draw: function() {
			var	o = this.data('pagination'),
				interval = methods._getInterval(o),
				i,
				tagName;

			methods.destroy.call(this);

			tagName = (typeof this.prop === 'function') ? this.prop('tagName') : this.attr('tagName');

			var $panel = tagName === 'UL' ? this : $('<ul' + (o.listStyle ? ' class="' + o.listStyle + '"' : '') + '></ul>').appendTo(this);

			// Generate Prev link
			if (o.prevText) {
				methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage - 1 : o.currentPage + 1, {text: o.prevText, classes: 'prev'});
			}

			// Generate Next link (if option set for at front)
			if (o.nextText && o.nextAtFront) {
				methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage + 1 : o.currentPage - 1, {text: o.nextText, classes: 'next'});
			}

			// Generate start edges
			if (!o.invertPageOrder) {
				if (interval.start > 0 && o.edges > 0) {
					if(o.useStartEdge) {
						var end = Math.min(o.edges, interval.start);
						for (i = 0; i < end; i++) {
							methods._appendItem.call(this, i);
						}
					}
					if (o.edges < interval.start && (interval.start - o.edges != 1)) {
						$panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
					} else if (interval.start - o.edges == 1) {
						methods._appendItem.call(this, o.edges);
					}
				}
			} else {
				if (interval.end < o.pages && o.edges > 0) {
					if(o.useStartEdge) {
						var begin = Math.max(o.pages - o.edges, interval.end);
						for (i = o.pages - 1; i >= begin; i--) {
							methods._appendItem.call(this, i);
						}
					}

					if (o.pages - o.edges > interval.end && (o.pages - o.edges - interval.end != 1)) {
						$panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
					} else if (o.pages - o.edges - interval.end == 1) {
						methods._appendItem.call(this, interval.end);
					}
				}
			}

			// Generate interval links
			if (!o.invertPageOrder) {
				for (i = interval.start; i < interval.end; i++) {
					methods._appendItem.call(this, i);
				}
			} else {
				for (i = interval.end - 1; i >= interval.start; i--) {
					methods._appendItem.call(this, i);
				}
			}

			// Generate end edges
			if (!o.invertPageOrder) {
				if (interval.end < o.pages && o.edges > 0) {
					if (o.pages - o.edges > interval.end && (o.pages - o.edges - interval.end != 1)) {
						$panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
					} else if (o.pages - o.edges - interval.end == 1) {
						methods._appendItem.call(this, interval.end);
					}
					if(o.useEndEdge) {
						var begin = Math.max(o.pages - o.edges, interval.end);
						for (i = begin; i < o.pages; i++) {
							methods._appendItem.call(this, i);
						}
					}
				}
			} else {
				if (interval.start > 0 && o.edges > 0) {
					if (o.edges < interval.start && (interval.start - o.edges != 1)) {
						$panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
					} else if (interval.start - o.edges == 1) {
						methods._appendItem.call(this, o.edges);
					}

					if(o.useEndEdge) {
						var end = Math.min(o.edges, interval.start);
						for (i = end - 1; i >= 0; i--) {
							methods._appendItem.call(this, i);
						}
					}
				}
			}

			// Generate Next link (unless option is set for at front)
			if (o.nextText && !o.nextAtFront) {
				methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage + 1 : o.currentPage - 1, {text: o.nextText, classes: 'next'});
			}

			if (o.ellipsePageSet && !o.disabled) {
				methods._ellipseClick.call(this, $panel);
			}

		},

		_getPages: function(o) {
			var pages = Math.ceil(o.items / o.itemsOnPage);
			return pages || 1;
		},

		_getInterval: function(o) {
			return {
				start: Math.ceil(o.currentPage > o.halfDisplayed ? Math.max(Math.min(o.currentPage - o.halfDisplayed, (o.pages - o.displayedPages)), 0) : 0),
				end: Math.ceil(o.currentPage > o.halfDisplayed ? Math.min(o.currentPage + o.halfDisplayed, o.pages) : Math.min(o.displayedPages, o.pages))
			};
		},

		_appendItem: function(pageIndex, opts) {
			var self = this, options, $link, o = self.data('pagination'), $linkWrapper = $('<li></li>'), $ul = self.find('ul');

			pageIndex = pageIndex < 0 ? 0 : (pageIndex < o.pages ? pageIndex : o.pages - 1);

			options = {
				text: pageIndex + 1,
				classes: ''
			};

			if (o.labelMap.length && o.labelMap[pageIndex]) {
				options.text = o.labelMap[pageIndex];
			}

			options = $.extend(options, opts || {});

			if (pageIndex == o.currentPage || o.disabled) {
				if (o.disabled || options.classes === 'prev' || options.classes === 'next') {
					$linkWrapper.addClass('disabled');
				} else {
					$linkWrapper.addClass('active');
				}
				$link = $('<span class="current">' + (options.text) + '</span>');
			} else {
				$link = $('<a href="' + o.hrefTextPrefix + (pageIndex + 1) + o.hrefTextSuffix + '" class="page-link">' + (options.text) + '</a>');
				$link.click(function(event){
					return methods._selectPage.call(self, pageIndex, event);
				});
			}

			if (options.classes) {
				$link.addClass(options.classes);
			}

			$linkWrapper.append($link);

			if ($ul.length) {
				$ul.append($linkWrapper);
			} else {
				self.append($linkWrapper);
			}
		},

		_selectPage: function(pageIndex, event) {
			var o = this.data('pagination');
			o.currentPage = pageIndex;
			if (o.selectOnClick) {
				methods._draw.call(this);
			}
			return o.onPageClick(pageIndex + 1, event);
		},


		_ellipseClick: function($panel) {
			var self = this,
				o = this.data('pagination'),
				$ellip = $panel.find('.ellipse');
			$ellip.addClass('clickable').parent().removeClass('disabled');
			$ellip.click(function(event) {
				if (!o.disable) {
					var $this = $(this),
						val = (parseInt($this.parent().prev().text(), 10) || 0) + 1;
					$this
						.html('<input type="number" min="1" max="' + o.pages + '" step="1" value="' + val + '">')
						.find('input')
						.focus()
						.click(function(event) {
							// prevent input number arrows from bubbling a click event on $ellip
							event.stopPropagation();
						})
						.keyup(function(event) {
							var val = $(this).val();
							if (event.which === 13 && val !== '') {
								// enter to accept
								if ((val>0)&&(val<=o.pages))
								methods._selectPage.call(self, val - 1);
							} else if (event.which === 27) {
								// escape to cancel
								$ellip.empty().html(o.ellipseText);
							}
						})
						.bind('blur', function(event) {
							var val = $(this).val();
							if (val !== '') {
								methods._selectPage.call(self, val - 1);
							}
							$ellip.empty().html(o.ellipseText);
							return false;
						});
				}
				return false;
			});
		}

	};

	$.fn.pagination = function(method) {

		// Method calling logic
		if (methods[method] && method.charAt(0) != '_') {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.pagination');
		}

	};

})(jQuery);

!function(a,b){"function"==typeof define&&define.amd?define([],function(){return a.svg4everybody=b()}):"object"==typeof module&&module.exports?module.exports=b():a.svg4everybody=b()}(this,function(){function a(a,b,c){if(c){var d=document.createDocumentFragment(),e=!b.hasAttribute("viewBox")&&c.getAttribute("viewBox");e&&b.setAttribute("viewBox",e);for(var f=c.cloneNode(!0);f.childNodes.length;)d.appendChild(f.firstChild);a.appendChild(d)}}function b(b){b.onreadystatechange=function(){if(4===b.readyState){var c=b._cachedDocument;c||(c=b._cachedDocument=document.implementation.createHTMLDocument(""),c.body.innerHTML=b.responseText,b._cachedTarget={}),b._embeds.splice(0).map(function(d){var e=b._cachedTarget[d.id];e||(e=b._cachedTarget[d.id]=c.getElementById(d.id)),a(d.parent,d.svg,e)})}},b.onreadystatechange()}function c(c){function e(){for(var c=0;c<m.length;){var h=m[c],i=h.parentNode,j=d(i);if(j){var n=h.getAttribute("xlink:href")||h.getAttribute("href");if(f&&(!g.validate||g.validate(n,j,h))){i.removeChild(h);var o=n.split("#"),p=o.shift(),q=o.join("#");if(p.length){var r=k[p];r||(r=k[p]=new XMLHttpRequest,r.open("GET",p),r.send(),r._embeds=[]),r._embeds.push({parent:i,svg:j,id:q}),b(r)}else a(i,document.getElementById(q))}}else++c}l(e,67)}var f,g=Object(c),h=/\bTrident\/[567]\b|\bMSIE (?:9|10)\.0\b/,i=/\bAppleWebKit\/(\d+)\b/,j=/\bEdge\/12\.(\d+)\b/;f="polyfill"in g?g.polyfill:h.test(navigator.userAgent)||(navigator.userAgent.match(j)||[])[1]<10547||(navigator.userAgent.match(i)||[])[1]<537;var k={},l=window.requestAnimationFrame||setTimeout,m=document.getElementsByTagName("use");f&&e()}function d(a){for(var b=a;"svg"!==b.nodeName.toLowerCase()&&(b=b.parentNode););return b}return c});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlYXJjaC5qcyIsIm1haW4uanMiLCJsdW5yLm1pbi5qcyIsImpxdWVyeS5zaW1wbGVQYWdpbmF0aW9uLmpzIiwic3ZnNGV2ZXJ5Ym9keS5taW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6WUEiLCJmaWxlIjoianMvY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xyXG5cclxuICB2YXIgcmVzdWx0QXJyYXkgPSBudWxsO1xyXG4gIHZhciBpdGVtc09uUGFnZSA9IDM7XHJcbiAgdmFyIHN0b3JlID0gd2luZG93LnN0b3JlO1xyXG4gIHZhciBzZWFyY2hSZXN1bHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaC1yZXN1bHRzJyk7XHJcbiAgdmFyIGN1cnJMYW5nID0gJ2VuJztcclxuICB2YXIgbGFuZ0pTT04gPSB7fTtcclxuXHJcbiAgZnVuY3Rpb24gcG9wdWxhdGVKU09OKCl7XHJcbiAgICBsYW5nSlNPTiA9IHtcclxuICAgICAgXCJub19yZXN1bHRcIiA6IFtcclxuICAgICAgICB7XCJlblwiIDogXCJObyByZXN1bHRzIGZvdW5kXCJ9LFxyXG4gICAgICAgIHtcImRlXCIgOiBcIktlaW5lIEVyZ2Vibmlzc2UgZ2VmdW5kZW5cIn0sXHJcbiAgICAgICAge1wia29cIiA6IFwi6rKw6rO8IOuCtOyaqeydtCDsl4bsirXri4jri6RcIn0gXHJcbiAgICAgIF0sXHJcbiAgICAgIFwiaW5wdXRfbmVlZGVkXCIgOiBbXHJcbiAgICAgICAge1wiZW5cIiA6IFwiUGxlYXNlIGdpdmUgc29tZSBpbnB1dCB0byBzdGFydFwifSxcclxuICAgICAgICB7XCJkZVwiIDogXCJCaXR0ZSBnZWJlbiBTaWUgZWluZSBFaW5nYWJlIHp1IHN0YXJ0ZW5cIn0sXHJcbiAgICAgICAge1wia29cIiA6IFwi6rCS7J2EIOyeheugpe2VtCDso7zshLjsmpRcIn1cclxuICAgICAgXSxcclxuICAgICAgXCJyZWFkX21vcmVcIiA6IFtcclxuICAgICAgICB7XCJlblwiIDogXCJSZWFkIG1vcmVcIn0sXHJcbiAgICAgICAge1wiZGVcIiA6IFwiTWVoclwifSxcclxuICAgICAgICB7XCJrb1wiIDogXCLsnb3quLBcIn1cclxuICAgICAgXSxcclxuICAgICAgXCJwcmV2XCI6IFtcclxuICAgICAgICB7XCJlblwiOiBcIlByZXZcIn0sIFxyXG4gICAgICAgIHtcImRlXCI6IFwiWnVyw7xja1wifSwgXHJcbiAgICAgICAge1wia29cIjogXCLsnbTsoIRcIn1cclxuICAgICAgXSxcclxuICAgICAgXCJuZXh0XCI6IFtcclxuICAgICAgICB7XCJlblwiOiBcIk5leHRcIn0sIFxyXG4gICAgICAgIHtcImRlXCI6IFwiV2VpdGVyXCJ9LCBcclxuICAgICAgICB7XCJrb1wiOiBcIuuLpOydjFwifVxyXG4gICAgICBdXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0SlNPTihzdHJpbmcsIGxhbmcpe1xyXG4gICAgdmFyIHN0cmluZ0FycmF5ID0gbGFuZ0pTT05bc3RyaW5nXTtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzdHJpbmdBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgIHZhciBjdXJyT2JqID0gc3RyaW5nQXJyYXlbaV07XHJcbiAgICAgIGZvciggdmFyIGxhbmcgaW4gY3Vyck9iail7XHJcbiAgICAgICAgaWYobGFuZyA9PSBjdXJyTGFuZykgXHJcbiAgICAgICAgICByZXR1cm4gY3Vyck9ialtsYW5nXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdExhbmcoKXtcclxuICAgIGN1cnJMYW5nID0galF1ZXJ5KCcuY29udGFpbmVyLW1haW4tbGFuZ3VhZ2UtbGluay5hY3RpdmUnKS5hdHRyKCdpZCcpO1xyXG4gICAgcG9wdWxhdGVKU09OKCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwYWdpbmF0aW9uR29Ubygpe1xyXG4gICAgdmFyIHBhZ2VOdW1iZXIgPSBqUXVlcnkoJy5wYWdpbmF0aW9uJykucGFnaW5hdGlvbignZ2V0Q3VycmVudFBhZ2UnKTtcclxuICAgIGRpc3BsYXlTZWFyY2hSZXN1bHRzRm9yUGFnZShwYWdlTnVtYmVyLCBpdGVtc09uUGFnZSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBsb2FkUGFnaW5hdGlvbihpdGVtU2l6ZSl7XHJcblxyXG4gICAgaWYoaXRlbVNpemUgPT0gMCl7XHJcbiAgICAgIHNlYXJjaFJlc3VsdHMuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XFxcInBvc3QtbGlzdC1uby1yZXN1bHRzXFxcIj48c3ZnIGNsYXNzPVxcXCJpY29uLXdyZW5jaFxcXCI+PHVzZSB4bGluazpocmVmPVxcXCIvYXNzZXRzL2ltYWdlcy9ncmFwaGljcy9zdmctc3ltYm9scy5zdmdcXCN3cmVuY2hcIj48L3VzZT48L3N2Zz48bGkgY2xhc3M9XCJuby1yZXN1bHRzXCI+JyArIGdldEpTT04oXCJub19yZXN1bHRcIiwgY3VyckxhbmcpICsgJzwvbGk+PC9kaXY+JztcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGpRdWVyeSgnLnBhZ2luYXRpb24nKS5wYWdpbmF0aW9uKHtcclxuICAgICAgaXRlbXM6IGl0ZW1TaXplLFxyXG4gICAgICBpdGVtc09uUGFnZTogaXRlbXNPblBhZ2UsXHJcbiAgICAgIHByZXZUZXh0OiBnZXRKU09OKFwicHJldlwiLCBjdXJyTGFuZyksXHJcbiAgICAgIG5leHRUZXh0OiBnZXRKU09OKFwibmV4dFwiLCBjdXJyTGFuZyksXHJcbiAgICAgIGNzc1N0eWxlOiAnbGlnaHQtdGhlbWUnLFxyXG4gICAgICBvblBhZ2VDbGljazogZnVuY3Rpb24oKXtcclxuICAgICAgICBwYWdpbmF0aW9uR29UbygpO1xyXG4gICAgICB9LFxyXG4gICAgICBvbkluaXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaW5pdFNlYXJjaFJlc3VsdHMoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJSZXN1bHRMaXN0KGFycmF5LCBzdGFydElkeCwgZW5kSWR4KXtcclxuICAgIHZhciBhcHBlbmRTdHJpbmcgPSAnJztcclxuXHJcbiAgICBmb3IgKHZhciBpID0gc3RhcnRJZHg7IGkgPD0gZW5kSWR4OyBpKyspIHtcclxuICAgICAgdmFyIGl0ZW0gPSBzdG9yZVthcnJheVtpXS5yZWZdO1xyXG4gICAgICBhcHBlbmRTdHJpbmcgKz0gJzxsaSBjbGFzcz1cInBvc3QtbGlzdC1lbmNsb3N1cmUtMXByXCI+JztcclxuICAgICAgYXBwZW5kU3RyaW5nICs9ICc8ZGl2IGNsYXNzPVwiY2FyZC1kZXRhaWxzXCI+JztcclxuICAgICAgYXBwZW5kU3RyaW5nICs9ICc8ZGl2IGNsYXNzPVwiY2FyZC1kZXRhaWxzLWhlYWRlclwiPic7XHJcbiAgICAgIGFwcGVuZFN0cmluZyArPSAnPHNwYW4gY2xhc3M9XCJjYXJkLWRldGFpbHMtaGVhZGVyLXRpdGxlXCI+JyArIGl0ZW0udGl0bGUgKyAnPC9zcGFuPic7XHJcbiAgICAgIGFwcGVuZFN0cmluZyArPSAnPHNwYW4gY2xhc3M9XCJjYXJkLWRldGFpbHMtaGVhZGVyLWNhdGVnb3J5XCI+JyArIGl0ZW0uY2F0ZWdvcnkgKyAnPC9zcGFuPic7XHJcbiAgICAgIGFwcGVuZFN0cmluZyArPSAnPHNwYW4gY2xhc3M9XCJjYXJkLWRldGFpbHMtaGVhZGVyLWRhdGVcIj4nICsgaXRlbS5kYXRlICsgJzwvc3Bhbj4nO1xyXG4gICAgICBhcHBlbmRTdHJpbmcgKz0gJzwvZGl2Pic7XHJcbiAgICAgIGFwcGVuZFN0cmluZyArPSAnPGRpdiBjbGFzcz1cImNhcmQtZGV0YWlscy1tYWluXCI+JztcclxuICAgICAgaWYoaXRlbS5jb250ZW50Lmxlbmd0aCA8PSAxNDkpIGFwcGVuZFN0cmluZyArPSBpdGVtLmNvbnRlbnQgKyAnPC9kaXY+JztcclxuICAgICAgZWxzZSBhcHBlbmRTdHJpbmcgKz0gaXRlbS5jb250ZW50LnN1YnN0cmluZygwLCAzMDApICsgJy4uLjwvZGl2Pic7XHJcbiAgICAgIGFwcGVuZFN0cmluZyArPSAnPGRpdiBjbGFzcz1cImNhcmQtZGV0YWlscy1yZWFkbW9yZVwiPicgKyAnPGEgaHJlZj1cIicgKyBpdGVtLnVybCArICdcIj4nICsgZ2V0SlNPTihcInJlYWRfbW9yZVwiLCBjdXJyTGFuZykgKyAnID4gPC9hPjwvZGl2Pic7XHJcbiAgICAgIGFwcGVuZFN0cmluZyArPSAnPC9kaXY+JztcclxuICAgICAgYXBwZW5kU3RyaW5nICs9ICc8L2xpPic7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFwcGVuZFN0cmluZztcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRpc3BsYXlTZWFyY2hSZXN1bHRzRm9yUGFnZShwYWdlTnVtYmVyLCBpdGVtc09uUGFnZSl7XHJcblxyXG4gICAgc2VhcmNoUmVzdWx0cy5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICB2YXIgc3RhcnRJbmRleCA9IGl0ZW1zT25QYWdlICogKHBhZ2VOdW1iZXIgLSAxKTtcclxuICAgIHZhciBlbmRJbmRleCA9IHN0YXJ0SW5kZXggKyAoaXRlbXNPblBhZ2UgLSAxKTtcclxuICAgIHZhciB0b3RhbFBhZ2VDb3VudCA9ICQoJy5wYWdpbmF0aW9uJykucGFnaW5hdGlvbignZ2V0UGFnZXNDb3VudCcpO1xyXG5cclxuICAgIGlmKCBwYWdlTnVtYmVyID09IHRvdGFsUGFnZUNvdW50ICYmIGVuZEluZGV4ID4gKHJlc3VsdEFycmF5Lmxlbmd0aCAtIDEpKVxyXG4gICAgICB2YXIgZW5kSW5kZXggPSByZXN1bHRBcnJheS5sZW5ndGggLTE7XHJcblxyXG4gICAgc2VhcmNoUmVzdWx0cy5pbm5lckhUTUwgPSByZW5kZXJSZXN1bHRMaXN0KHJlc3VsdEFycmF5LCBzdGFydEluZGV4LCBlbmRJbmRleCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0U2VhcmNoUmVzdWx0cygpIHtcclxuXHJcbiAgICBpZihyZXN1bHRBcnJheSA9PT0gbnVsbCl7XHJcbiAgICAgIGlmKHNlYXJjaFJlc3VsdHMgIT0gbnVsbClcclxuICAgICAgICBzZWFyY2hSZXN1bHRzLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVxcXCJwb3N0LWxpc3QtaW5wdXQtcmVxdWlyZWRcXFwiPjxzdmcgY2xhc3M9XFxcImljb24td2FybmluZ1xcXCI+PHVzZSB4bGluazpocmVmPVxcXCIvYXNzZXRzL2ltYWdlcy9ncmFwaGljcy9zdmctc3ltYm9scy5zdmdcXCN3YXJuaW5nXCI+PC91c2U+PC9zdmc+PGxpIGNsYXNzPVwiYXNrLWlucHV0XCI+JyArIGdldEpTT04oXCJpbnB1dF9uZWVkZWRcIiwgY3VyckxhbmcpICsgJzxibGluaz5fPC9ibGluaz4gPC9saT48L2Rpdj4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKHJlc3VsdEFycmF5Lmxlbmd0aCA8IGl0ZW1zT25QYWdlIC0gMSlcclxuICAgICAgc2VhcmNoUmVzdWx0cy5pbm5lckhUTUwgPSByZW5kZXJSZXN1bHRMaXN0KHJlc3VsdEFycmF5LCAwLCByZXN1bHRBcnJheS5sZW5ndGggLSAxKTtcclxuICAgIGVsc2VcclxuICAgICAgc2VhcmNoUmVzdWx0cy5pbm5lckhUTUwgPSByZW5kZXJSZXN1bHRMaXN0KHJlc3VsdEFycmF5LCAwLCBpdGVtc09uUGFnZSAtIDEpO1xyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFF1ZXJ5VmFyaWFibGUodmFyaWFibGUpIHtcclxuICAgIHZhciBxdWVyeSA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpO1xyXG4gICAgdmFyIHZhcnMgPSBxdWVyeS5zcGxpdCgnJicpO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgcGFpciA9IHZhcnNbaV0uc3BsaXQoJz0nKTtcclxuXHJcbiAgICAgIGlmIChwYWlyWzBdID09PSB2YXJpYWJsZSlcclxuICAgICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMV0ucmVwbGFjZSgvXFwrL2csICclMjAnKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB2YXIgc2VhcmNoVGVybSA9IGdldFF1ZXJ5VmFyaWFibGUoJ3F1ZXJ5Jyk7XHJcbiAgaW5pdExhbmcoKTtcclxuXHJcbiAgaWYgKHNlYXJjaFRlcm0pIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2gtYm94Jykuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgc2VhcmNoVGVybSk7XHJcblxyXG4gICAgdmFyIGlkeCA9IGx1bnIoZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGlzLmZpZWxkKCdpZCcpO1xyXG4gICAgICB0aGlzLmZpZWxkKCd0aXRsZScsIHsgYm9vc3Q6IDEwIH0pO1xyXG4gICAgICB0aGlzLmZpZWxkKCdhdXRob3InKTtcclxuICAgICAgdGhpcy5maWVsZCgnY2F0ZWdvcnknKTtcclxuICAgICAgdGhpcy5maWVsZCgnY29udGVudCcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZm9yICh2YXIga2V5IGluIHN0b3JlKSB7XHJcbiAgICAgIGlkeC5hZGQoe1xyXG4gICAgICAgICdpZCc6IGtleSxcclxuICAgICAgICAndGl0bGUnOiBzdG9yZVtrZXldLnRpdGxlLFxyXG4gICAgICAgICdhdXRob3InOiBzdG9yZVtrZXldLmF1dGhvcixcclxuICAgICAgICAnY2F0ZWdvcnknOiBzdG9yZVtrZXldLmNhdGVnb3J5LFxyXG4gICAgICAgICdjb250ZW50Jzogc3RvcmVba2V5XS5jb250ZW50XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciByZXN1bHRBcnJheSA9IGlkeC5zZWFyY2goc2VhcmNoVGVybSk7XHJcbiAgICBsb2FkUGFnaW5hdGlvbihyZXN1bHRBcnJheS5sZW5ndGgpO1xyXG4gIH1lbHNlIGluaXRTZWFyY2hSZXN1bHRzKCk7XHJcblxyXG59KTtcclxuIiwialF1ZXJ5KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xyXG4gIHN2ZzRldmVyeWJvZHkoKTtcclxuICAkKFwiLmljb24taGFtYnVyZ2VyXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICQoXCIuc2l0ZS1uYXZpZ2F0aW9uXCIpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgIGlmKCQoXCIuY29udGFpbmVyLXNlYXJjaC1tYWluXCIpLmhhc0NsYXNzKCdhY3RpdmUnKSlcclxuICAgICAgJChcIi5jb250YWluZXItc2VhcmNoLW1haW5cIikudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gIH0pO1xyXG5cclxuICAkKFwiLmljb24tY3Jvc3NcIikub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgJChcIi5zaXRlLW5hdmlnYXRpb25cIikudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gIH0pO1xyXG5cclxuICAkKFwiLmljb24tc2VhcmNoXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICQoXCIuY29udGFpbmVyLXNlYXJjaC1tYWluXCIpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgIGlmKCQoXCIuc2l0ZS1uYXZpZ2F0aW9uXCIpLmhhc0NsYXNzKCdhY3RpdmUnKSlcclxuICAgICAgJChcIi5zaXRlLW5hdmlnYXRpb25cIikudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gIH0pO1xyXG5cclxuICAkKCcuYW5jaG9yJykuY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICQoJ2JvZHksaHRtbCcpLmFuaW1hdGUoe3Njcm9sbFRvcDokKCcjdG9wJykub2Zmc2V0KCkudG9wfSw1MDApO1xyXG4gICAgfSwgMTAwKTtcclxuICB9KTtcclxuXHJcbn0pO1xyXG4iLCIvKipcclxuICogbHVuciAtIGh0dHA6Ly9sdW5yanMuY29tIC0gQSBiaXQgbGlrZSBTb2xyLCBidXQgbXVjaCBzbWFsbGVyIGFuZCBub3QgYXMgYnJpZ2h0IC0gMC43LjJcclxuICogQ29weXJpZ2h0IChDKSAyMDE2IE9saXZlciBOaWdodGluZ2FsZVxyXG4gKiBAbGljZW5zZSBNSVRcclxuICovXHJcbiFmdW5jdGlvbigpe3ZhciB0PWZ1bmN0aW9uKGUpe3ZhciBuPW5ldyB0LkluZGV4O3JldHVybiBuLnBpcGVsaW5lLmFkZCh0LnRyaW1tZXIsdC5zdG9wV29yZEZpbHRlcix0LnN0ZW1tZXIpLGUmJmUuY2FsbChuLG4pLG59O3QudmVyc2lvbj1cIjAuNy4yXCIsdC51dGlscz17fSx0LnV0aWxzLndhcm49ZnVuY3Rpb24odCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3QuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oZSl9fSh0aGlzKSx0LnV0aWxzLmFzU3RyaW5nPWZ1bmN0aW9uKHQpe3JldHVybiB2b2lkIDA9PT10fHxudWxsPT09dD9cIlwiOnQudG9TdHJpbmcoKX0sdC5FdmVudEVtaXR0ZXI9ZnVuY3Rpb24oKXt0aGlzLmV2ZW50cz17fX0sdC5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyPWZ1bmN0aW9uKCl7dmFyIHQ9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxlPXQucG9wKCksbj10O2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGUpdGhyb3cgbmV3IFR5cGVFcnJvcihcImxhc3QgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO24uZm9yRWFjaChmdW5jdGlvbih0KXt0aGlzLmhhc0hhbmRsZXIodCl8fCh0aGlzLmV2ZW50c1t0XT1bXSksdGhpcy5ldmVudHNbdF0ucHVzaChlKX0sdGhpcyl9LHQuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcj1mdW5jdGlvbih0LGUpe2lmKHRoaXMuaGFzSGFuZGxlcih0KSl7dmFyIG49dGhpcy5ldmVudHNbdF0uaW5kZXhPZihlKTt0aGlzLmV2ZW50c1t0XS5zcGxpY2UobiwxKSx0aGlzLmV2ZW50c1t0XS5sZW5ndGh8fGRlbGV0ZSB0aGlzLmV2ZW50c1t0XX19LHQuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0PWZ1bmN0aW9uKHQpe2lmKHRoaXMuaGFzSGFuZGxlcih0KSl7dmFyIGU9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDEpO3RoaXMuZXZlbnRzW3RdLmZvckVhY2goZnVuY3Rpb24odCl7dC5hcHBseSh2b2lkIDAsZSl9KX19LHQuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5oYXNIYW5kbGVyPWZ1bmN0aW9uKHQpe3JldHVybiB0IGluIHRoaXMuZXZlbnRzfSx0LnRva2VuaXplcj1mdW5jdGlvbihlKXtpZighYXJndW1lbnRzLmxlbmd0aHx8bnVsbD09ZXx8dm9pZCAwPT1lKXJldHVybltdO2lmKEFycmF5LmlzQXJyYXkoZSkpcmV0dXJuIGUubWFwKGZ1bmN0aW9uKGUpe3JldHVybiB0LnV0aWxzLmFzU3RyaW5nKGUpLnRvTG93ZXJDYXNlKCl9KTt2YXIgbj10LnRva2VuaXplci5zZXBlcmF0b3J8fHQudG9rZW5pemVyLnNlcGFyYXRvcjtyZXR1cm4gZS50b1N0cmluZygpLnRyaW0oKS50b0xvd2VyQ2FzZSgpLnNwbGl0KG4pfSx0LnRva2VuaXplci5zZXBlcmF0b3I9ITEsdC50b2tlbml6ZXIuc2VwYXJhdG9yPS9bXFxzXFwtXSsvLHQudG9rZW5pemVyLmxvYWQ9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5yZWdpc3RlcmVkRnVuY3Rpb25zW3RdO2lmKCFlKXRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBsb2FkIHVuLXJlZ2lzdGVyZWQgZnVuY3Rpb246IFwiK3QpO3JldHVybiBlfSx0LnRva2VuaXplci5sYWJlbD1cImRlZmF1bHRcIix0LnRva2VuaXplci5yZWdpc3RlcmVkRnVuY3Rpb25zPXtcImRlZmF1bHRcIjp0LnRva2VuaXplcn0sdC50b2tlbml6ZXIucmVnaXN0ZXJGdW5jdGlvbj1mdW5jdGlvbihlLG4pe24gaW4gdGhpcy5yZWdpc3RlcmVkRnVuY3Rpb25zJiZ0LnV0aWxzLndhcm4oXCJPdmVyd3JpdGluZyBleGlzdGluZyB0b2tlbml6ZXI6IFwiK24pLGUubGFiZWw9bix0aGlzLnJlZ2lzdGVyZWRGdW5jdGlvbnNbbl09ZX0sdC5QaXBlbGluZT1mdW5jdGlvbigpe3RoaXMuX3N0YWNrPVtdfSx0LlBpcGVsaW5lLnJlZ2lzdGVyZWRGdW5jdGlvbnM9e30sdC5QaXBlbGluZS5yZWdpc3RlckZ1bmN0aW9uPWZ1bmN0aW9uKGUsbil7biBpbiB0aGlzLnJlZ2lzdGVyZWRGdW5jdGlvbnMmJnQudXRpbHMud2FybihcIk92ZXJ3cml0aW5nIGV4aXN0aW5nIHJlZ2lzdGVyZWQgZnVuY3Rpb246IFwiK24pLGUubGFiZWw9bix0LlBpcGVsaW5lLnJlZ2lzdGVyZWRGdW5jdGlvbnNbZS5sYWJlbF09ZX0sdC5QaXBlbGluZS53YXJuSWZGdW5jdGlvbk5vdFJlZ2lzdGVyZWQ9ZnVuY3Rpb24oZSl7dmFyIG49ZS5sYWJlbCYmZS5sYWJlbCBpbiB0aGlzLnJlZ2lzdGVyZWRGdW5jdGlvbnM7bnx8dC51dGlscy53YXJuKFwiRnVuY3Rpb24gaXMgbm90IHJlZ2lzdGVyZWQgd2l0aCBwaXBlbGluZS4gVGhpcyBtYXkgY2F1c2UgcHJvYmxlbXMgd2hlbiBzZXJpYWxpc2luZyB0aGUgaW5kZXguXFxuXCIsZSl9LHQuUGlwZWxpbmUubG9hZD1mdW5jdGlvbihlKXt2YXIgbj1uZXcgdC5QaXBlbGluZTtyZXR1cm4gZS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3ZhciBpPXQuUGlwZWxpbmUucmVnaXN0ZXJlZEZ1bmN0aW9uc1tlXTtpZighaSl0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgbG9hZCB1bi1yZWdpc3RlcmVkIGZ1bmN0aW9uOiBcIitlKTtuLmFkZChpKX0pLG59LHQuUGlwZWxpbmUucHJvdG90eXBlLmFkZD1mdW5jdGlvbigpe3ZhciBlPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7ZS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QuUGlwZWxpbmUud2FybklmRnVuY3Rpb25Ob3RSZWdpc3RlcmVkKGUpLHRoaXMuX3N0YWNrLnB1c2goZSl9LHRoaXMpfSx0LlBpcGVsaW5lLnByb3RvdHlwZS5hZnRlcj1mdW5jdGlvbihlLG4pe3QuUGlwZWxpbmUud2FybklmRnVuY3Rpb25Ob3RSZWdpc3RlcmVkKG4pO3ZhciBpPXRoaXMuX3N0YWNrLmluZGV4T2YoZSk7aWYoLTE9PWkpdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgZXhpc3RpbmdGblwiKTtpKz0xLHRoaXMuX3N0YWNrLnNwbGljZShpLDAsbil9LHQuUGlwZWxpbmUucHJvdG90eXBlLmJlZm9yZT1mdW5jdGlvbihlLG4pe3QuUGlwZWxpbmUud2FybklmRnVuY3Rpb25Ob3RSZWdpc3RlcmVkKG4pO3ZhciBpPXRoaXMuX3N0YWNrLmluZGV4T2YoZSk7aWYoLTE9PWkpdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgZXhpc3RpbmdGblwiKTt0aGlzLl9zdGFjay5zcGxpY2UoaSwwLG4pfSx0LlBpcGVsaW5lLnByb3RvdHlwZS5yZW1vdmU9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fc3RhY2suaW5kZXhPZih0KTstMSE9ZSYmdGhpcy5fc3RhY2suc3BsaWNlKGUsMSl9LHQuUGlwZWxpbmUucHJvdG90eXBlLnJ1bj1mdW5jdGlvbih0KXtmb3IodmFyIGU9W10sbj10Lmxlbmd0aCxpPXRoaXMuX3N0YWNrLmxlbmd0aCxyPTA7bj5yO3IrKyl7Zm9yKHZhciBvPXRbcl0scz0wO2k+cyYmKG89dGhpcy5fc3RhY2tbc10obyxyLHQpLHZvaWQgMCE9PW8mJlwiXCIhPT1vKTtzKyspO3ZvaWQgMCE9PW8mJlwiXCIhPT1vJiZlLnB1c2gobyl9cmV0dXJuIGV9LHQuUGlwZWxpbmUucHJvdG90eXBlLnJlc2V0PWZ1bmN0aW9uKCl7dGhpcy5fc3RhY2s9W119LHQuUGlwZWxpbmUucHJvdG90eXBlLnRvSlNPTj1mdW5jdGlvbigpe3JldHVybiB0aGlzLl9zdGFjay5tYXAoZnVuY3Rpb24oZSl7cmV0dXJuIHQuUGlwZWxpbmUud2FybklmRnVuY3Rpb25Ob3RSZWdpc3RlcmVkKGUpLGUubGFiZWx9KX0sdC5WZWN0b3I9ZnVuY3Rpb24oKXt0aGlzLl9tYWduaXR1ZGU9bnVsbCx0aGlzLmxpc3Q9dm9pZCAwLHRoaXMubGVuZ3RoPTB9LHQuVmVjdG9yLk5vZGU9ZnVuY3Rpb24odCxlLG4pe3RoaXMuaWR4PXQsdGhpcy52YWw9ZSx0aGlzLm5leHQ9bn0sdC5WZWN0b3IucHJvdG90eXBlLmluc2VydD1mdW5jdGlvbihlLG4pe3RoaXMuX21hZ25pdHVkZT12b2lkIDA7dmFyIGk9dGhpcy5saXN0O2lmKCFpKXJldHVybiB0aGlzLmxpc3Q9bmV3IHQuVmVjdG9yLk5vZGUoZSxuLGkpLHRoaXMubGVuZ3RoKys7aWYoZTxpLmlkeClyZXR1cm4gdGhpcy5saXN0PW5ldyB0LlZlY3Rvci5Ob2RlKGUsbixpKSx0aGlzLmxlbmd0aCsrO2Zvcih2YXIgcj1pLG89aS5uZXh0O3ZvaWQgMCE9bzspe2lmKGU8by5pZHgpcmV0dXJuIHIubmV4dD1uZXcgdC5WZWN0b3IuTm9kZShlLG4sbyksdGhpcy5sZW5ndGgrKztyPW8sbz1vLm5leHR9cmV0dXJuIHIubmV4dD1uZXcgdC5WZWN0b3IuTm9kZShlLG4sbyksdGhpcy5sZW5ndGgrK30sdC5WZWN0b3IucHJvdG90eXBlLm1hZ25pdHVkZT1mdW5jdGlvbigpe2lmKHRoaXMuX21hZ25pdHVkZSlyZXR1cm4gdGhpcy5fbWFnbml0dWRlO2Zvcih2YXIgdCxlPXRoaXMubGlzdCxuPTA7ZTspdD1lLnZhbCxuKz10KnQsZT1lLm5leHQ7cmV0dXJuIHRoaXMuX21hZ25pdHVkZT1NYXRoLnNxcnQobil9LHQuVmVjdG9yLnByb3RvdHlwZS5kb3Q9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPXRoaXMubGlzdCxuPXQubGlzdCxpPTA7ZSYmbjspZS5pZHg8bi5pZHg/ZT1lLm5leHQ6ZS5pZHg+bi5pZHg/bj1uLm5leHQ6KGkrPWUudmFsKm4udmFsLGU9ZS5uZXh0LG49bi5uZXh0KTtyZXR1cm4gaX0sdC5WZWN0b3IucHJvdG90eXBlLnNpbWlsYXJpdHk9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuZG90KHQpLyh0aGlzLm1hZ25pdHVkZSgpKnQubWFnbml0dWRlKCkpfSx0LlNvcnRlZFNldD1mdW5jdGlvbigpe3RoaXMubGVuZ3RoPTAsdGhpcy5lbGVtZW50cz1bXX0sdC5Tb3J0ZWRTZXQubG9hZD1mdW5jdGlvbih0KXt2YXIgZT1uZXcgdGhpcztyZXR1cm4gZS5lbGVtZW50cz10LGUubGVuZ3RoPXQubGVuZ3RoLGV9LHQuU29ydGVkU2V0LnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24oKXt2YXIgdCxlO2Zvcih0PTA7dDxhcmd1bWVudHMubGVuZ3RoO3QrKyllPWFyZ3VtZW50c1t0XSx+dGhpcy5pbmRleE9mKGUpfHx0aGlzLmVsZW1lbnRzLnNwbGljZSh0aGlzLmxvY2F0aW9uRm9yKGUpLDAsZSk7dGhpcy5sZW5ndGg9dGhpcy5lbGVtZW50cy5sZW5ndGh9LHQuU29ydGVkU2V0LnByb3RvdHlwZS50b0FycmF5PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZWxlbWVudHMuc2xpY2UoKX0sdC5Tb3J0ZWRTZXQucHJvdG90eXBlLm1hcD1mdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLmVsZW1lbnRzLm1hcCh0LGUpfSx0LlNvcnRlZFNldC5wcm90b3R5cGUuZm9yRWFjaD1mdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLmVsZW1lbnRzLmZvckVhY2godCxlKX0sdC5Tb3J0ZWRTZXQucHJvdG90eXBlLmluZGV4T2Y9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTAsbj10aGlzLmVsZW1lbnRzLmxlbmd0aCxpPW4tZSxyPWUrTWF0aC5mbG9vcihpLzIpLG89dGhpcy5lbGVtZW50c1tyXTtpPjE7KXtpZihvPT09dClyZXR1cm4gcjt0Pm8mJihlPXIpLG8+dCYmKG49ciksaT1uLWUscj1lK01hdGguZmxvb3IoaS8yKSxvPXRoaXMuZWxlbWVudHNbcl19cmV0dXJuIG89PT10P3I6LTF9LHQuU29ydGVkU2V0LnByb3RvdHlwZS5sb2NhdGlvbkZvcj1mdW5jdGlvbih0KXtmb3IodmFyIGU9MCxuPXRoaXMuZWxlbWVudHMubGVuZ3RoLGk9bi1lLHI9ZStNYXRoLmZsb29yKGkvMiksbz10aGlzLmVsZW1lbnRzW3JdO2k+MTspdD5vJiYoZT1yKSxvPnQmJihuPXIpLGk9bi1lLHI9ZStNYXRoLmZsb29yKGkvMiksbz10aGlzLmVsZW1lbnRzW3JdO3JldHVybiBvPnQ/cjp0Pm8/cisxOnZvaWQgMH0sdC5Tb3J0ZWRTZXQucHJvdG90eXBlLmludGVyc2VjdD1mdW5jdGlvbihlKXtmb3IodmFyIG49bmV3IHQuU29ydGVkU2V0LGk9MCxyPTAsbz10aGlzLmxlbmd0aCxzPWUubGVuZ3RoLGE9dGhpcy5lbGVtZW50cyxoPWUuZWxlbWVudHM7Oyl7aWYoaT5vLTF8fHI+cy0xKWJyZWFrO2FbaV0hPT1oW3JdP2FbaV08aFtyXT9pKys6YVtpXT5oW3JdJiZyKys6KG4uYWRkKGFbaV0pLGkrKyxyKyspfXJldHVybiBufSx0LlNvcnRlZFNldC5wcm90b3R5cGUuY2xvbmU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgdC5Tb3J0ZWRTZXQ7cmV0dXJuIGUuZWxlbWVudHM9dGhpcy50b0FycmF5KCksZS5sZW5ndGg9ZS5lbGVtZW50cy5sZW5ndGgsZX0sdC5Tb3J0ZWRTZXQucHJvdG90eXBlLnVuaW9uPWZ1bmN0aW9uKHQpe3ZhciBlLG4saTt0aGlzLmxlbmd0aD49dC5sZW5ndGg/KGU9dGhpcyxuPXQpOihlPXQsbj10aGlzKSxpPWUuY2xvbmUoKTtmb3IodmFyIHI9MCxvPW4udG9BcnJheSgpO3I8by5sZW5ndGg7cisrKWkuYWRkKG9bcl0pO3JldHVybiBpfSx0LlNvcnRlZFNldC5wcm90b3R5cGUudG9KU09OPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudG9BcnJheSgpfSx0LkluZGV4PWZ1bmN0aW9uKCl7dGhpcy5fZmllbGRzPVtdLHRoaXMuX3JlZj1cImlkXCIsdGhpcy5waXBlbGluZT1uZXcgdC5QaXBlbGluZSx0aGlzLmRvY3VtZW50U3RvcmU9bmV3IHQuU3RvcmUsdGhpcy50b2tlblN0b3JlPW5ldyB0LlRva2VuU3RvcmUsdGhpcy5jb3JwdXNUb2tlbnM9bmV3IHQuU29ydGVkU2V0LHRoaXMuZXZlbnRFbWl0dGVyPW5ldyB0LkV2ZW50RW1pdHRlcix0aGlzLnRva2VuaXplckZuPXQudG9rZW5pemVyLHRoaXMuX2lkZkNhY2hlPXt9LHRoaXMub24oXCJhZGRcIixcInJlbW92ZVwiLFwidXBkYXRlXCIsZnVuY3Rpb24oKXt0aGlzLl9pZGZDYWNoZT17fX0uYmluZCh0aGlzKSl9LHQuSW5kZXgucHJvdG90eXBlLm9uPWZ1bmN0aW9uKCl7dmFyIHQ9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtyZXR1cm4gdGhpcy5ldmVudEVtaXR0ZXIuYWRkTGlzdGVuZXIuYXBwbHkodGhpcy5ldmVudEVtaXR0ZXIsdCl9LHQuSW5kZXgucHJvdG90eXBlLm9mZj1mdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLmV2ZW50RW1pdHRlci5yZW1vdmVMaXN0ZW5lcih0LGUpfSx0LkluZGV4LmxvYWQ9ZnVuY3Rpb24oZSl7ZS52ZXJzaW9uIT09dC52ZXJzaW9uJiZ0LnV0aWxzLndhcm4oXCJ2ZXJzaW9uIG1pc21hdGNoOiBjdXJyZW50IFwiK3QudmVyc2lvbitcIiBpbXBvcnRpbmcgXCIrZS52ZXJzaW9uKTt2YXIgbj1uZXcgdGhpcztyZXR1cm4gbi5fZmllbGRzPWUuZmllbGRzLG4uX3JlZj1lLnJlZixuLnRva2VuaXplcih0LnRva2VuaXplci5sb2FkKGUudG9rZW5pemVyKSksbi5kb2N1bWVudFN0b3JlPXQuU3RvcmUubG9hZChlLmRvY3VtZW50U3RvcmUpLG4udG9rZW5TdG9yZT10LlRva2VuU3RvcmUubG9hZChlLnRva2VuU3RvcmUpLG4uY29ycHVzVG9rZW5zPXQuU29ydGVkU2V0LmxvYWQoZS5jb3JwdXNUb2tlbnMpLG4ucGlwZWxpbmU9dC5QaXBlbGluZS5sb2FkKGUucGlwZWxpbmUpLG59LHQuSW5kZXgucHJvdG90eXBlLmZpZWxkPWZ1bmN0aW9uKHQsZSl7dmFyIGU9ZXx8e30sbj17bmFtZTp0LGJvb3N0OmUuYm9vc3R8fDF9O3JldHVybiB0aGlzLl9maWVsZHMucHVzaChuKSx0aGlzfSx0LkluZGV4LnByb3RvdHlwZS5yZWY9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX3JlZj10LHRoaXN9LHQuSW5kZXgucHJvdG90eXBlLnRva2VuaXplcj1mdW5jdGlvbihlKXt2YXIgbj1lLmxhYmVsJiZlLmxhYmVsIGluIHQudG9rZW5pemVyLnJlZ2lzdGVyZWRGdW5jdGlvbnM7cmV0dXJuIG58fHQudXRpbHMud2FybihcIkZ1bmN0aW9uIGlzIG5vdCBhIHJlZ2lzdGVyZWQgdG9rZW5pemVyLiBUaGlzIG1heSBjYXVzZSBwcm9ibGVtcyB3aGVuIHNlcmlhbGlzaW5nIHRoZSBpbmRleFwiKSx0aGlzLnRva2VuaXplckZuPWUsdGhpc30sdC5JbmRleC5wcm90b3R5cGUuYWRkPWZ1bmN0aW9uKGUsbil7dmFyIGk9e30scj1uZXcgdC5Tb3J0ZWRTZXQsbz1lW3RoaXMuX3JlZl0sbj12b2lkIDA9PT1uPyEwOm47dGhpcy5fZmllbGRzLmZvckVhY2goZnVuY3Rpb24odCl7dmFyIG49dGhpcy5waXBlbGluZS5ydW4odGhpcy50b2tlbml6ZXJGbihlW3QubmFtZV0pKTtpW3QubmFtZV09bjtmb3IodmFyIG89MDtvPG4ubGVuZ3RoO28rKyl7dmFyIHM9bltvXTtyLmFkZChzKSx0aGlzLmNvcnB1c1Rva2Vucy5hZGQocyl9fSx0aGlzKSx0aGlzLmRvY3VtZW50U3RvcmUuc2V0KG8scik7Zm9yKHZhciBzPTA7czxyLmxlbmd0aDtzKyspe2Zvcih2YXIgYT1yLmVsZW1lbnRzW3NdLGg9MCx1PTA7dTx0aGlzLl9maWVsZHMubGVuZ3RoO3UrKyl7dmFyIGw9dGhpcy5fZmllbGRzW3VdLGM9aVtsLm5hbWVdLGY9Yy5sZW5ndGg7aWYoZil7Zm9yKHZhciBkPTAscD0wO2Y+cDtwKyspY1twXT09PWEmJmQrKztoKz1kL2YqbC5ib29zdH19dGhpcy50b2tlblN0b3JlLmFkZChhLHtyZWY6byx0ZjpofSl9biYmdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChcImFkZFwiLGUsdGhpcyl9LHQuSW5kZXgucHJvdG90eXBlLnJlbW92ZT1mdW5jdGlvbih0LGUpe3ZhciBuPXRbdGhpcy5fcmVmXSxlPXZvaWQgMD09PWU/ITA6ZTtpZih0aGlzLmRvY3VtZW50U3RvcmUuaGFzKG4pKXt2YXIgaT10aGlzLmRvY3VtZW50U3RvcmUuZ2V0KG4pO3RoaXMuZG9jdW1lbnRTdG9yZS5yZW1vdmUobiksaS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3RoaXMudG9rZW5TdG9yZS5yZW1vdmUodCxuKX0sdGhpcyksZSYmdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChcInJlbW92ZVwiLHQsdGhpcyl9fSx0LkluZGV4LnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24odCxlKXt2YXIgZT12b2lkIDA9PT1lPyEwOmU7dGhpcy5yZW1vdmUodCwhMSksdGhpcy5hZGQodCwhMSksZSYmdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChcInVwZGF0ZVwiLHQsdGhpcyl9LHQuSW5kZXgucHJvdG90eXBlLmlkZj1mdW5jdGlvbih0KXt2YXIgZT1cIkBcIit0O2lmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9pZGZDYWNoZSxlKSlyZXR1cm4gdGhpcy5faWRmQ2FjaGVbZV07dmFyIG49dGhpcy50b2tlblN0b3JlLmNvdW50KHQpLGk9MTtyZXR1cm4gbj4wJiYoaT0xK01hdGgubG9nKHRoaXMuZG9jdW1lbnRTdG9yZS5sZW5ndGgvbikpLHRoaXMuX2lkZkNhY2hlW2VdPWl9LHQuSW5kZXgucHJvdG90eXBlLnNlYXJjaD1mdW5jdGlvbihlKXt2YXIgbj10aGlzLnBpcGVsaW5lLnJ1bih0aGlzLnRva2VuaXplckZuKGUpKSxpPW5ldyB0LlZlY3RvcixyPVtdLG89dGhpcy5fZmllbGRzLnJlZHVjZShmdW5jdGlvbih0LGUpe3JldHVybiB0K2UuYm9vc3R9LDApLHM9bi5zb21lKGZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLnRva2VuU3RvcmUuaGFzKHQpfSx0aGlzKTtpZighcylyZXR1cm5bXTtuLmZvckVhY2goZnVuY3Rpb24oZSxuLHMpe3ZhciBhPTEvcy5sZW5ndGgqdGhpcy5fZmllbGRzLmxlbmd0aCpvLGg9dGhpcyx1PXRoaXMudG9rZW5TdG9yZS5leHBhbmQoZSkucmVkdWNlKGZ1bmN0aW9uKG4scil7dmFyIG89aC5jb3JwdXNUb2tlbnMuaW5kZXhPZihyKSxzPWguaWRmKHIpLHU9MSxsPW5ldyB0LlNvcnRlZFNldDtpZihyIT09ZSl7dmFyIGM9TWF0aC5tYXgoMyxyLmxlbmd0aC1lLmxlbmd0aCk7dT0xL01hdGgubG9nKGMpfW8+LTEmJmkuaW5zZXJ0KG8sYSpzKnUpO2Zvcih2YXIgZj1oLnRva2VuU3RvcmUuZ2V0KHIpLGQ9T2JqZWN0LmtleXMoZikscD1kLmxlbmd0aCx2PTA7cD52O3YrKylsLmFkZChmW2Rbdl1dLnJlZik7cmV0dXJuIG4udW5pb24obCl9LG5ldyB0LlNvcnRlZFNldCk7ci5wdXNoKHUpfSx0aGlzKTt2YXIgYT1yLnJlZHVjZShmdW5jdGlvbih0LGUpe3JldHVybiB0LmludGVyc2VjdChlKX0pO3JldHVybiBhLm1hcChmdW5jdGlvbih0KXtyZXR1cm57cmVmOnQsc2NvcmU6aS5zaW1pbGFyaXR5KHRoaXMuZG9jdW1lbnRWZWN0b3IodCkpfX0sdGhpcykuc29ydChmdW5jdGlvbih0LGUpe3JldHVybiBlLnNjb3JlLXQuc2NvcmV9KX0sdC5JbmRleC5wcm90b3R5cGUuZG9jdW1lbnRWZWN0b3I9ZnVuY3Rpb24oZSl7Zm9yKHZhciBuPXRoaXMuZG9jdW1lbnRTdG9yZS5nZXQoZSksaT1uLmxlbmd0aCxyPW5ldyB0LlZlY3RvcixvPTA7aT5vO28rKyl7dmFyIHM9bi5lbGVtZW50c1tvXSxhPXRoaXMudG9rZW5TdG9yZS5nZXQocylbZV0udGYsaD10aGlzLmlkZihzKTtyLmluc2VydCh0aGlzLmNvcnB1c1Rva2Vucy5pbmRleE9mKHMpLGEqaCl9cmV0dXJuIHJ9LHQuSW5kZXgucHJvdG90eXBlLnRvSlNPTj1mdW5jdGlvbigpe3JldHVybnt2ZXJzaW9uOnQudmVyc2lvbixmaWVsZHM6dGhpcy5fZmllbGRzLHJlZjp0aGlzLl9yZWYsdG9rZW5pemVyOnRoaXMudG9rZW5pemVyRm4ubGFiZWwsZG9jdW1lbnRTdG9yZTp0aGlzLmRvY3VtZW50U3RvcmUudG9KU09OKCksdG9rZW5TdG9yZTp0aGlzLnRva2VuU3RvcmUudG9KU09OKCksY29ycHVzVG9rZW5zOnRoaXMuY29ycHVzVG9rZW5zLnRvSlNPTigpLHBpcGVsaW5lOnRoaXMucGlwZWxpbmUudG9KU09OKCl9fSx0LkluZGV4LnByb3RvdHlwZS51c2U9ZnVuY3Rpb24odCl7dmFyIGU9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDEpO2UudW5zaGlmdCh0aGlzKSx0LmFwcGx5KHRoaXMsZSl9LHQuU3RvcmU9ZnVuY3Rpb24oKXt0aGlzLnN0b3JlPXt9LHRoaXMubGVuZ3RoPTB9LHQuU3RvcmUubG9hZD1mdW5jdGlvbihlKXt2YXIgbj1uZXcgdGhpcztyZXR1cm4gbi5sZW5ndGg9ZS5sZW5ndGgsbi5zdG9yZT1PYmplY3Qua2V5cyhlLnN0b3JlKS5yZWR1Y2UoZnVuY3Rpb24obixpKXtyZXR1cm4gbltpXT10LlNvcnRlZFNldC5sb2FkKGUuc3RvcmVbaV0pLG59LHt9KSxufSx0LlN0b3JlLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24odCxlKXt0aGlzLmhhcyh0KXx8dGhpcy5sZW5ndGgrKyx0aGlzLnN0b3JlW3RdPWV9LHQuU3RvcmUucHJvdG90eXBlLmdldD1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5zdG9yZVt0XX0sdC5TdG9yZS5wcm90b3R5cGUuaGFzPWZ1bmN0aW9uKHQpe3JldHVybiB0IGluIHRoaXMuc3RvcmV9LHQuU3RvcmUucHJvdG90eXBlLnJlbW92ZT1mdW5jdGlvbih0KXt0aGlzLmhhcyh0KSYmKGRlbGV0ZSB0aGlzLnN0b3JlW3RdLHRoaXMubGVuZ3RoLS0pfSx0LlN0b3JlLnByb3RvdHlwZS50b0pTT049ZnVuY3Rpb24oKXtyZXR1cm57c3RvcmU6dGhpcy5zdG9yZSxsZW5ndGg6dGhpcy5sZW5ndGh9fSx0LnN0ZW1tZXI9ZnVuY3Rpb24oKXt2YXIgdD17YXRpb25hbDpcImF0ZVwiLHRpb25hbDpcInRpb25cIixlbmNpOlwiZW5jZVwiLGFuY2k6XCJhbmNlXCIsaXplcjpcIml6ZVwiLGJsaTpcImJsZVwiLGFsbGk6XCJhbFwiLGVudGxpOlwiZW50XCIsZWxpOlwiZVwiLG91c2xpOlwib3VzXCIsaXphdGlvbjpcIml6ZVwiLGF0aW9uOlwiYXRlXCIsYXRvcjpcImF0ZVwiLGFsaXNtOlwiYWxcIixpdmVuZXNzOlwiaXZlXCIsZnVsbmVzczpcImZ1bFwiLG91c25lc3M6XCJvdXNcIixhbGl0aTpcImFsXCIsaXZpdGk6XCJpdmVcIixiaWxpdGk6XCJibGVcIixsb2dpOlwibG9nXCJ9LGU9e2ljYXRlOlwiaWNcIixhdGl2ZTpcIlwiLGFsaXplOlwiYWxcIixpY2l0aTpcImljXCIsaWNhbDpcImljXCIsZnVsOlwiXCIsbmVzczpcIlwifSxuPVwiW15hZWlvdV1cIixpPVwiW2FlaW91eV1cIixyPW4rXCJbXmFlaW91eV0qXCIsbz1pK1wiW2FlaW91XSpcIixzPVwiXihcIityK1wiKT9cIitvK3IsYT1cIl4oXCIrcitcIik/XCIrbytyK1wiKFwiK28rXCIpPyRcIixoPVwiXihcIityK1wiKT9cIitvK3IrbytyLHU9XCJeKFwiK3IrXCIpP1wiK2ksbD1uZXcgUmVnRXhwKHMpLGM9bmV3IFJlZ0V4cChoKSxmPW5ldyBSZWdFeHAoYSksZD1uZXcgUmVnRXhwKHUpLHA9L14oLis/KShzc3xpKWVzJC8sdj0vXiguKz8pKFtec10pcyQvLGc9L14oLis/KWVlZCQvLG09L14oLis/KShlZHxpbmcpJC8seT0vLiQvLFM9LyhhdHxibHxpeikkLyx3PW5ldyBSZWdFeHAoXCIoW15hZWlvdXlsc3pdKVxcXFwxJFwiKSxrPW5ldyBSZWdFeHAoXCJeXCIrcitpK1wiW15hZWlvdXd4eV0kXCIpLHg9L14oLis/W15hZWlvdV0peSQvLGI9L14oLis/KShhdGlvbmFsfHRpb25hbHxlbmNpfGFuY2l8aXplcnxibGl8YWxsaXxlbnRsaXxlbGl8b3VzbGl8aXphdGlvbnxhdGlvbnxhdG9yfGFsaXNtfGl2ZW5lc3N8ZnVsbmVzc3xvdXNuZXNzfGFsaXRpfGl2aXRpfGJpbGl0aXxsb2dpKSQvLEU9L14oLis/KShpY2F0ZXxhdGl2ZXxhbGl6ZXxpY2l0aXxpY2FsfGZ1bHxuZXNzKSQvLEY9L14oLis/KShhbHxhbmNlfGVuY2V8ZXJ8aWN8YWJsZXxpYmxlfGFudHxlbWVudHxtZW50fGVudHxvdXxpc218YXRlfGl0aXxvdXN8aXZlfGl6ZSkkLyxfPS9eKC4rPykoc3x0KShpb24pJC8sej0vXiguKz8pZSQvLE89L2xsJC8sUD1uZXcgUmVnRXhwKFwiXlwiK3IraStcIlteYWVpb3V3eHldJFwiKSxUPWZ1bmN0aW9uKG4pe3ZhciBpLHIsbyxzLGEsaCx1O2lmKG4ubGVuZ3RoPDMpcmV0dXJuIG47aWYobz1uLnN1YnN0cigwLDEpLFwieVwiPT1vJiYobj1vLnRvVXBwZXJDYXNlKCkrbi5zdWJzdHIoMSkpLHM9cCxhPXYscy50ZXN0KG4pP249bi5yZXBsYWNlKHMsXCIkMSQyXCIpOmEudGVzdChuKSYmKG49bi5yZXBsYWNlKGEsXCIkMSQyXCIpKSxzPWcsYT1tLHMudGVzdChuKSl7dmFyIFQ9cy5leGVjKG4pO3M9bCxzLnRlc3QoVFsxXSkmJihzPXksbj1uLnJlcGxhY2UocyxcIlwiKSl9ZWxzZSBpZihhLnRlc3Qobikpe3ZhciBUPWEuZXhlYyhuKTtpPVRbMV0sYT1kLGEudGVzdChpKSYmKG49aSxhPVMsaD13LHU9ayxhLnRlc3Qobik/bis9XCJlXCI6aC50ZXN0KG4pPyhzPXksbj1uLnJlcGxhY2UocyxcIlwiKSk6dS50ZXN0KG4pJiYobis9XCJlXCIpKX1pZihzPXgscy50ZXN0KG4pKXt2YXIgVD1zLmV4ZWMobik7aT1UWzFdLG49aStcImlcIn1pZihzPWIscy50ZXN0KG4pKXt2YXIgVD1zLmV4ZWMobik7aT1UWzFdLHI9VFsyXSxzPWwscy50ZXN0KGkpJiYobj1pK3Rbcl0pfWlmKHM9RSxzLnRlc3Qobikpe3ZhciBUPXMuZXhlYyhuKTtpPVRbMV0scj1UWzJdLHM9bCxzLnRlc3QoaSkmJihuPWkrZVtyXSl9aWYocz1GLGE9XyxzLnRlc3Qobikpe3ZhciBUPXMuZXhlYyhuKTtpPVRbMV0scz1jLHMudGVzdChpKSYmKG49aSl9ZWxzZSBpZihhLnRlc3Qobikpe3ZhciBUPWEuZXhlYyhuKTtpPVRbMV0rVFsyXSxhPWMsYS50ZXN0KGkpJiYobj1pKX1pZihzPXoscy50ZXN0KG4pKXt2YXIgVD1zLmV4ZWMobik7aT1UWzFdLHM9YyxhPWYsaD1QLChzLnRlc3QoaSl8fGEudGVzdChpKSYmIWgudGVzdChpKSkmJihuPWkpfXJldHVybiBzPU8sYT1jLHMudGVzdChuKSYmYS50ZXN0KG4pJiYocz15LG49bi5yZXBsYWNlKHMsXCJcIikpLFwieVwiPT1vJiYobj1vLnRvTG93ZXJDYXNlKCkrbi5zdWJzdHIoMSkpLG59O3JldHVybiBUfSgpLHQuUGlwZWxpbmUucmVnaXN0ZXJGdW5jdGlvbih0LnN0ZW1tZXIsXCJzdGVtbWVyXCIpLHQuZ2VuZXJhdGVTdG9wV29yZEZpbHRlcj1mdW5jdGlvbih0KXt2YXIgZT10LnJlZHVjZShmdW5jdGlvbih0LGUpe3JldHVybiB0W2VdPWUsdH0se30pO3JldHVybiBmdW5jdGlvbih0KXtyZXR1cm4gdCYmZVt0XSE9PXQ/dDp2b2lkIDB9fSx0LnN0b3BXb3JkRmlsdGVyPXQuZ2VuZXJhdGVTdG9wV29yZEZpbHRlcihbXCJhXCIsXCJhYmxlXCIsXCJhYm91dFwiLFwiYWNyb3NzXCIsXCJhZnRlclwiLFwiYWxsXCIsXCJhbG1vc3RcIixcImFsc29cIixcImFtXCIsXCJhbW9uZ1wiLFwiYW5cIixcImFuZFwiLFwiYW55XCIsXCJhcmVcIixcImFzXCIsXCJhdFwiLFwiYmVcIixcImJlY2F1c2VcIixcImJlZW5cIixcImJ1dFwiLFwiYnlcIixcImNhblwiLFwiY2Fubm90XCIsXCJjb3VsZFwiLFwiZGVhclwiLFwiZGlkXCIsXCJkb1wiLFwiZG9lc1wiLFwiZWl0aGVyXCIsXCJlbHNlXCIsXCJldmVyXCIsXCJldmVyeVwiLFwiZm9yXCIsXCJmcm9tXCIsXCJnZXRcIixcImdvdFwiLFwiaGFkXCIsXCJoYXNcIixcImhhdmVcIixcImhlXCIsXCJoZXJcIixcImhlcnNcIixcImhpbVwiLFwiaGlzXCIsXCJob3dcIixcImhvd2V2ZXJcIixcImlcIixcImlmXCIsXCJpblwiLFwiaW50b1wiLFwiaXNcIixcIml0XCIsXCJpdHNcIixcImp1c3RcIixcImxlYXN0XCIsXCJsZXRcIixcImxpa2VcIixcImxpa2VseVwiLFwibWF5XCIsXCJtZVwiLFwibWlnaHRcIixcIm1vc3RcIixcIm11c3RcIixcIm15XCIsXCJuZWl0aGVyXCIsXCJub1wiLFwibm9yXCIsXCJub3RcIixcIm9mXCIsXCJvZmZcIixcIm9mdGVuXCIsXCJvblwiLFwib25seVwiLFwib3JcIixcIm90aGVyXCIsXCJvdXJcIixcIm93blwiLFwicmF0aGVyXCIsXCJzYWlkXCIsXCJzYXlcIixcInNheXNcIixcInNoZVwiLFwic2hvdWxkXCIsXCJzaW5jZVwiLFwic29cIixcInNvbWVcIixcInRoYW5cIixcInRoYXRcIixcInRoZVwiLFwidGhlaXJcIixcInRoZW1cIixcInRoZW5cIixcInRoZXJlXCIsXCJ0aGVzZVwiLFwidGhleVwiLFwidGhpc1wiLFwidGlzXCIsXCJ0b1wiLFwidG9vXCIsXCJ0d2FzXCIsXCJ1c1wiLFwid2FudHNcIixcIndhc1wiLFwid2VcIixcIndlcmVcIixcIndoYXRcIixcIndoZW5cIixcIndoZXJlXCIsXCJ3aGljaFwiLFwid2hpbGVcIixcIndob1wiLFwid2hvbVwiLFwid2h5XCIsXCJ3aWxsXCIsXCJ3aXRoXCIsXCJ3b3VsZFwiLFwieWV0XCIsXCJ5b3VcIixcInlvdXJcIl0pLHQuUGlwZWxpbmUucmVnaXN0ZXJGdW5jdGlvbih0LnN0b3BXb3JkRmlsdGVyLFwic3RvcFdvcmRGaWx0ZXJcIiksdC50cmltbWVyPWZ1bmN0aW9uKHQpe3JldHVybiB0LnJlcGxhY2UoL15cXFcrLyxcIlwiKS5yZXBsYWNlKC9cXFcrJC8sXCJcIil9LHQuUGlwZWxpbmUucmVnaXN0ZXJGdW5jdGlvbih0LnRyaW1tZXIsXCJ0cmltbWVyXCIpLHQuVG9rZW5TdG9yZT1mdW5jdGlvbigpe3RoaXMucm9vdD17ZG9jczp7fX0sdGhpcy5sZW5ndGg9MH0sdC5Ub2tlblN0b3JlLmxvYWQ9ZnVuY3Rpb24odCl7dmFyIGU9bmV3IHRoaXM7cmV0dXJuIGUucm9vdD10LnJvb3QsZS5sZW5ndGg9dC5sZW5ndGgsZX0sdC5Ub2tlblN0b3JlLnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24odCxlLG4pe3ZhciBuPW58fHRoaXMucm9vdCxpPXQuY2hhckF0KDApLHI9dC5zbGljZSgxKTtyZXR1cm4gaSBpbiBufHwobltpXT17ZG9jczp7fX0pLDA9PT1yLmxlbmd0aD8obltpXS5kb2NzW2UucmVmXT1lLHZvaWQodGhpcy5sZW5ndGgrPTEpKTp0aGlzLmFkZChyLGUsbltpXSl9LHQuVG9rZW5TdG9yZS5wcm90b3R5cGUuaGFzPWZ1bmN0aW9uKHQpe2lmKCF0KXJldHVybiExO2Zvcih2YXIgZT10aGlzLnJvb3Qsbj0wO248dC5sZW5ndGg7bisrKXtpZighZVt0LmNoYXJBdChuKV0pcmV0dXJuITE7ZT1lW3QuY2hhckF0KG4pXX1yZXR1cm4hMH0sdC5Ub2tlblN0b3JlLnByb3RvdHlwZS5nZXROb2RlPWZ1bmN0aW9uKHQpe2lmKCF0KXJldHVybnt9O2Zvcih2YXIgZT10aGlzLnJvb3Qsbj0wO248dC5sZW5ndGg7bisrKXtpZighZVt0LmNoYXJBdChuKV0pcmV0dXJue307ZT1lW3QuY2hhckF0KG4pXX1yZXR1cm4gZX0sdC5Ub2tlblN0b3JlLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5nZXROb2RlKHQsZSkuZG9jc3x8e319LHQuVG9rZW5TdG9yZS5wcm90b3R5cGUuY291bnQ9ZnVuY3Rpb24odCxlKXtyZXR1cm4gT2JqZWN0LmtleXModGhpcy5nZXQodCxlKSkubGVuZ3RofSx0LlRva2VuU3RvcmUucHJvdG90eXBlLnJlbW92ZT1mdW5jdGlvbih0LGUpe2lmKHQpe2Zvcih2YXIgbj10aGlzLnJvb3QsaT0wO2k8dC5sZW5ndGg7aSsrKXtpZighKHQuY2hhckF0KGkpaW4gbikpcmV0dXJuO249blt0LmNoYXJBdChpKV19ZGVsZXRlIG4uZG9jc1tlXX19LHQuVG9rZW5TdG9yZS5wcm90b3R5cGUuZXhwYW5kPWZ1bmN0aW9uKHQsZSl7dmFyIG49dGhpcy5nZXROb2RlKHQpLGk9bi5kb2NzfHx7fSxlPWV8fFtdO3JldHVybiBPYmplY3Qua2V5cyhpKS5sZW5ndGgmJmUucHVzaCh0KSxPYmplY3Qua2V5cyhuKS5mb3JFYWNoKGZ1bmN0aW9uKG4pe1wiZG9jc1wiIT09biYmZS5jb25jYXQodGhpcy5leHBhbmQodCtuLGUpKX0sdGhpcyksZX0sdC5Ub2tlblN0b3JlLnByb3RvdHlwZS50b0pTT049ZnVuY3Rpb24oKXtyZXR1cm57cm9vdDp0aGlzLnJvb3QsbGVuZ3RoOnRoaXMubGVuZ3RofX0sZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKGUpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKTp0Lmx1bnI9ZSgpfSh0aGlzLGZ1bmN0aW9uKCl7cmV0dXJuIHR9KX0oKTsiLCIvKipcclxuKiBzaW1wbGVQYWdpbmF0aW9uLmpzIHYxLjZcclxuKiBBIHNpbXBsZSBqUXVlcnkgcGFnaW5hdGlvbiBwbHVnaW4uXHJcbiogaHR0cDovL2ZsYXZpdXNtYXRpcy5naXRodWIuY29tL3NpbXBsZVBhZ2luYXRpb24uanMvXHJcbipcclxuKiBDb3B5cmlnaHQgMjAxMiwgRmxhdml1cyBNYXRpc1xyXG4qIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cclxuKiBodHRwOi8vZmxhdml1c21hdGlzLmdpdGh1Yi5jb20vbGljZW5zZS5odG1sXHJcbiovXHJcblxyXG4oZnVuY3Rpb24oJCl7XHJcblxyXG5cdHZhciBtZXRob2RzID0ge1xyXG5cdFx0aW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xyXG5cdFx0XHR2YXIgbyA9ICQuZXh0ZW5kKHtcclxuXHRcdFx0XHRpdGVtczogMSxcclxuXHRcdFx0XHRpdGVtc09uUGFnZTogMSxcclxuXHRcdFx0XHRwYWdlczogMCxcclxuXHRcdFx0XHRkaXNwbGF5ZWRQYWdlczogNSxcclxuXHRcdFx0XHRlZGdlczogMixcclxuXHRcdFx0XHRjdXJyZW50UGFnZTogMCxcclxuXHRcdFx0XHRocmVmVGV4dFByZWZpeDogJyNwYWdlLScsXHJcblx0XHRcdFx0aHJlZlRleHRTdWZmaXg6ICcnLFxyXG5cdFx0XHRcdHByZXZUZXh0OiAnUHJldicsXHJcblx0XHRcdFx0bmV4dFRleHQ6ICdOZXh0JyxcclxuXHRcdFx0XHRlbGxpcHNlVGV4dDogJyZoZWxsaXA7JyxcclxuXHRcdFx0XHRlbGxpcHNlUGFnZVNldDogdHJ1ZSxcclxuXHRcdFx0XHRjc3NTdHlsZTogJ2xpZ2h0LXRoZW1lJyxcclxuXHRcdFx0XHRsaXN0U3R5bGU6ICcnLFxyXG5cdFx0XHRcdGxhYmVsTWFwOiBbXSxcclxuXHRcdFx0XHRzZWxlY3RPbkNsaWNrOiB0cnVlLFxyXG5cdFx0XHRcdG5leHRBdEZyb250OiBmYWxzZSxcclxuXHRcdFx0XHRpbnZlcnRQYWdlT3JkZXI6IGZhbHNlLFxyXG5cdFx0XHRcdHVzZVN0YXJ0RWRnZSA6IHRydWUsXHJcblx0XHRcdFx0dXNlRW5kRWRnZSA6IHRydWUsXHJcblx0XHRcdFx0b25QYWdlQ2xpY2s6IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIGV2ZW50KSB7XHJcblx0XHRcdFx0XHQvLyBDYWxsYmFjayB0cmlnZ2VyZWQgd2hlbiBhIHBhZ2UgaXMgY2xpY2tlZFxyXG5cdFx0XHRcdFx0Ly8gUGFnZSBudW1iZXIgaXMgZ2l2ZW4gYXMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRvbkluaXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0Ly8gQ2FsbGJhY2sgdHJpZ2dlcmVkIGltbWVkaWF0ZWx5IGFmdGVyIGluaXRpYWxpemF0aW9uXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCBvcHRpb25zIHx8IHt9KTtcclxuXHJcblx0XHRcdHZhciBzZWxmID0gdGhpcztcclxuXHJcblx0XHRcdG8ucGFnZXMgPSBvLnBhZ2VzID8gby5wYWdlcyA6IE1hdGguY2VpbChvLml0ZW1zIC8gby5pdGVtc09uUGFnZSkgPyBNYXRoLmNlaWwoby5pdGVtcyAvIG8uaXRlbXNPblBhZ2UpIDogMTtcclxuXHRcdFx0aWYgKG8uY3VycmVudFBhZ2UpXHJcblx0XHRcdFx0by5jdXJyZW50UGFnZSA9IG8uY3VycmVudFBhZ2UgLSAxO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0by5jdXJyZW50UGFnZSA9ICFvLmludmVydFBhZ2VPcmRlciA/IDAgOiBvLnBhZ2VzIC0gMTtcclxuXHRcdFx0by5oYWxmRGlzcGxheWVkID0gby5kaXNwbGF5ZWRQYWdlcyAvIDI7XHJcblxyXG5cdFx0XHR0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0c2VsZi5hZGRDbGFzcyhvLmNzc1N0eWxlICsgJyBzaW1wbGUtcGFnaW5hdGlvbicpLmRhdGEoJ3BhZ2luYXRpb24nLCBvKTtcclxuXHRcdFx0XHRtZXRob2RzLl9kcmF3LmNhbGwoc2VsZik7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0by5vbkluaXQoKTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblx0XHRzZWxlY3RQYWdlOiBmdW5jdGlvbihwYWdlKSB7XHJcblx0XHRcdG1ldGhvZHMuX3NlbGVjdFBhZ2UuY2FsbCh0aGlzLCBwYWdlIC0gMSk7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblx0XHRwcmV2UGFnZTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBvID0gdGhpcy5kYXRhKCdwYWdpbmF0aW9uJyk7XHJcblx0XHRcdGlmICghby5pbnZlcnRQYWdlT3JkZXIpIHtcclxuXHRcdFx0XHRpZiAoby5jdXJyZW50UGFnZSA+IDApIHtcclxuXHRcdFx0XHRcdG1ldGhvZHMuX3NlbGVjdFBhZ2UuY2FsbCh0aGlzLCBvLmN1cnJlbnRQYWdlIC0gMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmIChvLmN1cnJlbnRQYWdlIDwgby5wYWdlcyAtIDEpIHtcclxuXHRcdFx0XHRcdG1ldGhvZHMuX3NlbGVjdFBhZ2UuY2FsbCh0aGlzLCBvLmN1cnJlbnRQYWdlICsgMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblx0XHRuZXh0UGFnZTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBvID0gdGhpcy5kYXRhKCdwYWdpbmF0aW9uJyk7XHJcblx0XHRcdGlmICghby5pbnZlcnRQYWdlT3JkZXIpIHtcclxuXHRcdFx0XHRpZiAoby5jdXJyZW50UGFnZSA8IG8ucGFnZXMgLSAxKSB7XHJcblx0XHRcdFx0XHRtZXRob2RzLl9zZWxlY3RQYWdlLmNhbGwodGhpcywgby5jdXJyZW50UGFnZSArIDEpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZiAoby5jdXJyZW50UGFnZSA+IDApIHtcclxuXHRcdFx0XHRcdG1ldGhvZHMuX3NlbGVjdFBhZ2UuY2FsbCh0aGlzLCBvLmN1cnJlbnRQYWdlIC0gMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblx0XHRnZXRQYWdlc0NvdW50OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZGF0YSgncGFnaW5hdGlvbicpLnBhZ2VzO1xyXG5cdFx0fSxcclxuXHJcblx0XHRzZXRQYWdlc0NvdW50OiBmdW5jdGlvbihjb3VudCkge1xyXG5cdFx0XHR0aGlzLmRhdGEoJ3BhZ2luYXRpb24nKS5wYWdlcyA9IGNvdW50O1xyXG5cdFx0fSxcclxuXHJcblx0XHRnZXRDdXJyZW50UGFnZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5kYXRhKCdwYWdpbmF0aW9uJykuY3VycmVudFBhZ2UgKyAxO1xyXG5cdFx0fSxcclxuXHJcblx0XHRkZXN0cm95OiBmdW5jdGlvbigpe1xyXG5cdFx0XHR0aGlzLmVtcHR5KCk7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblx0XHRkcmF3UGFnZTogZnVuY3Rpb24gKHBhZ2UpIHtcclxuXHRcdFx0dmFyIG8gPSB0aGlzLmRhdGEoJ3BhZ2luYXRpb24nKTtcclxuXHRcdFx0by5jdXJyZW50UGFnZSA9IHBhZ2UgLSAxO1xyXG5cdFx0XHR0aGlzLmRhdGEoJ3BhZ2luYXRpb24nLCBvKTtcclxuXHRcdFx0bWV0aG9kcy5fZHJhdy5jYWxsKHRoaXMpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblxyXG5cdFx0cmVkcmF3OiBmdW5jdGlvbigpe1xyXG5cdFx0XHRtZXRob2RzLl9kcmF3LmNhbGwodGhpcyk7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblx0XHRkaXNhYmxlOiBmdW5jdGlvbigpe1xyXG5cdFx0XHR2YXIgbyA9IHRoaXMuZGF0YSgncGFnaW5hdGlvbicpO1xyXG5cdFx0XHRvLmRpc2FibGVkID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5kYXRhKCdwYWdpbmF0aW9uJywgbyk7XHJcblx0XHRcdG1ldGhvZHMuX2RyYXcuY2FsbCh0aGlzKTtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHRcdGVuYWJsZTogZnVuY3Rpb24oKXtcclxuXHRcdFx0dmFyIG8gPSB0aGlzLmRhdGEoJ3BhZ2luYXRpb24nKTtcclxuXHRcdFx0by5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdFx0XHR0aGlzLmRhdGEoJ3BhZ2luYXRpb24nLCBvKTtcclxuXHRcdFx0bWV0aG9kcy5fZHJhdy5jYWxsKHRoaXMpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblxyXG5cdFx0dXBkYXRlSXRlbXM6IGZ1bmN0aW9uIChuZXdJdGVtcykge1xyXG5cdFx0XHR2YXIgbyA9IHRoaXMuZGF0YSgncGFnaW5hdGlvbicpO1xyXG5cdFx0XHRvLml0ZW1zID0gbmV3SXRlbXM7XHJcblx0XHRcdG8ucGFnZXMgPSBtZXRob2RzLl9nZXRQYWdlcyhvKTtcclxuXHRcdFx0dGhpcy5kYXRhKCdwYWdpbmF0aW9uJywgbyk7XHJcblx0XHRcdG1ldGhvZHMuX2RyYXcuY2FsbCh0aGlzKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0dXBkYXRlSXRlbXNPblBhZ2U6IGZ1bmN0aW9uIChpdGVtc09uUGFnZSkge1xyXG5cdFx0XHR2YXIgbyA9IHRoaXMuZGF0YSgncGFnaW5hdGlvbicpO1xyXG5cdFx0XHRvLml0ZW1zT25QYWdlID0gaXRlbXNPblBhZ2U7XHJcblx0XHRcdG8ucGFnZXMgPSBtZXRob2RzLl9nZXRQYWdlcyhvKTtcclxuXHRcdFx0dGhpcy5kYXRhKCdwYWdpbmF0aW9uJywgbyk7XHJcblx0XHRcdG1ldGhvZHMuX3NlbGVjdFBhZ2UuY2FsbCh0aGlzLCAwKTtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHRcdGdldEl0ZW1zT25QYWdlOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZGF0YSgncGFnaW5hdGlvbicpLml0ZW1zT25QYWdlO1xyXG5cdFx0fSxcclxuXHJcblx0XHRfZHJhdzogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhclx0byA9IHRoaXMuZGF0YSgncGFnaW5hdGlvbicpLFxyXG5cdFx0XHRcdGludGVydmFsID0gbWV0aG9kcy5fZ2V0SW50ZXJ2YWwobyksXHJcblx0XHRcdFx0aSxcclxuXHRcdFx0XHR0YWdOYW1lO1xyXG5cclxuXHRcdFx0bWV0aG9kcy5kZXN0cm95LmNhbGwodGhpcyk7XHJcblxyXG5cdFx0XHR0YWdOYW1lID0gKHR5cGVvZiB0aGlzLnByb3AgPT09ICdmdW5jdGlvbicpID8gdGhpcy5wcm9wKCd0YWdOYW1lJykgOiB0aGlzLmF0dHIoJ3RhZ05hbWUnKTtcclxuXHJcblx0XHRcdHZhciAkcGFuZWwgPSB0YWdOYW1lID09PSAnVUwnID8gdGhpcyA6ICQoJzx1bCcgKyAoby5saXN0U3R5bGUgPyAnIGNsYXNzPVwiJyArIG8ubGlzdFN0eWxlICsgJ1wiJyA6ICcnKSArICc+PC91bD4nKS5hcHBlbmRUbyh0aGlzKTtcclxuXHJcblx0XHRcdC8vIEdlbmVyYXRlIFByZXYgbGlua1xyXG5cdFx0XHRpZiAoby5wcmV2VGV4dCkge1xyXG5cdFx0XHRcdG1ldGhvZHMuX2FwcGVuZEl0ZW0uY2FsbCh0aGlzLCAhby5pbnZlcnRQYWdlT3JkZXIgPyBvLmN1cnJlbnRQYWdlIC0gMSA6IG8uY3VycmVudFBhZ2UgKyAxLCB7dGV4dDogby5wcmV2VGV4dCwgY2xhc3NlczogJ3ByZXYnfSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIEdlbmVyYXRlIE5leHQgbGluayAoaWYgb3B0aW9uIHNldCBmb3IgYXQgZnJvbnQpXHJcblx0XHRcdGlmIChvLm5leHRUZXh0ICYmIG8ubmV4dEF0RnJvbnQpIHtcclxuXHRcdFx0XHRtZXRob2RzLl9hcHBlbmRJdGVtLmNhbGwodGhpcywgIW8uaW52ZXJ0UGFnZU9yZGVyID8gby5jdXJyZW50UGFnZSArIDEgOiBvLmN1cnJlbnRQYWdlIC0gMSwge3RleHQ6IG8ubmV4dFRleHQsIGNsYXNzZXM6ICduZXh0J30pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBHZW5lcmF0ZSBzdGFydCBlZGdlc1xyXG5cdFx0XHRpZiAoIW8uaW52ZXJ0UGFnZU9yZGVyKSB7XHJcblx0XHRcdFx0aWYgKGludGVydmFsLnN0YXJ0ID4gMCAmJiBvLmVkZ2VzID4gMCkge1xyXG5cdFx0XHRcdFx0aWYoby51c2VTdGFydEVkZ2UpIHtcclxuXHRcdFx0XHRcdFx0dmFyIGVuZCA9IE1hdGgubWluKG8uZWRnZXMsIGludGVydmFsLnN0YXJ0KTtcclxuXHRcdFx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGVuZDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdFx0bWV0aG9kcy5fYXBwZW5kSXRlbS5jYWxsKHRoaXMsIGkpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAoby5lZGdlcyA8IGludGVydmFsLnN0YXJ0ICYmIChpbnRlcnZhbC5zdGFydCAtIG8uZWRnZXMgIT0gMSkpIHtcclxuXHRcdFx0XHRcdFx0JHBhbmVsLmFwcGVuZCgnPGxpIGNsYXNzPVwiZGlzYWJsZWRcIj48c3BhbiBjbGFzcz1cImVsbGlwc2VcIj4nICsgby5lbGxpcHNlVGV4dCArICc8L3NwYW4+PC9saT4nKTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwuc3RhcnQgLSBvLmVkZ2VzID09IDEpIHtcclxuXHRcdFx0XHRcdFx0bWV0aG9kcy5fYXBwZW5kSXRlbS5jYWxsKHRoaXMsIG8uZWRnZXMpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZiAoaW50ZXJ2YWwuZW5kIDwgby5wYWdlcyAmJiBvLmVkZ2VzID4gMCkge1xyXG5cdFx0XHRcdFx0aWYoby51c2VTdGFydEVkZ2UpIHtcclxuXHRcdFx0XHRcdFx0dmFyIGJlZ2luID0gTWF0aC5tYXgoby5wYWdlcyAtIG8uZWRnZXMsIGludGVydmFsLmVuZCk7XHJcblx0XHRcdFx0XHRcdGZvciAoaSA9IG8ucGFnZXMgLSAxOyBpID49IGJlZ2luOyBpLS0pIHtcclxuXHRcdFx0XHRcdFx0XHRtZXRob2RzLl9hcHBlbmRJdGVtLmNhbGwodGhpcywgaSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpZiAoby5wYWdlcyAtIG8uZWRnZXMgPiBpbnRlcnZhbC5lbmQgJiYgKG8ucGFnZXMgLSBvLmVkZ2VzIC0gaW50ZXJ2YWwuZW5kICE9IDEpKSB7XHJcblx0XHRcdFx0XHRcdCRwYW5lbC5hcHBlbmQoJzxsaSBjbGFzcz1cImRpc2FibGVkXCI+PHNwYW4gY2xhc3M9XCJlbGxpcHNlXCI+JyArIG8uZWxsaXBzZVRleHQgKyAnPC9zcGFuPjwvbGk+Jyk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG8ucGFnZXMgLSBvLmVkZ2VzIC0gaW50ZXJ2YWwuZW5kID09IDEpIHtcclxuXHRcdFx0XHRcdFx0bWV0aG9kcy5fYXBwZW5kSXRlbS5jYWxsKHRoaXMsIGludGVydmFsLmVuZCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBHZW5lcmF0ZSBpbnRlcnZhbCBsaW5rc1xyXG5cdFx0XHRpZiAoIW8uaW52ZXJ0UGFnZU9yZGVyKSB7XHJcblx0XHRcdFx0Zm9yIChpID0gaW50ZXJ2YWwuc3RhcnQ7IGkgPCBpbnRlcnZhbC5lbmQ7IGkrKykge1xyXG5cdFx0XHRcdFx0bWV0aG9kcy5fYXBwZW5kSXRlbS5jYWxsKHRoaXMsIGkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRmb3IgKGkgPSBpbnRlcnZhbC5lbmQgLSAxOyBpID49IGludGVydmFsLnN0YXJ0OyBpLS0pIHtcclxuXHRcdFx0XHRcdG1ldGhvZHMuX2FwcGVuZEl0ZW0uY2FsbCh0aGlzLCBpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIEdlbmVyYXRlIGVuZCBlZGdlc1xyXG5cdFx0XHRpZiAoIW8uaW52ZXJ0UGFnZU9yZGVyKSB7XHJcblx0XHRcdFx0aWYgKGludGVydmFsLmVuZCA8IG8ucGFnZXMgJiYgby5lZGdlcyA+IDApIHtcclxuXHRcdFx0XHRcdGlmIChvLnBhZ2VzIC0gby5lZGdlcyA+IGludGVydmFsLmVuZCAmJiAoby5wYWdlcyAtIG8uZWRnZXMgLSBpbnRlcnZhbC5lbmQgIT0gMSkpIHtcclxuXHRcdFx0XHRcdFx0JHBhbmVsLmFwcGVuZCgnPGxpIGNsYXNzPVwiZGlzYWJsZWRcIj48c3BhbiBjbGFzcz1cImVsbGlwc2VcIj4nICsgby5lbGxpcHNlVGV4dCArICc8L3NwYW4+PC9saT4nKTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoby5wYWdlcyAtIG8uZWRnZXMgLSBpbnRlcnZhbC5lbmQgPT0gMSkge1xyXG5cdFx0XHRcdFx0XHRtZXRob2RzLl9hcHBlbmRJdGVtLmNhbGwodGhpcywgaW50ZXJ2YWwuZW5kKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKG8udXNlRW5kRWRnZSkge1xyXG5cdFx0XHRcdFx0XHR2YXIgYmVnaW4gPSBNYXRoLm1heChvLnBhZ2VzIC0gby5lZGdlcywgaW50ZXJ2YWwuZW5kKTtcclxuXHRcdFx0XHRcdFx0Zm9yIChpID0gYmVnaW47IGkgPCBvLnBhZ2VzOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRtZXRob2RzLl9hcHBlbmRJdGVtLmNhbGwodGhpcywgaSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKGludGVydmFsLnN0YXJ0ID4gMCAmJiBvLmVkZ2VzID4gMCkge1xyXG5cdFx0XHRcdFx0aWYgKG8uZWRnZXMgPCBpbnRlcnZhbC5zdGFydCAmJiAoaW50ZXJ2YWwuc3RhcnQgLSBvLmVkZ2VzICE9IDEpKSB7XHJcblx0XHRcdFx0XHRcdCRwYW5lbC5hcHBlbmQoJzxsaSBjbGFzcz1cImRpc2FibGVkXCI+PHNwYW4gY2xhc3M9XCJlbGxpcHNlXCI+JyArIG8uZWxsaXBzZVRleHQgKyAnPC9zcGFuPjwvbGk+Jyk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGludGVydmFsLnN0YXJ0IC0gby5lZGdlcyA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdG1ldGhvZHMuX2FwcGVuZEl0ZW0uY2FsbCh0aGlzLCBvLmVkZ2VzKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpZihvLnVzZUVuZEVkZ2UpIHtcclxuXHRcdFx0XHRcdFx0dmFyIGVuZCA9IE1hdGgubWluKG8uZWRnZXMsIGludGVydmFsLnN0YXJ0KTtcclxuXHRcdFx0XHRcdFx0Zm9yIChpID0gZW5kIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHRcdFx0XHRcdFx0XHRtZXRob2RzLl9hcHBlbmRJdGVtLmNhbGwodGhpcywgaSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIEdlbmVyYXRlIE5leHQgbGluayAodW5sZXNzIG9wdGlvbiBpcyBzZXQgZm9yIGF0IGZyb250KVxyXG5cdFx0XHRpZiAoby5uZXh0VGV4dCAmJiAhby5uZXh0QXRGcm9udCkge1xyXG5cdFx0XHRcdG1ldGhvZHMuX2FwcGVuZEl0ZW0uY2FsbCh0aGlzLCAhby5pbnZlcnRQYWdlT3JkZXIgPyBvLmN1cnJlbnRQYWdlICsgMSA6IG8uY3VycmVudFBhZ2UgLSAxLCB7dGV4dDogby5uZXh0VGV4dCwgY2xhc3NlczogJ25leHQnfSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChvLmVsbGlwc2VQYWdlU2V0ICYmICFvLmRpc2FibGVkKSB7XHJcblx0XHRcdFx0bWV0aG9kcy5fZWxsaXBzZUNsaWNrLmNhbGwodGhpcywgJHBhbmVsKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH0sXHJcblxyXG5cdFx0X2dldFBhZ2VzOiBmdW5jdGlvbihvKSB7XHJcblx0XHRcdHZhciBwYWdlcyA9IE1hdGguY2VpbChvLml0ZW1zIC8gby5pdGVtc09uUGFnZSk7XHJcblx0XHRcdHJldHVybiBwYWdlcyB8fCAxO1xyXG5cdFx0fSxcclxuXHJcblx0XHRfZ2V0SW50ZXJ2YWw6IGZ1bmN0aW9uKG8pIHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRzdGFydDogTWF0aC5jZWlsKG8uY3VycmVudFBhZ2UgPiBvLmhhbGZEaXNwbGF5ZWQgPyBNYXRoLm1heChNYXRoLm1pbihvLmN1cnJlbnRQYWdlIC0gby5oYWxmRGlzcGxheWVkLCAoby5wYWdlcyAtIG8uZGlzcGxheWVkUGFnZXMpKSwgMCkgOiAwKSxcclxuXHRcdFx0XHRlbmQ6IE1hdGguY2VpbChvLmN1cnJlbnRQYWdlID4gby5oYWxmRGlzcGxheWVkID8gTWF0aC5taW4oby5jdXJyZW50UGFnZSArIG8uaGFsZkRpc3BsYXllZCwgby5wYWdlcykgOiBNYXRoLm1pbihvLmRpc3BsYXllZFBhZ2VzLCBvLnBhZ2VzKSlcclxuXHRcdFx0fTtcclxuXHRcdH0sXHJcblxyXG5cdFx0X2FwcGVuZEl0ZW06IGZ1bmN0aW9uKHBhZ2VJbmRleCwgb3B0cykge1xyXG5cdFx0XHR2YXIgc2VsZiA9IHRoaXMsIG9wdGlvbnMsICRsaW5rLCBvID0gc2VsZi5kYXRhKCdwYWdpbmF0aW9uJyksICRsaW5rV3JhcHBlciA9ICQoJzxsaT48L2xpPicpLCAkdWwgPSBzZWxmLmZpbmQoJ3VsJyk7XHJcblxyXG5cdFx0XHRwYWdlSW5kZXggPSBwYWdlSW5kZXggPCAwID8gMCA6IChwYWdlSW5kZXggPCBvLnBhZ2VzID8gcGFnZUluZGV4IDogby5wYWdlcyAtIDEpO1xyXG5cclxuXHRcdFx0b3B0aW9ucyA9IHtcclxuXHRcdFx0XHR0ZXh0OiBwYWdlSW5kZXggKyAxLFxyXG5cdFx0XHRcdGNsYXNzZXM6ICcnXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRpZiAoby5sYWJlbE1hcC5sZW5ndGggJiYgby5sYWJlbE1hcFtwYWdlSW5kZXhdKSB7XHJcblx0XHRcdFx0b3B0aW9ucy50ZXh0ID0gby5sYWJlbE1hcFtwYWdlSW5kZXhdO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRvcHRpb25zID0gJC5leHRlbmQob3B0aW9ucywgb3B0cyB8fCB7fSk7XHJcblxyXG5cdFx0XHRpZiAocGFnZUluZGV4ID09IG8uY3VycmVudFBhZ2UgfHwgby5kaXNhYmxlZCkge1xyXG5cdFx0XHRcdGlmIChvLmRpc2FibGVkIHx8IG9wdGlvbnMuY2xhc3NlcyA9PT0gJ3ByZXYnIHx8IG9wdGlvbnMuY2xhc3NlcyA9PT0gJ25leHQnKSB7XHJcblx0XHRcdFx0XHQkbGlua1dyYXBwZXIuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCRsaW5rV3JhcHBlci5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdCRsaW5rID0gJCgnPHNwYW4gY2xhc3M9XCJjdXJyZW50XCI+JyArIChvcHRpb25zLnRleHQpICsgJzwvc3Bhbj4nKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkbGluayA9ICQoJzxhIGhyZWY9XCInICsgby5ocmVmVGV4dFByZWZpeCArIChwYWdlSW5kZXggKyAxKSArIG8uaHJlZlRleHRTdWZmaXggKyAnXCIgY2xhc3M9XCJwYWdlLWxpbmtcIj4nICsgKG9wdGlvbnMudGV4dCkgKyAnPC9hPicpO1xyXG5cdFx0XHRcdCRsaW5rLmNsaWNrKGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdFx0XHRcdHJldHVybiBtZXRob2RzLl9zZWxlY3RQYWdlLmNhbGwoc2VsZiwgcGFnZUluZGV4LCBldmVudCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChvcHRpb25zLmNsYXNzZXMpIHtcclxuXHRcdFx0XHQkbGluay5hZGRDbGFzcyhvcHRpb25zLmNsYXNzZXMpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkbGlua1dyYXBwZXIuYXBwZW5kKCRsaW5rKTtcclxuXHJcblx0XHRcdGlmICgkdWwubGVuZ3RoKSB7XHJcblx0XHRcdFx0JHVsLmFwcGVuZCgkbGlua1dyYXBwZXIpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHNlbGYuYXBwZW5kKCRsaW5rV3JhcHBlcik7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0X3NlbGVjdFBhZ2U6IGZ1bmN0aW9uKHBhZ2VJbmRleCwgZXZlbnQpIHtcclxuXHRcdFx0dmFyIG8gPSB0aGlzLmRhdGEoJ3BhZ2luYXRpb24nKTtcclxuXHRcdFx0by5jdXJyZW50UGFnZSA9IHBhZ2VJbmRleDtcclxuXHRcdFx0aWYgKG8uc2VsZWN0T25DbGljaykge1xyXG5cdFx0XHRcdG1ldGhvZHMuX2RyYXcuY2FsbCh0aGlzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gby5vblBhZ2VDbGljayhwYWdlSW5kZXggKyAxLCBldmVudCk7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHRfZWxsaXBzZUNsaWNrOiBmdW5jdGlvbigkcGFuZWwpIHtcclxuXHRcdFx0dmFyIHNlbGYgPSB0aGlzLFxyXG5cdFx0XHRcdG8gPSB0aGlzLmRhdGEoJ3BhZ2luYXRpb24nKSxcclxuXHRcdFx0XHQkZWxsaXAgPSAkcGFuZWwuZmluZCgnLmVsbGlwc2UnKTtcclxuXHRcdFx0JGVsbGlwLmFkZENsYXNzKCdjbGlja2FibGUnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuXHRcdFx0JGVsbGlwLmNsaWNrKGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFx0aWYgKCFvLmRpc2FibGUpIHtcclxuXHRcdFx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyksXHJcblx0XHRcdFx0XHRcdHZhbCA9IChwYXJzZUludCgkdGhpcy5wYXJlbnQoKS5wcmV2KCkudGV4dCgpLCAxMCkgfHwgMCkgKyAxO1xyXG5cdFx0XHRcdFx0JHRoaXNcclxuXHRcdFx0XHRcdFx0Lmh0bWwoJzxpbnB1dCB0eXBlPVwibnVtYmVyXCIgbWluPVwiMVwiIG1heD1cIicgKyBvLnBhZ2VzICsgJ1wiIHN0ZXA9XCIxXCIgdmFsdWU9XCInICsgdmFsICsgJ1wiPicpXHJcblx0XHRcdFx0XHRcdC5maW5kKCdpbnB1dCcpXHJcblx0XHRcdFx0XHRcdC5mb2N1cygpXHJcblx0XHRcdFx0XHRcdC5jbGljayhmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcdFx0XHRcdC8vIHByZXZlbnQgaW5wdXQgbnVtYmVyIGFycm93cyBmcm9tIGJ1YmJsaW5nIGEgY2xpY2sgZXZlbnQgb24gJGVsbGlwXHJcblx0XHRcdFx0XHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdC5rZXl1cChmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcdFx0XHRcdHZhciB2YWwgPSAkKHRoaXMpLnZhbCgpO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChldmVudC53aGljaCA9PT0gMTMgJiYgdmFsICE9PSAnJykge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gZW50ZXIgdG8gYWNjZXB0XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoKHZhbD4wKSYmKHZhbDw9by5wYWdlcykpXHJcblx0XHRcdFx0XHRcdFx0XHRtZXRob2RzLl9zZWxlY3RQYWdlLmNhbGwoc2VsZiwgdmFsIC0gMSk7XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChldmVudC53aGljaCA9PT0gMjcpIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIGVzY2FwZSB0byBjYW5jZWxcclxuXHRcdFx0XHRcdFx0XHRcdCRlbGxpcC5lbXB0eSgpLmh0bWwoby5lbGxpcHNlVGV4dCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHQuYmluZCgnYmx1cicsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHZhbCA9ICQodGhpcykudmFsKCk7XHJcblx0XHRcdFx0XHRcdFx0aWYgKHZhbCAhPT0gJycpIHtcclxuXHRcdFx0XHRcdFx0XHRcdG1ldGhvZHMuX3NlbGVjdFBhZ2UuY2FsbChzZWxmLCB2YWwgLSAxKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0JGVsbGlwLmVtcHR5KCkuaHRtbChvLmVsbGlwc2VUZXh0KTtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHR9O1xyXG5cclxuXHQkLmZuLnBhZ2luYXRpb24gPSBmdW5jdGlvbihtZXRob2QpIHtcclxuXHJcblx0XHQvLyBNZXRob2QgY2FsbGluZyBsb2dpY1xyXG5cdFx0aWYgKG1ldGhvZHNbbWV0aG9kXSAmJiBtZXRob2QuY2hhckF0KDApICE9ICdfJykge1xyXG5cdFx0XHRyZXR1cm4gbWV0aG9kc1ttZXRob2RdLmFwcGx5KHRoaXMsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xyXG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgbWV0aG9kID09PSAnb2JqZWN0JyB8fCAhbWV0aG9kKSB7XHJcblx0XHRcdHJldHVybiBtZXRob2RzLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCQuZXJyb3IoJ01ldGhvZCAnICsgIG1ldGhvZCArICcgZG9lcyBub3QgZXhpc3Qgb24galF1ZXJ5LnBhZ2luYXRpb24nKTtcclxuXHRcdH1cclxuXHJcblx0fTtcclxuXHJcbn0pKGpRdWVyeSk7XHJcbiIsIiFmdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW10sZnVuY3Rpb24oKXtyZXR1cm4gYS5zdmc0ZXZlcnlib2R5PWIoKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWIoKTphLnN2ZzRldmVyeWJvZHk9YigpfSh0aGlzLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLGIsYyl7aWYoYyl7dmFyIGQ9ZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLGU9IWIuaGFzQXR0cmlidXRlKFwidmlld0JveFwiKSYmYy5nZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIpO2UmJmIuc2V0QXR0cmlidXRlKFwidmlld0JveFwiLGUpO2Zvcih2YXIgZj1jLmNsb25lTm9kZSghMCk7Zi5jaGlsZE5vZGVzLmxlbmd0aDspZC5hcHBlbmRDaGlsZChmLmZpcnN0Q2hpbGQpO2EuYXBwZW5kQ2hpbGQoZCl9fWZ1bmN0aW9uIGIoYil7Yi5vbnJlYWR5c3RhdGVjaGFuZ2U9ZnVuY3Rpb24oKXtpZig0PT09Yi5yZWFkeVN0YXRlKXt2YXIgYz1iLl9jYWNoZWREb2N1bWVudDtjfHwoYz1iLl9jYWNoZWREb2N1bWVudD1kb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoXCJcIiksYy5ib2R5LmlubmVySFRNTD1iLnJlc3BvbnNlVGV4dCxiLl9jYWNoZWRUYXJnZXQ9e30pLGIuX2VtYmVkcy5zcGxpY2UoMCkubWFwKGZ1bmN0aW9uKGQpe3ZhciBlPWIuX2NhY2hlZFRhcmdldFtkLmlkXTtlfHwoZT1iLl9jYWNoZWRUYXJnZXRbZC5pZF09Yy5nZXRFbGVtZW50QnlJZChkLmlkKSksYShkLnBhcmVudCxkLnN2ZyxlKX0pfX0sYi5vbnJlYWR5c3RhdGVjaGFuZ2UoKX1mdW5jdGlvbiBjKGMpe2Z1bmN0aW9uIGUoKXtmb3IodmFyIGM9MDtjPG0ubGVuZ3RoOyl7dmFyIGg9bVtjXSxpPWgucGFyZW50Tm9kZSxqPWQoaSk7aWYoail7dmFyIG49aC5nZXRBdHRyaWJ1dGUoXCJ4bGluazpocmVmXCIpfHxoLmdldEF0dHJpYnV0ZShcImhyZWZcIik7aWYoZiYmKCFnLnZhbGlkYXRlfHxnLnZhbGlkYXRlKG4saixoKSkpe2kucmVtb3ZlQ2hpbGQoaCk7dmFyIG89bi5zcGxpdChcIiNcIikscD1vLnNoaWZ0KCkscT1vLmpvaW4oXCIjXCIpO2lmKHAubGVuZ3RoKXt2YXIgcj1rW3BdO3J8fChyPWtbcF09bmV3IFhNTEh0dHBSZXF1ZXN0LHIub3BlbihcIkdFVFwiLHApLHIuc2VuZCgpLHIuX2VtYmVkcz1bXSksci5fZW1iZWRzLnB1c2goe3BhcmVudDppLHN2ZzpqLGlkOnF9KSxiKHIpfWVsc2UgYShpLGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHEpKX19ZWxzZSsrY31sKGUsNjcpfXZhciBmLGc9T2JqZWN0KGMpLGg9L1xcYlRyaWRlbnRcXC9bNTY3XVxcYnxcXGJNU0lFICg/Ojl8MTApXFwuMFxcYi8saT0vXFxiQXBwbGVXZWJLaXRcXC8oXFxkKylcXGIvLGo9L1xcYkVkZ2VcXC8xMlxcLihcXGQrKVxcYi87Zj1cInBvbHlmaWxsXCJpbiBnP2cucG9seWZpbGw6aC50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpfHwobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaChqKXx8W10pWzFdPDEwNTQ3fHwobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaChpKXx8W10pWzFdPDUzNzt2YXIgaz17fSxsPXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHNldFRpbWVvdXQsbT1kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInVzZVwiKTtmJiZlKCl9ZnVuY3Rpb24gZChhKXtmb3IodmFyIGI9YTtcInN2Z1wiIT09Yi5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpJiYoYj1iLnBhcmVudE5vZGUpOyk7cmV0dXJuIGJ9cmV0dXJuIGN9KTsiXX0=
