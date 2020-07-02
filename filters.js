let currentFilters;
let page;
let size;

function getUrl() {
  return window.location.href;
}

// updateFilters hides & shows child elements that should be
// hidden/shown because of the currently selected filters
function updateFilters() {
  if (!document.getElementById('providers')) return

  // get all of the results
  let children = document.getElementById('results').children;
  let count = 0;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    // find the provider
    let provider = child.dataset.provider;

    // if enabled
    if (currentFilters[provider]) {
      // display it
      child.style.display = 'block';
      count++;
    } else {
      // don't display it
      child.style.display = 'none';
    }
  }

  // update the "total" count to reflect "total displayed"
  document.getElementById('count').textContent = '' + count;
}

// updateCheckboxes updates the filters form so that the
// checkboxes reflect accurate filter state. It does this
// by simply updating the "checked" attribute
function updateCheckboxes() {
  let providerElements = document.getElementById('providers').children;
  for (let node of providerElements) {
    if (!currentFilters[node.dataset.provider]) {
      node.checked = false;
    }
  }
}

function init() {
  currentFilters = {};

  let providerElements = document.getElementById('providers').children;

  // gets the query params
  let urlString = getUrl()
  let url = getUrl().split('&');

  let checkProviderParams = 1

  // figure out if '&page=' and '&size=' exists in the url
  if(urlString.includes("&page=")){
    checkProviderParams++;
    //set the value for page
    let pageStr = getURLString(urlString, "page");
    let pageNum = getInt(getURLString(urlString, "page").split("=")[1]);
    if(pageNum == -1){
      page = 1;
    } else {
      page = pageNum;
    }
  } else {
    page = 1;
  }

  if(urlString.includes("&size=")){
    checkProviderParams++;
    //set the value for size
    let sizeNum = getInt(getURLString(urlString, "size").split("=")[1]);
    if(sizeNum == -1){
      size = 10;
    } else {
      size = sizeNum;
    }
  } else {
    size = 10;
  }

  // set size initial value
  document.getElementById("search-results").value = size;

  // set page initial value
  document.getElementById("page-num").innerText = page;
  document.getElementById("page").value = page

  // see if a &($provider) exists in the URI 
  if (url.length > checkProviderParams) {
    
    for (let node of providerElements) {
      if (node.dataset.provider) {
        currentFilters[node.dataset.provider] = false;
      }
    }

    // slice off the query
    url = url.slice(1);
    for (let segment of url) {
      // replace "+" with " " (form encoding)
      let seg = segment.replace(/\+/g, ' ').split('=');
      // with the split, seg is now a [<key>, <value>] array
      if (seg[1] === 'on') {
        currentFilters[seg[0]] = true;
      }
    }

    // update everything
    updateCheckboxes();
    updateFilters();
  } else {
    // default case -- everything is on, nobody wants to do a search
    // with no possible results.
    for (let node of providerElements) {
      if (node.dataset.provider) {
        currentFilters[node.dataset.provider] = true;
      }
    }
  }
  updateURL();
}

window.onload = init;

// toggleFilter updates the displayed items & the URL
// when a filter is checked/unchecked
function toggleFilter(filter) {
  currentFilters[filter] = !currentFilters[filter];

  // reflect filter changes
  updateFilters();
  updateURL();
}

// get the '&page=.*' and '&size=.*' values from the URL concatenated as a string
function getURLSizePage (urlStr) {
  let returnString = "";
  returnString += getURLString(urlStr, "page");
  returnString += getURLString(urlStr, "size");
  return returnString;
}

// get the '&($str)=.*' value from the URL concatenated as a string
function getURLString (urlStr, str) {
  let target = "&" + str + "=";
  let targetIndex = urlStr.indexOf(target);
  if(targetIndex > -1) {
    let end = urlStr.indexOf("&", targetIndex+1);
    if(end == -1){
      // '&($str)=.*' appears at the end of the url
      return urlStr.substring(targetIndex);
    } else {
      return urlStr.substring(targetIndex, end);
    }
  }
  // String not found
  return "";
}

// gets the value after the first '=' 
function getURLStringValue (str) {
  return str.split("=")[1];
}

function prevBtn () {
  let url = getUrl();
  if(url.includes("&page=")){
    let pageNum = getInt(getURLString(url, "page").split("=")[1]);

    // check if value is LEGAL
    if(pageNum == -1){
      pageNum = 1;
    } else {
      // decrement if pageNum >= 2
      if(pageNum >= 2) {
        pageNum--;
      } else {
        // make sure it's at least 1
        pageNum = 1;
      }
    }
    
    page = pageNum;

  } else {
    page = 1
  }

  document.getElementById("page-num").innerText = page;
  document.getElementById("page").value = page;
  updateURL();
}

function nextBtn () {
  let url = getUrl();

  if(url.includes("&page=")){
    let pageNum = getInt(getURLString(url, "page").split("=")[1]);

    // check if value is LEGAL
    if(pageNum == -1){
      pageNum = 1;
    } else {
      // increment pageNum
      if(pageNum >= 0) {
        pageNum++;
      } else {
        // make sure it's at least 1
        pageNum = 1;
      }
    }

    page = pageNum;

  } else {
    page = 2;
  }

  document.getElementById("page-num").innerText = page;
  document.getElementById("page").value = page;
  updateURL();
}

function resultsNum () {
  let url = getUrl();
  size = document.getElementById("search-results").value;
  updateURL();
}

function updateURL () {
  // update the url, starting with just the query
  let urlStr = getUrl();
  let url = urlStr.split('&')[0];

  for (let f in currentFilters) {
    // add each enabled filter independently
    if (currentFilters[f]) {
      url += '&' + f.replace(/ /g, '+') + '=on';
    }
  }

  url += "&size=" + size + "&page=" + page;

  // push the new url
  window.history.pushState(currentFilters, 'New Filter', url);
}

// returns positive int from string, -1 if error
function getInt (str){
  let value = parseInt(str);
  if(isNaN(value)){
    return -1;
  } else {
    if(value < 0){
      return -1;
    } else {
      return value;
    }
  }
}