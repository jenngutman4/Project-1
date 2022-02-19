class NoMeasLine {

  constructor(_config, _data, _colorid) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 30, bottom: 30, right: 100, left: 30 }
    }

    this.data = _data;
    this.colorid = _colorid;

    // Call a class function
    this.initVis();
  }
  initVis() {
      
    let vis = this; 

    //set up the width and height of the area where visualizations will go- factoring in margins               
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

     // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    //setup scales
    vis.xScale = d3.scaleLinear()
        .range([0, vis.width])

    vis.xAxisG = d3.axisBottom(vis.xScale).tickFormat(d3.format("d"));
    vis.chart.append('g')
        .attr("transform",  `translate(0, ${vis.height})`)
        .attr("class", "myX")
        

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0])
        .nice(); //this just makes the y axes behave nicely by rounding up

    vis.yAxisG = d3.axisLeft(vis.yScale)
    vis.chart.append('g')
        .attr("class", "myY")

    vis.svg.append("text")
        .attr("x", vis.config.containerWidth/2-30)
        .attr("y", 15)
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("Days Without an AQI Meaasurement")


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
        .text("Days")

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

    vis.chart.selectAll('.line')
        .data([])
        .exit().remove();
    vis.chart.selectAll('.dot')
        .data([])
        .exit().remove();

    vis.xScale.domain(d3.extent(data, d => d.Year));
    vis.chart.selectAll(".myX").transition()
        .duration(1000)
        .call(vis.xAxisG);

    vis.yScale.domain([0, d3.max(data, d=>d.daysNoMeas)]);
    vis.chart.selectAll(".myY").transition()
        .duration(1000)
        .call(vis.yAxisG);

    vis.measLine = d3.line()
        .x(d => vis.xScale(d.Year))
        .y(d => vis.yScale(d.daysNoMeas))

    vis.chart.selectAll(".line")
        .data(data)
        .join("path")
            .attr("class","line")
            .transition()
            .duration(1000)
            .attr('stroke', function(d){ return vis.color(d[0])})
            .attr('fill', 'none')
            .attr('stroke-width', 2)
            .attr('d', vis.measLine(data))

    vis.circles = vis.chart.selectAll(".dot")   
        .data(vis.data)         
        .join("circle") 
            .attr("class", "dot")                           
            .attr("r", 7)
            .attr("fill", function(d){ return vis.color(d[0])}) 
            .style("opacity", 0)
            .attr("cx", function(d) { return vis.xScale(d.Year); })      
            .attr("cy", function(d) { return vis.yScale(d.daysNoMeas); })    

    vis.circles
          .on('mouseover', (event,d) => {

          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + 10) + 'px')   
            .style('top', (event.pageY + 10) + 'px')
            .html(`
              <div class="tooltip-title">${d.Year}</div>
              <ul>
                <li>Days w/o Meas: ${d.daysNoMeas}</li>
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