function makeResponsive() {

    // clear existing svg area if there was one
    var svgArea = d3.select("svg");
    if (!svgArea.empty()){
        svgArea.remove()
    };

    // set up responsive chart size, width is set to ensure no overlapping datapoint
    var svgWidth = document.getElementById('scatter').offsetWidth
    var svgHeight = svgWidth*.7;

    const marginForLabel = 90;
    var margin = {
        top:5,
        bottom:5 + marginForLabel,
        left:5 + marginForLabel,
        right:5
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

    // setup default label
    var defaultXlabel =  "poverty"
    var defaultYlabel =  "healthcare"

    // *************** SETTING UP FUNCTIONS *****************
    // ******************************************************
    // function for setting up scales
    function xScaleF(data, chosenXAxis){
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.95,
    d3.max(data, d => d[chosenXAxis]) * 1.05 ])
    .range([0,chartWidth]);
    return xLinearScale;
    };
    
    function yScaleF(data, chosenYAxis){
        var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.85,
        d3.max(data, d => d[chosenYAxis]) *1.03])
        .range([chartHeight,0]);
        return yLinearScale;
    };  
    
    // functions for creating axis
    function xAxisF(chartgroup, newXAxisScale){
        var xAxis = d3.axisBottom(newXAxisScale)
            .tickSizeOuter(15)
            .tickSizeInner(6)
            .ticks(7);
        chartgroup.append("g")
            .attr("transform",`translate(0,${chartHeight})`)
            .call(xAxis);
    return chartgroup;
    };
    
    function yAxisGridF(chartgroup, newYAxisScale){
        var yAxis = d3.axisLeft(newYAxisScale)
            
        var grid = d3.axisLeft(newYAxisScale)
            .tickSize(chartWidth);
        
        chartgroup.append("g")
            .attr("stroke", "white")
            .attr("transform",`translate(${chartWidth},0)`)
            .style("opacity",0.2)
            .call(grid)

        chartgroup.append("g")
            .call(yAxis)

    return chartgroup;
    };

    // extract data
    d3.csv("assets/data/data.csv").then(function(data){
        console.log(data);
        
        // parse data from string to integer
        data.forEach(function(d){
            d.healthcare = +d.healthcare;
            d.age = +d.age; 
            d.income = +d.income; 
            d.obesity = +d.obesity; 
            d.poverty = +d.poverty; 
            d.smokes = +d.smokes; 
        });

        var xScale = xScaleF(data,defaultXlabel)
        var yScale = yScaleF(data,defaultYlabel)

        // create axis and append to a group element
        xAxisF(chartGroup, xScale)
        yAxisGridF(chartGroup, yScale)
    
        
        // create circles as scatter point
        var circleGroup = chartGroup.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
                .attr("cx", d => xScale(d[defaultXlabel]))
                .attr("cy", d => yScale(d[defaultYlabel]))
                .attr("r", 12)
                .attr("fill","#34568B")

        // annotate abreviated state name to each circle
        var textGroup = chartGroup.append("g")
            .selectAll("text")
            .data(data)
            .enter()
            .append("text")
                .attr("class","abbrState")
                .attr("x", d => xScale(d[defaultXlabel]))
                .attr("y", d => yScale(d[defaultYlabel]))
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

