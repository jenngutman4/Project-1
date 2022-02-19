class ChoroplethMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || {top: 10, right: 10, bottom: 10, left: 10},
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12, 
      legendRectWidth: 100
    }
    this.data = _data;
    // this.config = _config;

    this.us = _data;

    this.active = d3.select(null);

    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('class', 'center-container')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.svg.append('rect')
            .attr('class', 'background center-container')
            .attr('height', vis.config.containerWidth ) //height + margin.top + margin.bottom)
            .attr('width', vis.config.containerHeight) //width + margin.left + margin.right)
            .on('click', vis.clicked);

  
    vis.projection = d3.geoAlbersUsa()
            .translate([vis.width /2 , vis.height / 2])
            .scale(vis.width);

    vis.colorScale = d3.scaleLinear()
      //.domain(d3.extent(vis.data.objects.counties.geometries, d => d.properties.maxVal))
        .range(['#cfe2f2', '#0d306b'])
        .interpolate(d3.interpolateHcl);

    vis.path = d3.geoPath()
            .projection(vis.projection);

    vis.g = vis.svg.append("g")
            .attr('class', 'center-container center-items us-state')
            .attr('transform', 'translate('+vis.config.margin.left+','+vis.config.margin.top+')')
            .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
            .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)
    
    // Initialize gradient that we will later use for the legend
    vis.linearGradient = vis.svg.append('defs').append('linearGradient')
        .attr("id", "legend-gradient");

    // Append legend
    vis.legend = vis.g.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${vis.config.legendLeft},${vis.height - vis.config.legendBottom - 80})`);
    
    vis.legendRect = vis.legend.append('rect')
        .attr('width', vis.config.legendRectWidth)
        .attr('height', vis.config.legendRectHeight);

    vis.legendTitle = vis.legend.append('text')
        .attr('class', 'legend-title')
        .attr('dy', '.35em')
        .attr('y', -10)
        .text('AQI value')

    vis.updateVis(vis.data, 'maxVal');
  }
  updateVis(data, stat){
    let vis = this;
    vis.data = data;
    let extentAQI;

    if (stat == "medVal") {

      extentAQI = d3.extent(vis.data.objects.counties.geometries, d => d.properties.medVal);

      vis.colorScale.domain(extentAQI);
      vis.counties = vis.g.append("g")
                  .attr("id", "counties")
                  .selectAll("path")
                  .data(topojson.feature(vis.us, vis.us.objects.counties).features)
                  .enter().append("path")
                  .attr("d", vis.path)
                  // .attr("class", "county-boundary")
                  .attr('fill', d => {
                        if (d.properties.medVal) {
                          return vis.colorScale(d.properties.medVal);
                        } else {
                          return 'url(#lightstripe)';
                        }
                      });

        vis.counties
                  .on('mousemove', (event, d) => {
                    console.log(d);
                    console.log(event);
                      const medAQI = d.properties.medVal ? `Median AQI: <strong>${d.properties.medVal}</strong>` : 'No data available'; 
                      d3.select('#tooltip')
                        .style('display', 'block')
                        .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                        .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                        .html(`
                          <div class="tooltip-title">${d.properties.name}</div>
                          <div>${medAQI}</div>
                        `);
                    })
                    .on('mouseleave', () => {
                      d3.select('#tooltip').style('display', 'none');
                    });
    }
    else if (stat == "nineVal") {

      extentAQI = d3.extent(vis.data.objects.counties.geometries, d => d.properties.nineVal);

      vis.colorScale.domain(extentAQI);
      vis.counties = vis.g.append("g")
                  .attr("id", "counties")
                  .selectAll("path")
                  .data(topojson.feature(vis.us, vis.us.objects.counties).features)
                  .enter().append("path")
                  .attr("d", vis.path)
                  // .attr("class", "county-boundary")
                  .attr('fill', d => {
                        if (d.properties.nineVal) {
                          return vis.colorScale(d.properties.nineVal);
                        } else {
                          return 'url(#lightstripe)';
                        }
                      });

        vis.counties
                  .on('mousemove', (event, d) => {
                    console.log(d);
                    console.log(event);
                      const nineAQI = d.properties.nineVal ? `90th Perc: AQI: <strong>${d.properties.nineVal}</strong>` : 'No data available'; 
                      d3.select('#tooltip')
                        .style('display', 'block')
                        .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                        .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                        .html(`
                          <div class="tooltip-title">${d.properties.name}</div>
                          <div>${nineAQI}</div>
                        `);
                    })
                    .on('mouseleave', () => {
                      d3.select('#tooltip').style('display', 'none');
                    });
    }
    else {
      extentAQI = d3.extent(vis.data.objects.counties.geometries, d => d.properties.maxVal);

      vis.colorScale.domain(extentAQI);
      vis.counties = vis.g.append("g")
                  .attr("id", "counties")
                  .selectAll("path")
                  .data(topojson.feature(vis.us, vis.us.objects.counties).features)
                  .enter().append("path")
                  .attr("d", vis.path)
                  // .attr("class", "county-boundary")
                  .attr('fill', d => {
                        if (d.properties.maxVal) {
                          return vis.colorScale(d.properties.maxVal);
                        } else {
                          return 'url(#lightstripe)';
                        }
                      });

        vis.counties
                  .on('mousemove', (event, d) => {
                    console.log(d);
                    console.log(event);
                      const maxAQI = d.properties.maxVal ? `Max AQI: <strong>${d.properties.maxVal}</strong>` : 'No data available'; 
                      d3.select('#tooltip')
                        .style('display', 'block')
                        .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                        .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                        .html(`
                          <div class="tooltip-title">${d.properties.name}</div>
                          <div>${maxAQI}</div>
                        `);
                    })
                    .on('mouseleave', () => {
                      d3.select('#tooltip').style('display', 'none');
                    });
    }

    vis.legendStops = [
      { color: '#cfe2f2', value: extentAQI[0], offset: 0},
      { color: '#0d306b', value: extentAQI[1], offset: 100},
    ];

    // Add legend labels
    vis.legend.selectAll('.legend-label')
        .data(vis.legendStops)
      .join('text')
        .attr('class', 'legend-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('y', 20)
        .attr('x', (d,index) => {
          return index == 0 ? 0 : vis.config.legendRectWidth;
        })
        .text(d => Math.round(d.value * 10 ) / 10);

    // Update gradient for legend
    vis.linearGradient.selectAll('stop')
        .data(vis.legendStops)
      .join('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);

    vis.legendRect.attr('fill', 'url(#legend-gradient)');



    vis.g.append("path")
                .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
                .attr("id", "state-borders")
                .attr("d", vis.path);

  }

  
}