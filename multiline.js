// See example: https://www.d3-graph-gallery.com/graph/line_several_group.html

class MultiLine {
  constructor(_config, _data, _colorid) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 30, bottom: 30, right: 100, left: 30 }
      //tooltipPadding: _config.tooltipPadding || 15
    }
    //this.dispatcher = _dispatcher;
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

 	// X axis
    vis.xScale = d3.scaleLinear()
    	//.domain([1980, 2021])
    	.range([0, vis.width]);

    vis.xAxisG = d3.axisBottom(vis.xScale).tickFormat(d3.format("d"));
    vis.chart.append('g')
    	.attr("transform",  `translate(0, ${vis.height})`)
    	.attr("class", "myX")

    // Y axis
    vis.yScale = d3.scaleLinear()
    	//.domain([0, d3.max(vis.data, d=>d.value)])
    	.range([vis.height, 0]);
    
    vis.yAxisG = d3.axisLeft(vis.yScale)
    vis.chart.append('g')
    	.attr("class", "myY")

   	vis.svg.append("text")
    	.attr("x", vis.config.containerWidth/2 - 30)
    	.attr("y", 15)
    	.attr("font-weight", "bold")
    	.attr("text-anchor", "middle")
    	.style("font-size", "20px")
    	.text("AQI Statistics")


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
	    .text("AQI")
    
    vis.keys = ["Max", "Median", "90th perc"];
    vis.color = d3.scaleOrdinal()
    	.domain(vis.keys);

	if (vis.colorid == 0) {
		vis.color.range(["#cfe1f2","#4b97c9","#08306b"])
	}
	else {
    	vis.color.range(["#fdc9b4","#ef4533","#67000d"])
    }

    

    vis.svg.selectAll("legdots")
    	.data(vis.keys)
    	.enter()
    	.append("circle")
    		.attr("cx", vis.width + vis.config.margin.left + 10)
    		.attr("cy", function(d,i){ return vis.config.margin.top + i*25})
    		.attr("r", 5)
    		.style("fill", function(d){ return vis.color(d)})

	vis.svg.selectAll("leglabels")
		.data(vis.keys)
		.enter()
		.append("text")
		    .attr("x", vis.width + vis.config.margin.left + 20)
		    .attr("y", function(d,i){ return vis.config.margin.top + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
		    .style("fill", function(d){ return vis.color(d)})
		    .text(function(d){ return d})
		    .attr("text-anchor", "left")
		    .style("alignment-baseline", "middle")

		// We need to make sure that the tracking area is on top of other chart elements
    //vis.marks = vis.chart.append('g');
    // vis.trackingArea = vis.chart.append('rect')
    //     .attr('width', vis.width)
    //     .attr('height', vis.height)
    //     .attr('fill', 'none')
    //     .attr('pointer-events', 'all');

    //     //(event,d) => {



    // // Empty tooltip group (hidden by default)
    // vis.tooltip = vis.chart.append('g')
    //     .attr('class', 'tooltip')
    //     .style('display', 'none');

    // vis.tooltip.append('rect');

    // vis.tooltip.append('text')
    //   	.style("opacity", 1)
    //   	.attr("text-anchor", "middle")
    //   	.attr("alignment-baseline", "middle")
   

    // vis.svg.selectAll(".highlight")
    //     .data([2021])
    //   .join("rect")
    //     .attr("class", "highlight")
    //     .attr('x', vis.width+vis.config.margin.left - 5)
    //     //.attr('x', function(d) { return (vis.xScale(d) - 5);})
    //     .attr('y', vis.config.margin.top)
    //     .attr("width", 5)
    //     .attr("height", vis.height)
    //     .attr('fill', '#69a3b2');
  

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
  	
  	vis.xScale.domain(d3.extent(data, d => d.year));
  	vis.chart.selectAll(".myX").transition()
  		.duration(1000)
  		.call(vis.xAxisG);

  	vis.yScale.domain([0, d3.max(data, d=>d.value)]);
  	vis.chart.selectAll(".myY").transition()
  		.duration(1000)
  		.call(vis.yAxisG);

  	vis.grouped_data = d3.group(data, d=>d.stat);
    console.log(vis.grouped_data);
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
            for(let i = 0; i < vis.data.length; i++){
	          	if (d.year == vis.data[i].year && vis.data[i].stat == "max"){
	          		d.max = vis.data[i].value;
	          	}
	          	else if (d.year == vis.data[i].year && vis.data[i].stat == "med") {
	          		d.med = vis.data[i].value;
	          	}
	          	else if (d.year == vis.data[i].year && vis.data[i].stat == "ninety"){
	          		d.ninety = vis.data[i].value;
	          	}
	          }

          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + 10) + 'px')   
            .style('top', (event.pageY + 10) + 'px')
            .html(`
              <div class="tooltip-title">${d.year}</div>
              <ul>
                <li>Max: ${d.max}</li>
                <li>Median: ${d.med}</li>
                <li>90th Perc: ${d.ninety}</li>
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
//   	//vis.bisectDate = d3.bisector(d => d.year).left;
  	//vis.bisectAQI = d3.bisector(d => d.value).left;

  	// vis.trackingArea
  	// 	// .on('click', function(event, d) {
  	// 	// const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
   //  //       const year = vis.xScale.invert(xPos);
         
   //  //       // Find nearest data point
   //  //       const indX= vis.bisectDate(vis.data, year, 1);
   //  //       const a = vis.data[indX - 1];
   //  //       const b = vis.data[indX];
   //  //       const c = b && (year - a.year > b.year - year) ? b : a;
	  //  //        // Check if current category is active and toggle class
	  //  //        // const isActive = d3.select(this).classed('active');
	  //  //        // d3.select(this).classed('active', !isActive);

	  //  //        // Get the names of all active/filtered categories
	  //  //        //const selectedCategories = vis.chart.selectAll('.bar.active').data().map(k => k.key);
	  //  //    const selectedYear = c.year;
	  //  //        // Trigger filter event and pass array with the selected category names
	  //  //    vis.dispatcher.call('filterYears', event, slectedYear);
	  //  //    console.log("Hi")
	  //  //   })
   //      .on('mouseenter', () => {
   //        vis.tooltip.style('display', 'block');
   //      })
   //      .on('mouseleave', () => {
   //        vis.tooltip.style('display', 'none');
   //      })
   //      .on('mousemove', function(event) {
   //        // Get date that corresponds to current mouse x-coordinate
   //        const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
   //        const yPos = d3.pointer(event,this)[1];
   //        const year = vis.xScale.invert(xPos);
   //        const AQI = vis.yScale.invert(yPos);

   //        // Find nearest data point
   //        const indX= vis.bisectDate(vis.data, year, 1);
   //        const indY= vis.bisectAQI(vis.data, AQI, 1);
   //        const a = vis.data[indX - 1];
   //        const b = vis.data[indX];
   //        const d = b && (year - a.year > b.year - year) ? b : a; 
         
          
   //        for(let i = 0; i < vis.data.length; i++){
   //        	if (d.year == vis.data[i].year && vis.data[i].stat == "max"){
   //        		d.max = vis.data[i].value;
   //        	}
   //        	else if (d.year == vis.data[i].year && vis.data[i].stat == "med") {
   //        		d.med = vis.data[i].value;
   //        	}
   //        	else if (d.year == vis.data[i].year && vis.data[i].stat == "ninety"){
   //        		d.ninety = vis.data[i].value;
   //        	}
   //        }
   //        console.log(d)
          
   //    	  vis.tooltip.select('rect')
   //        	.attr('transform', `translate(${vis.xScale(d.year)},${0})`);
          	
   //        vis.tooltip.select('text')
   //        	.attr('transform', `translate(${vis.xScale(d.year)},${130})`)
   //        	.html('Max='+d.max+', Med='+d.med+', 90%='+d.ninety);
   //        // }
   //        // else{
   //        // 	vis.tooltip.select('text')
	  //        //  	.attr('transform', `translate(${vis.xScale(d.year)},${10})`)
	  //        //  	.html(d.year+': Max='+d.max+', Med='+d.med+', 90%='+d.ninety);
   //        // }
   //        // Update tooltip
   //        // vis.tooltip.select('circle')
   //        //     .attr('transform', `translate(${vis.xScale(d.date)},${vis.yScale(d.close)})`);
          
   //        // vis.tooltip.select('text')
   //        //     .attr('transform', `translate(${vis.xScale(d.year )},${(vis.yScale(d.cost) - 15)})`)
   //        //     .text(Math.round(d.cost));
          
   //        });
          
  