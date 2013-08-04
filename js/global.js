// Create the Google Map…

var family = {};
family.dataSets = [
  {
    name: 'Salud Públicos',
    dataset: 'salud-publicos',
  }, 
  {
    name: 'Salud Privados',
    dataset: 'salud-privados',
  }, 
  {
    name: 'Población Femenina',
    dataset: 'sexo-f',
  }, 
  {
    name: 'Población Masculina',
    dataset: 'sexo-m',
  }, 

];

family.map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 6,
  center: new google.maps.LatLng(-38.416097,-63.616672),
  mapTypeId: google.maps.MapTypeId.TERRAIN
  
});
family.maxHeight = 100;


family.graphDataValues = function(value, maxValue, maxHeight, chart, i) {
  var h = (value * maxHeight) / maxValue;
  chart.find('.js-dataset'+i+'-value .bar-inner ' ).css({bottom: 0, height: h + '%'});
  chart.find('.js-dataset'+i+'-value .js-value ' ).html(value);

};


family.loadViewForData = function(dataSet1, dataSet2) {
  if (family.overlay != null) {
    // remover el dataset actual del mapa
    family.overlay.draw = function(){};
    family.overlay.onAdd = function(){};
    $('.graphicProv').remove();
    $(family.overlay.getPanes().overlayLayer).find('.provincias').remove();
    family.overlay = null;
    _(family.provincias).each(function(v,k){
      v.e = null;
    })
  }
  family.dataSet1MaxValue  = 0;
  family.dataSet2MaxValue  = 0;
  _(dataSet1).each(function(v,k){
    if (v > family.dataSet1MaxValue)
      family.dataSet1MaxValue = v;
  });
  if (dataSet2) {
    _(dataSet2).each(function(v,k){
      if (v > family.dataSet2MaxValue)
        family.dataSet2MaxValue = v;
    });
  }

  family.overlay = new google.maps.OverlayView();
  family.overlay.onAdd = function() {

    var layer = d3.select(this.getPanes().overlayLayer).append("div")
      .attr("class", "provincias");

    family.overlay.draw = function() {

      var projection = this.getProjection();
      var paddingX = 40;
      var paddingY = 70;
      var newContainerSize = (family.map.getZoom() * 0.25) / 5;
      console.log('containerSize', newContainerSize);
      $('.graph-container').css('font-size', newContainerSize + 'em');

      _(family.provincias).each(function(provincia, k){
        if (!provincia.e) {
          $('body .provincias').append('<div id="' +k+ '" class="graphicProv" />');
          provincia.e = $('#'+k);

          provincia.e.html($('.js-graph-template' ).html());
        }
        transform(k, provincia);
        createGraphInProvince(k, provincia);
        return ;
        
      });


      function createGraphInProvince(key, d) {
        if (!family.provincias[key].active) {
          return;
        }
        d.e.find('.js-prov-name').html(d.name);
        family.graphDataValues(dataSet1[key], family.dataSet1MaxValue, family.maxHeight, d.e, 1);
        if (dataSet2)
          family.graphDataValues(dataSet2[key], family.dataSet2MaxValue, family.maxHeight, d.e, 2);
      }

      function transform(key, d) {
        if (!d.active) {
          d.e.hide();
          return;
        } else {
          d.e.show();
        }
        var d1 = new google.maps.LatLng(d.lat, d.lng);
        var d2 = projection.fromLatLngToDivPixel(d1);
        return d.e.css("left", (d2.x - paddingX) + "px").css("top", (d2.y - paddingY) + "px");
      }


      return;

    };
  };

  // Bind our overlay to the map…
  family.overlay.setMap(family.map);
}

family.loadViewFor = function(dataSet1Name, dataSet2Name) {
  var path = 'data/';
  d3.json(path + dataSet1Name + ".json", function(dataSet1) {
    if (!dataSet2Name) {
      return family.loadViewForData(dataSet1, false);
    }
    d3.json(path + dataSet2Name + ".json", function(dataSet2) {
      family.loadViewForData(dataSet1, dataSet2);
    });
  });
};


// Load the station data. When the data comes back, create an overlay.
d3.json("data/provinces-names.json", function(provincias) {
  family.provincias = provincias;
  console.log('Data de provincias.json', provincias);
  _(provincias).each(function(v,k){
    v.active = true;
    var html = '<label class="checkbox">';
    html += '<input type="checkbox" value="'+k+'" checked="checked">';
    html +=  v.name;
    html += '</label>';
    var prov = $(html);
    prov.find('input').change(function(){

      family.provincias[k].active = $(this).is(':checked');
      family.overlay.draw();
    });

    $('.js-provinces').append(prov);
  });

  loadDataUi('js-dataset1', 'salud-privados');
  loadDataUi('js-dataset2');
  refreshData();
});

function refreshData() {
  var pair = [];
  $('.js-dataset').each(function(){
    pair.push($(this).find('input:checked').val());
  });
  var prom = 'user@familia:~/hackaton-mapchart$ ';
  if (typeof(pair[1]) == "undefined") {
    $('#globalLabel').html(prom + 'cat ' + pair[0] + '.json | graph');
    family.loadViewFor(pair[0], null);
  } else  {
    $('#globalLabel').html(prom + 'cat ' + pair[0] + '.json ' + pair[1] + '.json | graph');
    family.loadViewFor(pair[0], pair[1]);
  }
}

function loadDataUi(s, def) {
  var $e = $('.'+s);
  
  _(family.dataSets).each(function(v,k){
    var html = '';
    html += '<label>';
    html += '<input type="radio" ';
    html += ' name="';
    html += s;
    html += '"';
    html += ' value="';
    html += v.dataset;
    html += '"';
    if (v.dataset  === def) {
      html += ' checked="checked"';
    }
    html += '>';
    
    html += v.name;
    html += '</label>'; 
    $e.append(html);
  });
  $e.find('input').change(function(){
    refreshData();
  });
  
}
