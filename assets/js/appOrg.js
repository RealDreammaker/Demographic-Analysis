function makeResponsive() {

    var svgArea = d3.select("svg");
    if (!svgArea.empty()){
        svgArea.remove()
    };
    // set up responsive chart size, width is set to ensure no overlapping datapoint
    var svgWidth = document.getElementById('scatter').offsetWidth
    var svgHeight = svgWidth*.7;

    var margin = {
        top:60,
        bottom:60,
        left:60,
        right:60
    };

    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgWidth - margin.left - margin.right;

    // append svg to page
    var svg = d3.select("#scatter")
                .append("svg")
                .attr("height", svgHeight)
                .attr("width", svgWidth);

    var chartGroup = svg.append("g")
                        .attr("transform",`translate(${margin.left},${margin.top})`);

    // extract data
    d3.csv("assets/data/data.csv").then(function(data){
        console.log(data);
        
        // parse data
        data.forEach(function(d){
            d.healthcare = +d.healthcare;
            d.poverty = +d.poverty; 
        });

        // set up scales
        var xScale = d3.scaleLinear()
                .domain([d3.min(data, d => d.poverty) * 0.95,
                        d3.max(data, d => d.poverty) * 1.05 ])
                .range([0,chartWidth]);

        var yScale = d3.scaleLinear()
                .domain([d3.min(data, d => d.healthcare) * 0.85,
                        d3.max(data, d => d.healthcare) *1.03])
                .range([chartHeight,0]);

        // function for axis
        var xAxis = d3.axisBottom(xScale)
            .tickSizeOuter(15)
            .tickSizeInner(6)
            .ticks(7);
        
        var yAxis = d3.axisLeft(yScale)
        
        var grid = d3.axisLeft(yScale)
            .tickSize(chartWidth);
        

        // create axis and append to a group element
        chartGroup.append("g")
            .attr("stroke", "white")
            .attr("transform",`translate(${chartWidth},0)`)
            .style("opacity",0.2)
            .call(grid)

        chartGroup.append("g")
            .call(yAxis)
        
        chartGroup.append("g")
            .attr("transform",`translate(0,${chartHeight})`)
            .call(xAxis)
        
        // create circles as scatter point
        var circleGroup = chartGroup.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
                .attr("cx", d => xScale(d.poverty))
                .attr("cy", d => yScale(d.healthcare))
                .attr("r", 12)
                .attr("fill","#34568B")

        // annotate abreviated state name to each circle
        var textGroup = chartGroup.append("g")
            .selectAll("text")
            .data(data)
            .enter()
            .append("text")
                .attr("class","abbrState")
                .attr("x", d => xScale(d.poverty))
                .attr("y", d => yScale(d.healthcare))
                 //adjusted so text-anchor can move vertically
                .attr("dy","0.3em")
                .text(d => d.abbr.substring(0,2).toUpperCase())
        
        // add labels for axis
        var labelGroup = chartGroup.append("g")
        var xAxisLable = labelGroup
                .attr("class","label")
                .append("text")
                    .attr("x",chartWidth/2 )
                    .attr("y", chartHeight + 40)
                    .text("In Poverty (%)")
        
        var yAxisLable = labelGroup
                .attr("class","label")
                .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", - margin.left/1.2 )
                    .attr("x", -chartHeight/1.6)
                    .attr("dy", "1em")
                    .text("Lacks Healthcare (%)")

    }).catch(function(error){
        return console.warn(error);
    });
};

makeResponsive();

d3.select(window).on("resize", makeResponsive)

