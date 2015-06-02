window.onscroll = function() {
    var stickyHeader = document.getElementById('sticky-header');
    if (document.body.scrollTop > stickyHeader.offsetTop) {
       stickyHeader.style.position = "fixed";
       stickyHeader.style.top = "0px";
    } else {
       stickyHeader.style.position = "static";
       //stickyHeader.style.top = "0px";
    }
}

function getQueryParamByName(name) {
	var pairs = location.search.slice(1).split('&');
	var arr = [];
	for (var i = 0; i < pairs.length; i++) {
		var pair = pairs[i].split('=');
		if (pair[0] == name) {
			arr.push(pair[1]);
		}
	}

//	return JSON.parse(JSON.stringify(arr));
	return (arr.length > 1 ? arr:arr[0]);
}

//function toggleCheckBox(checkbox,hiddenCheckBox) {
function toggleCheckBox(checkbox) {
    	//document.getElementById(hiddenCheckBox).setAttribute('value', document.getElementById(checkbox).checked? "":"off");
    	
    if (!checkbox.checked) {
		var hiddenCheckbox = document.createElement('input');
		hiddenCheckbox.type = 'hidden';
		hiddenCheckbox.name = checkbox.name;
		hiddenCheckbox.id = checkbox.id + '_hidden';
		hiddenCheckbox.setAttribute('value', checkbox.checked? "":"off");
		checkbox.parentNode.appendChild(hiddenCheckbox);
	} else {
		var element = document.getElementById(checkbox.id + '_hidden');
	    if (element) {
			element.parentNode.removeChild(element);
		}
	}
}

function getSymbolData(url, callback) {
	if (window.XMLHttpRequest) {	// code for IE7+, Firefox, Chrome, Opera, Safari
	  var request = new XMLHttpRequest();
	}
	else {	// code for IE6, IE5
	  var request = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	var symbolData;
	request.onreadystatechange = function(){
		if (request.readyState == 4) {
			if (request.status == 200 || window.location.href.indexOf("http")==-1) {
				var jsondata=eval("("+request.responseText+")"); //retrieve result as an JavaScript object
				//console.log(jsondata);
				callback(jsondata);		// symbolData is a global var (declared outside this anonymous func)
			}
		}	
	};

	request.open("GET",url,true);    // "true" send as synchronous
	request.send();

}


function createStickyHeader(chartDurations, chartColumnProperties, chartWidth) {

  var div = document.createElement("div");
  div.id = "sticky-header";
  div.style.whiteSpace = "nowrap"
  
  // create a blank column
  var col_0 = document.createElement("div");
  col_0.style.width = chartWidth + "px";
  col_0.style.height = "22px";
  col_0.style.backgroundColor = "#6ba8ed";
  //col_0.style.cssFloat = "left";
  col_0.style.display = "inline-block";
  col_0.appendChild(document.createTextNode("\u00A0"));
  div.appendChild(col_0);

  for (var t = 0; t < chartColumnProperties.length; t++) {

	col = document.createElement("div");
	col.style.width = chartWidth + "px";
	col.style.height = "22px";
    col.style.backgroundColor = "#6ba8ed";
    //col.style.cssFloat = "left";
    col.style.display = "inline-block";
  
	var select = document.createElement("select");
	select.setAttribute('name', "t");
	for (key in chartDurations) {
		var option = document.createElement("option");
		option.value = key;
		option.text = chartDurations[key];
		select.appendChild(option);
	}
	col.appendChild(select);
	// this is not guaranteed because the json object isn't guaranteed to return the same order???
	col.childNodes[0].selectedIndex = Object.keys(chartDurations).indexOf(chartColumnProperties[t].t);
		
											
	var ma1 = document.createElement("input");
    col.appendChild(ma1);
	ma1.type = "checkbox";
	ma1.name = "ma1";
	ma1.id = "ma1_" + t;
	if (chartColumnProperties[t].ma1 != "") {
		ma1.checked = true;
	} else { 
		ma1.checked = false;
		toggleCheckBox(ma1);
	}
	ma1.setAttribute ('onClick', "toggleCheckBox(" + ma1.id + ")");

    
    var span = document.createElement("span");
    span.innerHTML = "ma1";
    col.appendChild(span);

	var ma2 = document.createElement("input");
    col.appendChild(ma2);
	ma2.type = "checkbox";
	ma2.name = "ma2";
	ma2.id = "ma2_" + t;
	if (chartColumnProperties[t].ma2 != "") {
		ma2.checked = true;
	} else { 
		ma2.checked = false;
		toggleCheckBox(ma2);
	}
	ma2.setAttribute ('onClick', "toggleCheckBox(" + ma2.id + ")");
    
    var span = document.createElement("span");
    span.innerHTML = "ma2&nbsp;&nbsp;&nbsp;";
    col.appendChild(span)
	
	var reloadButton = document.createElement("input");
	reloadButton.type = "submit";
	reloadButton.value = "";
	reloadButton.style.background = "url(button_reload_sm.png) no-repeat";
	reloadButton.style.border = "none";
	reloadButton.style.width = "20px";
	reloadButton.style.height = "20px";
	reloadButton.style.padding = "6px";
	col.appendChild(reloadButton);

    div.appendChild(col); 

  }
  
  return div;

}

function createDataRows(baseURL, symbols, globalChartProperties, chartDurations, chartColumnProperties, chartWidth, chartHeight) {

  var div = document.createElement("div");
  var dataDivs = new Array();
  div.style.clear = "both";
  
  var symbolData = new Array();
  for (var s = 0;  s < symbols.length; s++) {

    dataDivs[s] = document.createElement("div");
    dataDivs[s].style.width = chartWidth + "px";
    dataDivs[s].style.height = chartHeight + "px";
    dataDivs[s].style.verticalAlign = "top";
    dataDivs[s].style.cssFloat = "left";
    //dataDivs[s].id = "datadiv_" + symbols[s];
    
    
    // get symbol data asynchronously
    // run this function as a self-invoking so that, notice the extra () at the end, so
    // that the getSymbolDataDiv callback is defined with the value of the [s] locked in 
    // (otherwise [s] will always be called using the last value of the for loop)
    (function() {
        getSymbolDataDiv(symbols[s], chartWidth, dataDivs[s], function(dataDiv, innerHTML) {
            //console.log(data);
            dataDiv.innerHTML = innerHTML;
        });
    })();

    div.appendChild(dataDivs[s]);

	// create chart URL and img element
    div.appendChild(createRowCharts(baseURL, symbols[s], globalChartProperties, chartColumnProperties, chartWidth, chartHeight));

  }
  return div;
}

function getSymbolDataDiv(symbol, chartWidth, dataDiv, callback) {
    var url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%27%22%20%2B%20"
			  + encodeURIComponent(symbol) +
			  "%20%2B%20%22%27)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";

    //console.log("callback is typeof: " + typeof callback)
    // send "asynchronous" ajax call to get the symbol data
        getSymbolData(url, function(symbolData) {
            
    	    innerHTML = "<table width=\"100%\"> \
    	                   <tr style=\"font-size:11pt;\"> \
    	                     <td colspan=\"2\"><b>" + getSymbolDataByName(symbolData, "Name") + " (" + decodeURIComponent(symbol) + ")</td> \
    	                   </tr> \
    	                   <tr> \
    	                     <td nowrap=\"nowrap\" colspan=\"2\"><span style=\"font-size:14pt;font-weight:bold\">" + getSymbolDataByName(symbolData, "LastTradePriceOnly") + "</span>&nbsp;&nbsp;" +
    	                                "<span  style=\"font-size:11pt;font-weight:bold\">" + setValueChangeColor(getSymbolDataByName(symbolData, "Change") + 
                                        " (" + getSymbolDataByName(symbolData, "PercentChange").replace("+","") + ")") + "</span></td> \
    	                   </tr> \
    	                   <tr style=\"font-size:10pt;\"> \
    	                     <td>Previous Close:</td> \
    	                     <td style=\"text-align:right\">" + getSymbolDataByName(symbolData, "PreviousClose") + "</td> \
    	                   </tr> \
    	                   <tr style=\"font-size:10pt;\"> \
    	                     <td>Open:</td> \
    	                     <td style=\"text-align:right\">" + getSymbolDataByName(symbolData, "Open") + "</td> \
    	                   </tr> \
    	                   <tr style=\"font-size:10pt;\"> \
    	                     <td>Day's Range:</td> \
    	                     <td style=\"text-align:right\">" + getSymbolDataByName(symbolData, "DaysRange") + "</td> \
    	                   </tr> \
    	                   <tr style=\"font-size:10pt;\"> \
    	                     <td>52 Week Range:</td> \
    	                     <td style=\"text-align:right\">" + getSymbolDataByName(symbolData, "YearRange") + "</td> \
    	                   </tr> \
    	                   <tr style=\"font-size:10pt;\"> \
    	                     <td>Volume:</td> \
    	                     <td style=\"text-align:right;\">" + getSymbolDataByName(symbolData, "Volume") + "</td> \
    	                   </tr> \
    	                   <tr style=\"font-size:10pt;\"> \
    	                     <td>Ave Volume:</td> \
    	                     <td style=\"text-align:right\">" + getSymbolDataByName(symbolData, "AverageDailyVolume") + "</td> \
    	                   </tr> \
    	                   <tr style=\"font-size:10pt;\"> \
    	                     <td>Market Cap:</td> \
    	                     <td style=\"text-align:right\">" + getSymbolDataByName(symbolData, "MarketCapitalization") + "</td> \
    	                   </tr> \
    	                   <tr style=\"font-size:10pt;\"> \
    	                     <td>P/E:</td> \
    	                     <td style=\"text-align:right\">" + getSymbolDataByName(symbolData, "PERatio") + "</td> \
    	                   </tr> \
    	                   <tr style=\"font-size:10pt;\"> \
    	                     <td>EPS:</td> \
    	                     <td style=\"text-align:right\">" + getSymbolDataByName(symbolData, "EarningsShare") + "</td> \
    	                   </tr> \
                        </table>";

            callback(dataDiv, innerHTML);

        });
}

function getSymbolDataByName(symbolData, name) {
  if (symbolData && "query" in symbolData && symbolData.query !== null &&
                    "results" in symbolData.query && symbolData.query.results !== null &&
                    "quote" in symbolData.query.results && symbolData.query.results.quote !== null &&
                    name in symbolData.query.results.quote && symbolData.query.results.quote[name] !== null) {
      return symbolData.query.results.quote[name];
  } else {
      return "";
  }

}

function setValueChangeColor(percentChange) {
    var color = percentChange.indexOf("+") != -1 ? "#00CC00":"#FF0000";
    return "<span style=\"color:" + color + "\">" + percentChange + "</span>";
}


function createRowCharts(baseURL, symbol, globalChartProperties, chartColumnProperties, chartWidth, chartHeight) {
    
    var div = document.createElement("div");
    div.id = "chartRow";

    for (var t = 0; t < chartColumnProperties.length; t++) {
        
        var img = document.createElement("img");        
        img.setAttribute('src', baseURL + 
                         's=' + encodeURIComponent(symbol) +
                         '&q=' + globalChartProperties['q'] +
                         '&l=' + globalChartProperties['l'] +
                         '&z=' + globalChartProperties['z'] +
                         '&a=' + globalChartProperties['a'] +
                         '&p=' + globalChartProperties['p'] + ',' + chartColumnProperties[t].ma1 + ',' + chartColumnProperties[t].ma2 +
                         '&t=' + chartColumnProperties[t].t +
                         '&lang=' + globalChartProperties['lang'] +
                         '&region=' + globalChartProperties['region']);
        img.setAttribute('width', chartWidth);
        img.setAttribute('height', chartHeight);
		div.appendChild(img);
    }
    
    return div;
}

function createSymbolInput(symbols, width) {
    
    var div = document.createElement("div");
    div.style.width = width + "px";
    div.style.backgroundColor = "#99CCFF";
    div.appendChild(document.createElement("br"));
        

    var divCenter = document.createElement("div");
    divCenter.style.width = "455px";
    divCenter.style.display = "block";
    divCenter.style.marginLeft = "auto";
    divCenter.style.marginRight = "auto";

    var input = document.createElement("input");
    input.type = "text";
    input.name = "symbols";
    input.size = "80";
    input.value = symbols.join(", ");
    divCenter.appendChild(input);
    
    divCenter.appendChild(document.createTextNode("\u00A0\u00A0"));
    
	var reloadButton = document.createElement("input");
	reloadButton.type = "submit";
	reloadButton.value = "";
	reloadButton.style.background = "url(button_reload_sm.png) no-repeat";
	reloadButton.style.border = "none";
	reloadButton.style.width = "20px";
	reloadButton.style.height = "20px";
	reloadButton.style.padding = "6px";
    divCenter.appendChild(reloadButton);

    div.appendChild(divCenter);
    div.appendChild(document.createElement("br"));
    div.appendChild(document.createElement("br"));

    
    return div;
}