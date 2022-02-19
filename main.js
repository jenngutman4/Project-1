console.log("Hello world");
let data, state_data, all_data;
let linechart, stackedline, noMeasLine, gasBarChart, catBarChart;
let gasCurrYear, AQICurrYear;

let countyBox, stateBox, yearBox, countyOpts, stateOpts, yearOpts;
let ddState, ddCounty, ddYear = [];

let data2, state_data2, all_data2;
let linechart2, stackedline2, noMeasLine2, gasBarChart2, catBarChart2;
let gasCurrYear2, AQICurrYear2;

let countyBox2, stateBox2, countyOpts2, stateOpts2;
let ddState2, ddCounty2 = [];

let currYear = 2021;

let geoData, allAQIdata;
let chloroplethMap;

const selectSt = ["<select state>"];
const selectCt = ["<select county>"];
const selectYr = ["<select year>"];

//const dispatcher = d3.dispatch('filterYears');

const time = [1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995,
            1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
            2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021];

function changeStat(stat) {
  chloroplethMap.updateVis(geoData, stat)
  console.log(stat);
}

function changeYear(){
  let mapYear = d3.select("#years").property('value');
  console.log(mapYear);
  year_data = allAQIdata.filter((d) => +d.Year == mapYear);
  console.log(year_data);

  // Combine both datasets by adding the population density to the TopoJSON file
  geoData.objects.counties.geometries.forEach(d=>{
    delete d.properties['maxVal'];
    delete d.properties['medVal'];
    delete d.properties['nineVal'];
  });
  console.log(geoData);
  geoData.objects.counties.geometries.forEach(d => {
    //console.log(d);  
    for (let i = 0; i < year_data.length; i++) {
      //console.log(d.id);

      if (d.id === year_data[i].fips) {
        d.properties.maxVal = +year_data[i].MaxAQI;
        d.properties.medVal = +year_data[i].MedianAQI;
        d.properties.nineVal = +year_data[i].NinetyPercentileAQI;
      }

    }
  });
  chloroplethMap.updateVis(geoData, "maxVal")
}

Promise.all([
  d3.json('data/counties-10m.json'),
  d3.csv('data/AQI_data.csv')
]).then(_data => {
  console.log('Data loading complete. Work with dataset.');
  geoData = _data[0];
  allAQIdata = _data[1];
  all_data = allAQIdata;
  all_data2 = allAQIdata;

  geoData.objects.counties.geometries.forEach(d => {
    if(d.id[0] == 0){
      d.id= d.id.replace(/^0+/, '');
      console.log(d.id);
    }
  })

  year_data = allAQIdata.filter((d) => +d.Year == 2021);
  console.log(year_data);

  // Combine both datasets by adding the population density to the TopoJSON file
  //console.log(geoData);
  

  geoData.objects.counties.geometries.forEach(d => {
    //console.log(d);  
    for (let i = 0; i < year_data.length; i++) {
      //console.log(d.id);

      if (d.id === year_data[i].fips) {
        d.properties.maxVal = +year_data[i].MaxAQI;
        d.properties.medVal = +year_data[i].MedianAQI;
        d.properties.nineVal = +year_data[i].NinetyPercentileAQI;
      }

    }
  });

  chloroplethMap = new ChoroplethMap({ 
    parentElement: '.viz',   
  }, geoData);
    
    state_data = all_data.filter((d) => d.State == "Ohio");
    data = state_data.filter((d) => d.County == "Hamilton");
    state_data2 = all_data2.filter((d) => d.State == "Indiana");
    data2 = state_data2.filter((d) => d.County == "Bartholomew");

    data = prep_data(data);
    let county1_stats = prep_stats(data);
    let county1_gas = prep_gas(data);
    data = count_No_Meas(data);
    barData(currYear);
    
    data2 = prep_data(data2);
    let county2_stats = prep_stats(data2);
    let county2_gas = prep_gas(data2);
    data2 = count_No_Meas(data2);
    barData2(currYear);

    var sliderStep = d3
      .sliderBottom()
      .min(d3.min(time))
      .max(d3.max(time))
      .width(450)
      .tickFormat(d3.format("d"))
      .ticks(10)
      .step(1)
      .default(2021)
      .on('onchange', val => {
        yearOpts1 = [... new Set(data.map((d) => d.Year))];
        yearOpts2 = [... new Set(data2.map((d) => d.Year))];
        if (yearOpts1.indexOf(val) == -1 || yearOpts2.indexOf(val) == -1){
          d3.select('p#value-step').text("Data is not available in both counties for this year. Showing "+currYear);
        }
        else {
          d3.select('p#value-step').text("Showing "+sliderStep.value());
          currYear = val;
          console.log(currYear);
          barData(currYear);
          gasBarChart.updateVis(gasCurrYear);
          catBarChart.updateVis(AQICurrYear);
          barData2(currYear);
          gasBarChart2.updateVis(gasCurrYear2);
          catBarChart2.updateVis(AQICurrYear2);

          linechart.renderVis(val);
          linechart2.renderVis(val);
          stackedline.renderVis(val);
          stackedline2.renderVis(val);
          noMeasLine.renderVis(val);
          noMeasLine2.renderVis(val);
        } 
          

          // year_data = allAQIdata.filter((d) => +d.Year == currYear);
          // console.log(year_data);

          // // Combine both datasets by adding the population density to the TopoJSON file
          // //console.log(geoData);
          // geoData.objects.counties.geometries.forEach(d => {
          //   //console.log(d);  
          //   for (let i = 0; i < year_data.length; i++) {
          //     //console.log(d.id);

          //     if (d.id === year_data[i].fips) {
          //       d.properties.maxVal = +year_data[i].MaxAQI;
          //     }

          //   }
          // });
          // chloroplethMap.updateVis(geoData)
      });

    var gStep = d3
      .select('div#slider-step')
      .append('svg')
      .attr('width', 500)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(30,30)');

    gStep.call(sliderStep);

    d3.select('p#value-step').text("Showing "+sliderStep.value());

    // THIS IS WHERE DROP DOWN IS
    ddState = selectSt.concat([... new Set(all_data.map((d) => d.State))]);  //maybe remove Canada, Mexico, Guam, etc.
    console.log(ddState);
    stateBox = d3.select("#stateDropdown")
      .append('select')
        .attr('class','select')
        .on('change',onchange);

    stateOpts = stateBox
      .selectAll('option')
      .data(ddState).enter()
      .append('option')
        .text(function (d) { return d; });

    countyBox = d3.select("#countyDropdown")
        .append('select')
          .attr('class','select')
          .on('change',onchange2);

    // yearBox = d3.select("#yearDropdown")
    //     .append('select')
    //       .attr('class','select')
    //       .on('change',onchange5);

    ddState2 = selectSt.concat([... new Set(all_data2.map((d) => d.State))]);  //maybe remove Canada, Mexico, Guam, etc.

    stateBox2 = d3.select("#stateDropdown2")
      .append('select')
        .attr('class','select')
        .on('change',onchange3);

    stateOpts2 = stateBox2
      .selectAll('option')
      .data(ddState2).enter()
      .append('option')
        .text(function (d) { return d; });

    countyBox2 = d3.select("#countyDropdown2")
        .append('select')
          .attr('class','select')
          .on('change',onchange4);




    function onchange() {
      selectState = stateBox.property('value');
      state_data = all_data.filter((d) => d.State == selectState);
      ddCounty = selectCt.concat([... new Set(state_data.map((d) => d.County))]);
      console.log(ddCounty);
      console.log(state_data);

      countyOpts = countyBox
        .selectAll('option')
        .data(ddCounty)
        .join('option')
          .text(function (d) { return d; });

    };

    function onchange2() {
        selectCounty = countyBox.property('value');
        console.log(selectCounty);
        console.log(state_data);
        data = state_data.filter((d) => d.County == selectCounty);
        //ddYear = selectYr.concat([... new Set(data.map((d) => d.Year))]);
        //console.log(ddYear);

        // yearOpts = yearBox
        //   .selectAll('option')
        //   .data(ddYear)
        //   .join('option')
        //     .text(function (d) { return d; });

        console.log(data);
        data = prep_data(data);
        county1_stats = prep_stats(data);
        county1_gas = prep_gas(data);
        data = count_No_Meas(data);
        console.log(county1_stats);
        console.log(data);


    //Create data set for bar charts for selected year
        barData(currYear);
        console.log(data);
        linechart.updateVis(county1_stats);
        stackedline.updateVis(county1_gas);
        noMeasLine.updateVis(data);
        gasBarChart.updateVis(gasCurrYear);
        catBarChart.updateVis(AQICurrYear);

    };

    // function onchange5() {
    //   selectYear = yearBox.property('value');
    //   barData(selectYear);
    //   gasBarChart.updateVis(gasCurrYear);
    //   catBarChart.updateVis(AQICurrYear);
    // };

    function onchange3() {
      selectState2 = stateBox2.property('value');
      state_data2 = all_data2.filter((d) => d.State == selectState2);
      ddCounty2 = selectCt.concat([... new Set(state_data2.map((d) => d.County))]);
      console.log(state_data2);

      countyOpts2 = countyBox2
        .selectAll('option')
        .data(ddCounty2)
        .join('option')
          .text(function (d) { return d; });

    };

    function onchange4() {
        selectCounty2 = countyBox2.property('value');
        console.log(selectCounty2);
        console.log(state_data2);
        data2 = state_data2.filter((d) => d.County == selectCounty2);
        
        data2 = prep_data(data2);
        county2_stats = prep_stats(data2);
        county2_gas = prep_gas(data2);
        data2 = count_No_Meas(data2);
        console.log(county2_stats);

    //Create data set for bar charts for selected year
        barData2(currYear);
        console.log(data2);
        linechart2.updateVis(county2_stats);
        stackedline2.updateVis(county2_gas);
        noMeasLine2.updateVis(data2);
        gasBarChart2.updateVis(gasCurrYear2);
        catBarChart2.updateVis(AQICurrYear2);

    };

    linechart = new MultiLine({
      'parentElement': '#line',
      'containerHeight': 200,
      'containerWidth': 950
    }, county1_stats, 0);
    
    stackedline = new StackedLine({
      'parentElement': '#stacked-line',
      'containerHeight': 200,
      'containerWidth': 950
    }, county1_gas, 0);

    noMeasLine = new NoMeasLine({
      'parentElement': '#num-meas-line',
      'containerHeight': 200,
      'containerWidth': 500
    }, data, 0);

    gasBarChart = new BarChart1({
      'parentElement': '#gas-bar',
      'containerHeight': 250,
      'containerWidth': 500
    }, gasCurrYear, 0);

    catBarChart = new BarChart2({
      'parentElement': '#cat-bar',
      'containerHeight': 250,
      'containerWidth': 500
    }, AQICurrYear, 0);

    linechart2 = new MultiLine({
      'parentElement': '#line2',
      'containerHeight': 200,
      'containerWidth': 950
    }, county2_stats, 1);
    
    stackedline2 = new StackedLine({
      'parentElement': '#stacked-line2',
      'containerHeight': 200,
      'containerWidth': 950
    }, county2_gas, 1);

    noMeasLine2 = new NoMeasLine({
      'parentElement': '#num-meas-line2',
      'containerHeight': 200,
      'containerWidth': 500
    }, data2, 1);

    gasBarChart2 = new BarChart1({
      'parentElement': '#gas-bar2',
      'containerHeight': 250,
      'containerWidth': 500
    }, gasCurrYear2, 1);

    catBarChart2 = new BarChart2({
      'parentElement': '#cat-bar2',
      'containerHeight': 250,
      'containerWidth': 500
    }, AQICurrYear2, 1);

    
  })
  .catch(error => {
    console.error('Error loading the data');
  });

function isleapyear(year) {
  return (year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0);
}

function prep_data(localData) {
  localData.forEach(d => {
      d.MaxAQI =  +d.MaxAQI;
      d.MedianAQI =  +d.MedianAQI;
      d.NinetyPercentileAQI =  +d.NinetyPercentileAQI;
      d.DaysWithAQI = +d.DaysWithAQI;
      d.DaysCOPer = (+d.DaysCO)/d.DaysWithAQI;
      d.DaysNO2Per = (+d.DaysNO2)/d.DaysWithAQI;
      d.DaysOzonePer = (+d.DaysOzone)/d.DaysWithAQI;
      d.DaysSO2Per = (+d.DaysSO2)/d.DaysWithAQI;
      d.DaysPM2_5Per = (+d.DaysPM2_5)/d.DaysWithAQI;
      d.DaysPM10Per = (+d.DaysPM10)/d.DaysWithAQI;
      d.GoodDaysPer = (+d.GoodDays)/d.DaysWithAQI;
      d.ModerateDaysPer = (+d.ModerateDays)/d.DaysWithAQI;
      d.UnhealthyForSensitiveGroupsDaysPer = (+d.UnhealthyForSensitiveGroupsDays)/d.DaysWithAQI;
      d.UnhealthyDaysPer = (+d.UnhealthyDays)/d.DaysWithAQI;
      d.VeryUnhealthyDaysPer = (+d.VeryUnhealthyDays)/d.DaysWithAQI;
      d.HazardousDaysPer = (+d.HazardousDays)/d.DaysWithAQI;
      d.Year = +d.Year;
    })
  return localData;
}

function prep_stats(localData){
    // Data for the statsLine
    let countyStats = [];
    for (let i = 0; i < localData.length; i++){
      countyStats[3*i] = {stat: 'max', year: localData[i].Year, value: localData[i].MaxAQI};
      countyStats[3*i+1] = {stat: 'med', year: localData[i].Year, value: localData[i].MedianAQI};
      countyStats[3*i+2] = {stat: 'ninety', year: localData[i].Year, value: localData[i].NinetyPercentileAQI};
    }
    return countyStats;
}

function prep_gas(localData){
    let gasStats = [];
    for (let i = 0; i < localData.length; i++){
      gasStats[6*i] = {gas: 'CO', year: localData[i].Year, value: localData[i].DaysCOPer*100};
      gasStats[6*i+1] = {gas: 'NO2', year: localData[i].Year, value: localData[i].DaysNO2Per*100};
      gasStats[6*i+2] = {gas: 'O3', year: localData[i].Year, value: localData[i].DaysOzonePer*100};
      gasStats[6*i+3] = {gas: 'SO2', year: localData[i].Year, value: localData[i].DaysSO2Per*100};
      gasStats[6*i+4] = {gas: 'PM2.5', year: localData[i].Year, value: localData[i].DaysPM2_5Per*100};
      gasStats[6*i+5] = {gas: 'PM10', year: localData[i].Year, value: localData[i].DaysPM10Per*100};
    }
    console.log(gasStats);
    return gasStats;
}

function count_No_Meas(localData) {
    //Count days without a measurement
    for (let i = 0; i < localData.length; i++){
      if(isleapyear(localData[i].Year)) {
        localData[i].daysNoMeas = 366 - localData[i].DaysWithAQI;
      }
      else{
        localData[i].daysNoMeas = 365 - localData[i].DaysWithAQI;
      }
    }
    return localData;
}

function barData(year) {
  let currIDX = data.length - 1;
  for (let i = 0; i < data.length; i++) {
    if (year == data[i].Year) {
      currIDX = i;
      break;
    }
  }
  currYear = data[currIDX].Year;

  gasCurrYear = [
      {gas: 'CO', percent: data[currIDX].DaysCOPer},
      {gas: 'NO2', percent: data[currIDX].DaysNO2Per},
      {gas: 'O3', percent: data[currIDX].DaysOzonePer},
      {gas: 'SO2', percent: data[currIDX].DaysSO2Per},
      {gas: 'PM2.5', percent: data[currIDX].DaysPM2_5Per},
      {gas: 'PM10', percent: data[currIDX].DaysPM10Per}
    ];

    AQICurrYear = [
      {cat: 'Good', percent: data[currIDX].GoodDaysPer},
      {cat: 'Moderate', percent: data[currIDX].ModerateDaysPer},
      {cat: 'Unh. for Sensitive', percent: data[currIDX].UnhealthyForSensitiveGroupsDaysPer},
      {cat: 'Unhealthy', percent: data[currIDX].UnhealthyDaysPer},
      {cat: 'Very Unhealthy', percent: data[currIDX].VeryUnhealthyDaysPer},
      {cat: 'Hazardous', percent: data[currIDX].HazardousDaysPer}
    ];
}

function barData2(year) {
  let currIDX = data2.length - 1;
  for (let i = 0; i < data2.length; i++) {
    if (year == data2[i].Year) {
      currIDX = i;
      break;
    }
  }

  gasCurrYear2 = [
      {gas: 'CO', percent: data2[currIDX].DaysCOPer},
      {gas: 'NO2', percent: data2[currIDX].DaysNO2Per},
      {gas: 'O3', percent: data2[currIDX].DaysOzonePer},
      {gas: 'SO2', percent: data2[currIDX].DaysSO2Per},
      {gas: 'PM2.5', percent: data2[currIDX].DaysPM2_5Per},
      {gas: 'PM10', percent: data2[currIDX].DaysPM10Per}
    ];

    AQICurrYear2 = [
      {cat: 'Good', percent: data2[currIDX].GoodDaysPer},
      {cat: 'Moderate', percent: data2[currIDX].ModerateDaysPer},
      {cat: 'Unh. for Sensitive', percent: data2[currIDX].UnhealthyForSensitiveGroupsDaysPer},
      {cat: 'Unhealthy', percent: data2[currIDX].UnhealthyDaysPer},
      {cat: 'Very Unhealthy', percent: data2[currIDX].VeryUnhealthyDaysPer},
      {cat: 'Hazardous', percent: data2[currIDX].HazardousDaysPer}
    ];
}

 // dispatcher.on('filterYears', selectedYear => {
 //    currYear = selectedYear;
 //    console.log(currYear);
 //  // if (selectedYear.length == 0) {
 //  //   scatterplot.data = data;
 //  // } else {
 //  //   scatterplot.data = data.filter(d => selectedCategories.includes(d.difficulty));
 //  // }
 //  // scatterplot.updateVis();
 // });
