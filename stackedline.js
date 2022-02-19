// See example: https://www.d3-graph-gallery.com/graph/line_several_group.html

class StackedLine {
  constructor(_config, _data, _colorid) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 30, bottom: 30, right: 100, left: 35 }
    }

    this.data = _data;
    this.colorid = _colorid;
    // Call a class function
    this.initVis();
  }

  initVis() {
  	let vis = this;

  	vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
  	vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

  	// Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Y axis
    vis.yScale = d3.scaleLinear()
    	.domain([0, 100])
    	.range([vis.height, 0]);
    
    vis.yAxisG = vis.chart.append('g')
    	.call(d3.axisLeft(vis.yScale))

    // X axis
    vis.xScale = d3.scaleLinear()
    	//.domain([1980, 2021])
    	.range([0, vis.width]);

    vis.xAxisG = d3.axisBottom(vis.xScale).tickFormat(d3.format("d"));
    vis.chart.append('g')
    	.attr("transform",  `translate(0, ${vis.height})`)
    	.attr("class", "myX")

   	vis.svg.append("text")
    	.attr("x", vis.config.containerWidth/2 - 30)
    	.attr("y", 15)
    	.attr("font-weight", "bold")
    	.attr("text-anchor", "middle")
    	.style("font-size", "20px")
    	.text("Percent of Days where Each Gas was Main Pollutant")

	// Add X axis label:
	vis.svg.append("text")
	    .attr("text-anchor", "start")
	    .attr("font-weight", "bold")
	    .style("font-size", "16px")
	    .attr("x", vis.width + vis.config.margin.left+10)
	    .attr("y", vis.height+vis.config.margin.top+8)
	    .text("Year");

	// Y axis label:
	vis.svg.append("text")
	    .attr("text-anchor", "start")
	    .attr("font-weight", "bold")
	    .style("font-size", "16px")
	    .attr("y", 20)
	    .attr("x", 10)
	    .text("Percent(%)")

	vis.keys = ["CO", "NO2", "O3", "SO2", "PM2.5", "PM10"];
    vis.color = d3.scaleOrdinal()
    	.domain(vis.keys);

    if (vis.colorid == 0) {
    	vis.color.range(["#cfe1f2","#93c3df","#4b97c9","#1864aa","#08306b", "#00000f"])
	}
	else {
    	vis.color.range(["#fdc9b4","#fc8a6b","#ef4533","#bb151a","#67000d", "#0e0000"])
    }

    vis.svg.selectAll("legdots")
    	.data(vis.keys)
    	.enter()
    	.append("circle")
    		.attr("cx", vis.width + vis.config.margin.left + 10)
    		.attr("cy", function(d,i){ return 10 + i*25})
    		.attr("r", 5)
    		.style("fill", function(d){ return vis.color(d)})

	vis.svg.selectAll("leglabels")
		.data(vis.keys)
		.enter()
		.append("text")
		    .attr("x", vis.width + vis.config.margin.left + 20)
		    .attr("y", function(d,i){ return 10 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
		    .style("fill", function(d){ return vis.color(d)})
		    .text(function(d){ return d})
		    .attr("text-anchor", "left")
		    .style("alignment-baseline", "middle")

    vis.updateVis(vis.data);
  }

  updateVis(data) {
  	let vis = this;

  	vis.data = data;

  	vis.chart.selectAll('.line')
        .data([])
        .exit().remove();
    vis.chart.selectAll('.dot')
        .data([])
        .exit().remove();
  	
  	vis.grouped_data = d3.group(data, d=>d.gas);

  	vis.xScale.domain(d3.extent(data, d => d.year));
  	vis.chart.selectAll(".myX").transition()
  		.duration(1000)
  		.call(vis.xAxisG);


  	vis.chart.selectAll(".line")
  		.data(vis.grouped_data)
  		.join("path")
  			.attr("class","line")
  			.transition()
  			.duration(1000)
  			.attr("fill", "none")
  			.attr("stroke", function(d){ return vis.color(d[0])})
  			.attr("stroke-width", 1.5)
  			.attr("d", function(d){
  				return d3.line()
  					.x(d => vis.xScale(d.year))
  					.y(d => vis.yScale(d.value))
  					(d[1])
  			})

  	vis.circles = vis.chart.selectAll(".dot")	
        .data(vis.data)			
    	.join("circle")	
    		.attr("class", "dot")							
        	.attr("r", 7)
        	.attr("fill", function(d){ return vis.color(d[0])})	
        	.style("opacity", 0)
        	.attr("cx", function(d) { return vis.xScale(d.year); })		 
        	.attr("cy", function(d) { return vis.yScale(d.value); })	

    vis.circles
          .on('mouseover', (event,d) => {
          console.log(d);
          for(let i = 0; i < vis.data.length; i++){
	          	if (d.year == vis.data[i].year && vis.data[i].gas == "CO"){
	          		d.CO = vis.data[i].value;
	          	}
	          	else if (d.year == vis.data[i].year && vis.data[i].gas == "NO2") {
	          		d.NO2 = vis.data[i].value;
	          	}
	          	else if (d.year == vis.data[i].year && vis.data[i].gas == "O3"){
	          		d.O3 = vis.data[i].value;
	          	}
	          	else if (d.year == vis.data[i].year && vis.data[i].gas == "SO2"){
	          		d.SO2 = vis.data[i].value;
	          	}
	          	else if (d.year == vis.data[i].year && vis.data[i].gas == "PM2.5"){
	          		d.PM2 = vis.data[i].value;
	          	}
	          	else if (d.year == vis.data[i].year && vis.data[i].gas == "PM10"){
	          		d.PM10 = vis.data[i].value;
	          	}
	      }

          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + 10) + 'px')   
            .style('top', (event.pageY + 10) + 'px')
            .html(`
              <div class="tooltip-title">${d.year}</div>
              <ul>
                <li>CO: ${d.CO.toFixed(2)}%</li>
                <li>NO2: ${d.NO2.toFixed(2)}%</li>
                <li>O3: ${d.O3.toFixed(2)}%</li>
                <li>SO2: ${d.SO2.toFixed(2)}%</li>
                <li>PM2.5: ${d.PM2.toFixed(2)}%</li>
                <li>PM10: ${d.PM10.toFixed(2)}%</li>
              </ul>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });	
    vis.renderVis(2021);
  }
  renderVis(year){
    let vis = this;

    vis.svg.selectAll('.highlight')
        .data([])
        .exit().remove();

    vis.svg.selectAll(".highlight")
        .data([year])
      .join("rect")
        .attr("class", "highlight")
        //.attr('x', vis.width+vis.config.margin.left - 5)
        .attr('x', function(d) { return (vis.xScale(d) + vis.config.margin.left - 3);})
        .attr('y', vis.config.margin.top)
        .attr("width", 6)
        .attr("height", vis.height)
        .attr('fill', '#d3d3d3')
        .attr('opacity', 0.5)
  }
}
// class StackedLine {

// 	constructor(_config, _data) {
//     this.config = {
//       parentElement: _config.parentElement,
//       containerWidth: _config.containerWidth || 500,
//       containerHeight: _config.containerHeight || 140,
//       margin: { top: 10, bottom: 30, right: 50, left: 50 }
//       //displayType: 'absolute'
//     }
//     this.data = _data;
//     this.initVis();
//   }

//   initVis() {
//   	let vis = this;

//   	vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
//     vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

//     vis.xScale = d3.scaleLinear()
//         .range([0, vis.width]);

//     vis.yScale = d3.scaleLinear()
//         .range([vis.height, 0]);

//     // Initialize axes
//     vis.xAxis = d3.axisBottom(vis.xScale)
//         .tickFormat(d3.format("d")); // Remove thousand comma

//     vis.yAxis = d3.axisLeft(vis.yScale)
//         .tickSize(-vis.width)
//         .tickPadding(10);

//     // Define size of SVG drawing area
//     vis.svg = d3.select(vis.config.parentElement)
//         .attr('width', vis.config.containerWidth)
//         .attr('height', vis.config.containerHeight);

//     // Append group element that will contain our actual chart (see margin convention)
//     vis.chartContainer = vis.svg.append('g')
//         .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

//     vis.chart = vis.chartContainer.append('g');

//     vis.xAxisG = vis.chart.append('g')
//         .attr('class', 'axis x-axis')
//         .attr('transform', `translate(0,${vis.height})`);

//     vis.yAxisG = vis.chart.append('g')
//         .attr('class', 'axis y-axis');

//     vis.stack = d3.stack()
//         .keys(['DaysCO','DaysNO2', 'DaysOzone', 'DaysSO2', 'DaysPM2_5', 'DaysPM10']);
//     const stackedData = vis.stack(vis.data);
// 	console.log(stackedData);

// 	vis.updateVis()

//   }
//   updateVis(){
//   	let vis = this;

//   	vis.stackedData = vis.stack(vis.data);
//   	console.log(vis.stackedData);

//   	vis.area = d3.area()
//   		.x((d) => vis.xScale(d.Year))
//   		.y0((d) => vis.yScale(d[1]))
//   		.y1((d) => vis.yScale(d[1]));

//   	vis.xScale.domain(d3.extent(vis.data, (d) => d.Year));
//   	vis.yScale.domain([0, 100]);
//   	vis.yAxis.tickFormat(d => `${d}%`);

//   	vis.chart.selectAll('.area-path')
//         .data(vis.stackedData)
//         .enter()
//       .append('path')
//         .attr('class', 'area-path')
//         .attr('d', vis.area)
  	
//   }
// }