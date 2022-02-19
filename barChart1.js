//See Example here: https://www.d3-graph-gallery.com/graph/barplot_basic.html

class BarChart1 {

  constructor(_config, _data, _colorid) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 15, bottom: 50, right: 50, left: 60 }
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

    // X axis
    vis.xScale = d3.scaleBand()
    	.range([0, vis.width])
    	.domain(vis.data.map(d=>d.gas))
    	.padding(0.2);

    vis.xAxisG = vis.chart.append('g')
    	.attr("transform", `translate(0, ${vis.height})`)
    	.call(d3.axisBottom(vis.xScale))
    	.selectAll("text")
    		.attr("transform", "translate(-10,0)rotate(-45)")
    		.style("text-anchor", "end");

    // Y axis
    vis.yScale = d3.scaleLinear()
    	.domain([0, 1])
    	.range([vis.height, 0]);

    vis.yAxisG = vis.chart.append('g')
    	.call(d3.axisLeft(vis.yScale).tickFormat(d3.format(".0%")));

 //   	// Add X axis label:
	// vis.svg.append("text")
	//     .attr("text-anchor", "middle")
	//     .attr("font-weight", "bold")
	//     .attr("x", vis.width/2)
	//     .attr("y", vis.height + vis.config.margin.top + 30)
	//     .text("Gas");

	vis.chart.append("text")
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .attr("transform", "rotate(-90)")
        .attr("y", -vis.config.margin.left+20)
        .attr("x", -vis.config.margin.top+10)
        .style("font-size", "12px")
        .text("Percent of Days")

    vis.svg.append("text")
        .attr("x", vis.config.containerWidth/2)
        .attr("y", 14)
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Main Pollutants in Selected Year")

	if (vis.colorid == 0) {
        vis.color = d3.scaleOrdinal()
            .range(["#4b97c9"])
    }
    else {
        vis.color = d3.scaleOrdinal()
            .range(["#ef4533"])
    }

    vis.updateVis(vis.data);
  }

  updateVis(data) {
  	let vis = this;

    vis.data = data;

  	vis.rects = vis.chart.selectAll(".bar")
  		.data(vis.data)
  		.join("rect")
  			.attr("class", "bar")
  			.transition()
  			.duration(1000)
  			.attr("x", d=>vis.xScale(d.gas))
  			.attr("y", d=>vis.yScale(d.percent))
  			.attr("width", vis.xScale.bandwidth())
  			.attr("height", d=> vis.height - vis.yScale(d.percent))
  			.attr("fill", function(d){ return vis.color(d[0])})

    vis.chart.selectAll(".labels")
        .data(vis.data)
        .join("text")
            .attr("class", "labels")
            .text(function(d) { return (d.percent * 100).toFixed(2); })
            .attr("x", function(d){
                    return vis.xScale(d.gas) + vis.xScale.bandwidth() / 2;
                 })
            .attr("y", function(d){
                    return vis.height - 5;
                 })
            .attr("text-anchor", "middle")
            .attr("font-size" , "11px");

    

    //vis.rects
    //       .on('mouseover', (event,d) => {

    //       d3.select('#tooltip')
    //         .style('display', 'block')
    //         .style('left', (event.pageX + 10) + 'px')   
    //         .style('top', (event.pageY + 10) + 'px')
    //         .html(`
    //           <div class="tooltip-title">${d.gas}</div>
    //           <ul>
    //             <li>Days w/o Meas: ${d.percent}</li>
    //           </ul>
    //         `);
    //     })
    //     .on('mouseleave', () => {
    //       d3.select('#tooltip').style('display', 'none');
    //     }); 

  	console.log(data);
  }
  

}