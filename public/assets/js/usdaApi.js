$(document).ready(function(){

  $('#searchInput').on('keypress', foo => {

    let original = $("#searchInput").val();

    let aSpace = original.replace(' ', 'A');

    let parsed = aSpace.replace(/[^0-9a-z]/gi, '');

    if(parsed === aSpace && original.trim() !== "") {
      //removing disabled
      console.log("Enabling button.");
      $("#searchBtn").removeAttr('disabled');
    }
    else{
      //adding disabled
      console.log("Disabling button.");
      $('#searchBtn').attr( 'disabled', 'disabled' );
    }


  });

  $.fn.extend({
    animateCss: function (animationName) {
      var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
      this.addClass('animated ' + animationName).one(animationEnd, function() {
        $(this).removeClass('animated ' + animationName);
      });
      return this;
    }
  });

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  function checkForEmptyString(string){
    if(string === ""){
      return null;
    }
    else {
      return string;
    }
  }
  function checkForEmptyInt(string){
    if(string === ""){
      return null;
    }
    else {
      var val = string;
      parseInt(val);

      return val;
    }
  }

  var nutritionObj = {
    "Name": '',
    "Serving Size": '',
    "Calories": '',
    "Total Fat": '',
    "Saturated Fat": '',
    "Trans Fat": '',
    "Cholesterol": '',
    "Sodium": '',
    "Total Carbohydrate": '',
    "Dietary Fiber": '',
    "Sugars": '',
    "Protein": '',
    "Vitamin A": '',
    "Vitamin C": '',
    "Calcium": '',
    "Iron": '',
    "USDA ID": ''
  }

  var api = {
    baseUrl: "https://api.nal.usda.gov/ndb/search/?format=json&sort=r&max=20&offset=0&api_key=sEypfLXBh6IJ2K7npHuoolMvrfH48HALizvk1mUD",
    filters: [],
    getFilters: function(){
      $('.filters').on('click', function(){
        if($(this).is(':checked')){
          api.filters.push($(this).data());
        }
      })
    },
    /**
    * [Create Query String with filters and query plus the baseUrl]
    * @return {[String]} [BaseUrl String with query and filters]
    */
    toQueryString: function(){
      var query = $('#searchInput').val();
      var queryStr = '';
      if (this.filters.length !== 0){
        for (var i in this.filters){
          queryStr += '&' +  Object.keys(this.filters[i]) + '=' + Object.values(this.filters[i]);
        }
        queryStr +=  '&' + "q=" + query;
      }
      else {
        queryStr = this.baseUrl + '&q=' + query;
      }
      return queryStr;
    },
    /**
    * [Ajax request from the API server]
    * @return {[JSON]} [Recipes Data]
    */
    requestNutritions: function(){
      $.ajax({
        url: this.toQueryString(),
        type: 'GET'
      }).done(function(data){
        console.log("data: " + data.list);
          if(!data.errors && data.list != null && data.list != 'undefined') {
            var dataArr = data.list.item;
            $('#cardsContainer').empty();
            for(var i=0; i < dataArr.length; i++){
              var ndbno = dataArr[i].ndbno;
              var nameArr = dataArr[i].name.split('UPC: ');
              var title = nameArr[0].toLowerCase();
              var captializeTitle = capitalizeFirstLetter(title).substring(0, 60);
              captializeTitle.length === 60 ? captializeTitle += '...' : captializeTitle;
              if(nameArr[1]){
                var content = 'UPC: ' + nameArr[1];
              }
              $('<a>')
              .addClass('nutritionCard animated fadeInUp delay-0'+i+'s')
              .attr('href', '#')
              .data('ndbno', ndbno)
              .addClass('col-lg-3')
              .append(
                $('<div>')
                .addClass('card')
                .append(
                  $('<div>')
                  .addClass('card-block')
                  .append(
                    $('<h4>')
                    .addClass('card-title')
                    .text(captializeTitle),
                    $('<p>')
                    .addClass('card-text')
                    .text(content)
                  )
                )
              ).appendTo('#cardsContainer');
            }
          }
          else {
            $('.errorAlert').css('display', 'block');
          }
      });
    },
    searchByNdbno: function(ndbno, cb){
      var url = "https://api.nal.usda.gov/ndb/reports/?ndbno="+ndbno+"&type=b&format=json&api_key=sEypfLXBh6IJ2K7npHuoolMvrfH48HALizvk1mUD";
      $.ajax({
        url: url,
        method: "GET"
      }).then(function(results){
        if(results.report.food.ru === 'ml'){
          nutritionObj["Serving Size"] = '100 ml';
        }
        else if(results.report.food.ru === 'g'){
          nutritionObj["Serving Size"] = '100 grams';
        }
        //Make an array out of the nutrients sent to us from USDA
        var nutrientsArr = results.report.food.nutrients;
        var nameArr = results.report.food.name.split('UPC: ');
        var nameString = nameArr[0].toLowerCase();
        nutritionObj["Name"] = checkForEmptyString(capitalizeFirstLetter(nameString).substring(0, 30));
        nutritionObj["Name"].length === 30 ? nutritionObj["Name"] += '...' : nutritionObj["Name"];
        if(results.report.food.name.indexOf("UPC") === -1){
          nutritionObj["USDA ID"] = 'N/A';
        }
        else {
          nutritionObj["USDA ID"] = nameArr[1];
        }
        //Going over each item of the nutrients array looking for our values
        nutrientsArr.forEach(function(currentValue, index, array) {
          if (nutrientsArr[index].name.includes("Energy") ){
            nutritionObj["Calories"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value)));
          }

          if (nutrientsArr[index].name.includes("Total lipid") ){
            nutritionObj["Total Fat"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value)));
          }

          if (nutrientsArr[index].name.includes("saturated") ){
            nutritionObj["Saturated Fat"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value)));
          }

          if (nutrientsArr[index].name.includes("trans") ){
            nutritionObj["Trans Fat"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value)));
          }

          if (nutrientsArr[index].name.includes("Cholesterol") ){
            nutritionObj["Cholesterol"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value)));
          }

          if (nutrientsArr[index].name.includes("Sodium") ){
            nutritionObj["Sodium"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value)));
          }

          if (nutrientsArr[index].name.includes("Carbohydrate") ){
            nutritionObj["Total Carbohydrate"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value)));
          }

          if (nutrientsArr[index].name.includes("Fiber") ){
            nutritionObj["Dietary Fiber"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value)));
          }

          if (nutrientsArr[index].name.includes("Sugars") ){
            nutritionObj["Sugars"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value)));
          }

          if (nutrientsArr[index].name.includes("Protein") ){
            nutritionObj["Protein"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value)));
          }

          if (nutrientsArr[index].name.includes("Vitamin A") === true && nutrientsArr[index].unit.includes("IU") === true){
            nutritionObj["Vitamin A"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value) / 5000) * 100);
          }

          if (nutrientsArr[index].name.includes("Vitamin C")  === true && nutrientsArr[index].unit.includes("mg") === true){
            nutritionObj["Vitamin C"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value) / 60) * 100);
          }

          if (nutrientsArr[index].name.includes("Calcium") ){
            nutritionObj["Calcium"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value) / 1000) * 100);
          }

          if (nutrientsArr[index].name.includes("Iron") ){
            nutritionObj["Iron"] = Math.round(parseFloat(checkForEmptyInt(nutrientsArr[index].value) / 18) * 100);
          }

        });
        cb(nutritionObj);
      });
    }
  }

  $('#cardsContainer').on('click', 'a.nutritionCard', function() {
    var ndbno = $(this).data().ndbno;
    api.searchByNdbno(ndbno, function(obj){
      console.log(obj)
      $.ajax({
        url: '/create',
        method:'POST',
        data: obj
      }).then(function(results){
        if(results){
          $('.modal-content').empty();
          $('.modal-content').append(results)
          $('#myModal').modal('show')
        }
      });
    });
  });

  // $('#searchInput').on('keydown', function(event){
  //   if ((event.which < 8) ||
  //     (event.which > 9 && event.which < 32) ||
  //     (event.which > 33 && event.which < 48) ||
  //     (event.which > 57 && event.which < 65) ||
  //     (event.which > 90 && event.which < 97) ||
  //     (event.which > 122))
  //   {
  //     event.preventDefault();
  //     $("#searchInput").val("");
  //   }

  $("#searchBtn").on('click',  foo => {
    event.preventDefault();
    // console.log("Submit");

    if($("#searchBtn").attr("disabled") === "disabled"){
      console.log("Search button is disabled");
    }
    else{
      $('#cardsContainer').empty();
      $('.errorAlert').css('display', 'none')
      api.requestNutritions()
    }
  });

  $(document).on('submit', "#searchForm",  foo => {
    event.preventDefault();
    console.log("Submit");

    if($("#searchBtn").attr("disabled") === "disabled"){
      console.log("Search button is disabled");
    }
    else{
      $('#cardsContainer').empty();
      $('.errorAlert').css('display', 'none')
      api.requestNutritions()
    }
  });

  $(document).ajaxStart(function(){
    $('#cooking').css('display', 'block');
  });
  //Hide loading#cooking after ajax call is complete

  $(document).ajaxComplete(function(){
    $('#cooking').css('display', 'none');
  });

});
