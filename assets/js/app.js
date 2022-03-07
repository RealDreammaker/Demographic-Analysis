// create a responsive chart
function makeResponsive() {

    // **************** SETTING UP SVG AREA  ****************
    // ******************************************************
    // delare constants
    const marginForLabel = 80;
    const animateDudation = 1000;

    // clear existing svg area if there was one
    var svgArea = d3.select("svg");
    if (!svgArea.empty()){
        svgArea.remove()
    };

    // set up responsive chart size, width is set to ensure no overlapping datapoint
    var svgWidth = document.getElementById('scatter').offsetWidth
    var svgHeight = svgWidth * .7;

    // set margins for chart area
    var margin = {
        top: 5,
        bottom: 35 + marginForLabel,
        left: 35 + marginForLabel,
        right: 5
    };

    // configure chart size
    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgWidth - margin.left - margin.right;

    // append svg to page
    var svg = d3.select("#scatter")
                .append("svg")
                .attr("height", svgHeight)
                .attr("width", svgWidth);

    // append chartgroup to svg area
    var chartGroup = svg.append("g")
                        .attr("transform",`translate(${margin.left},${margin.top})`);

    // setup default labels
    var chosenXLabel =  "poverty"
    var chosenYLabel =  "healthcare"

    // ******************************************************
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
    function xAxisF(xAxisPassIn, newXAxisScale){
        var xAxis = d3.axisBottom(newXAxisScale)
            .tickSizeOuter(15)
            .tickSizeInner(6)
            .ticks(7);
        xAxisPassIn
            .attr("transform",`translate(0,${chartHeight})`)
            .transition()
            .duration(animateDudation)
            .call(xAxis);
    return xAxisPassIn;
    };
    
    function yAxisF(xAxisPassIn, newYAxisScale){
        var yAxis = d3.axisLeft(newYAxisScale)
            
        xAxisPassIn
            .transition()
            .duration(animateDudation)
            .call(yAxis)

    return xAxisPassIn;
    };
    function yGridF(gridPassIn, newYAxisScale){
        var grid = d3.axisLeft(newYAxisScale)
            .tickSize(chartWidth);
        
        gridPassIn
            .attr("stroke", "white")
            .attr("transform",`translate(${chartWidth},0)`)
            .style("opacity",0.2)
            .transition()
            .duration(animateDudation)
            .call(grid)

    return gridPassIn;
    };

    // functions for updating circles
    function circlesGroupF(circlesGroup,newXAxisScale, newYAxisScale, chosenXLabel,chosenYLabel){
            
        circlesGroup
            .transition()
            .duration(animateDudation)
            .attr("cx", d => newXAxisScale(d[chosenXLabel]))
            .attr("cy", d => newYAxisScale(d[chosenYLabel]))
        return circlesGroup;
    };

    // functions for updating annotations
    function annotateUpdate(textgroup,newXAxisScale, newYAxisScale, chosenXLabel,chosenYLabel){
            textgroup
                .transition()
                .duration(animateDudation)
                .attr("x", d => newXAxisScale(d[chosenXLabel]))
                .attr("y", d => newYAxisScale(d[chosenYLabel]))

    return textgroup;
    };

    // functions for creating AXIS LABELS
    function createLabel(lablegroup, id, labelText, indentLevel, statusClass, transform = "no"){
    if (transform != "no"){
        var labelItem = lablegroup
                .attr("class","label")
                .append("text")
                    .attr("class", statusClass + " aText")
                    .attr("id", id)
                    .attr("transform", "rotate(-90)")
                    .attr("x", -chartHeight/2)
                    .attr("y", -margin.left + (marginForLabel/3) * indentLevel )
                    .style("text-anchor","middle")
                    .text(labelText)
    }
    else {
        var labelItem = lablegroup
                .attr("class","label")
                .append("text")
                    .attr("class", statusClass + " aText")
                    .attr("id", id)
                    .attr("x", chartWidth/2 )
                    .attr("y", chartHeight + 15 + (marginForLabel/3) * indentLevel)
                    .style("text-anchor","middle")
                    .text(labelText)
    };
    return labelItem;
    };
    
    // functions for updating TOOLTIPS
    function updatingTooltips(circlesGroup, textGroup, chosenXLabel,chosenYLabel){

        // depending on type of data to show, there could be percentage sign to show
        var percentageLabels = ["poverty","healthcare","obesity","smokes"]
        
        var xAxisUnit = "";
        if (percentageLabels.includes(chosenXLabel)){
            xAxisUnit = "%";
            };

        var yAxisUnit = "";
        if (percentageLabels.includes(chosenYLabel)){
            yAxisUnit = "%";
            };

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([40, -60])
            .html(function(d) {return`<b>${d.state}</b><br>${chosenXLabel}: ${d[chosenXLabel]}${xAxisUnit} <br> ${chosenYLabel}: ${d[chosenYLabel]}${yAxisUnit}`}
            );
        
        chartGroup.call(toolTip);
        
        circlesGroup.on("mouseover", function(d) {
            toolTip.show(d, this);
        })
        circlesGroup.on("mouseout", function(d) {toolTip.hide(d);})

        textGroup.on("mouseover", function(d) {
            toolTip.show(d, this);
        })
        textGroup.on("mouseout", function(d) {toolTip.hide(d);})

    return circlesGroup, textGroup;
    };

    // ******************************************************
    // ******* DATA EXTRACTION and CHARTS SKETCHING *********
    // ******************************************************
    // 
    d3.csv("assets/data/data.csv").then(function(data){

        console.log(data)

        // parse data from string to integer
        data.forEach(function(d){
            d.healthcare = +d.healthcare;
            d.age = +d.age; 
            d.income = +d.income; 
            d.obesity = +d.obesity; 
            d.poverty = +d.poverty; 
            d.smokes = +d.smokes; 
        });

        var xScale = xScaleF(data,chosenXLabel)
        var yScale = yScaleF(data,chosenYLabel)


        // append axis to group elements
        var grid = chartGroup.append("g")
        var yAxis = chartGroup.append("g")
        var xAxis = chartGroup.append("g")


        // initialize axis
        xAxisF(xAxis, xScale);
        yAxisF(yAxis, yScale);
        yGridF(grid, yScale);
        

        // initialize circles as scatter point
        var circlesGroup = chartGroup.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
                .attr("r", 14)
                .attr("fill","#34568B")
                .attr("opacity", 0.9)

        // update circles 
        circlesGroup = circlesGroupF(circlesGroup,xScale,yScale,chosenXLabel,chosenYLabel);

        // initialize annotation of abreviated state name to each circle
        var textGroup = chartGroup.append("g")
            .selectAll("text")
            .data(data)
            .enter()
            .append("text")
                // .transition()
                // .duration(animateDudation)
                .attr("class","abbrState aText")
                //adjusted so text-anchor can move vertically
                .attr("dy","0.3em")
                .text(d => d.abbr.substring(0,2).toUpperCase())

        // update annotation of abreviated state name to each circle
        textGroup = annotateUpdate(textGroup,xScale, yScale, chosenXLabel,chosenYLabel);


        // intialize tooltips
        updatingTooltips(circlesGroup, textGroup, chosenXLabel,chosenYLabel)


        // add labels for all axis
        var labelGroup = chartGroup.append("g");

        var povertyLabel = createLabel(labelGroup, "poverty", "In Poverty (%)",1 , "active")
        var ageLabel = createLabel(labelGroup, "age", "Age (Median)",2 , "inactive")
        var incomeLabel = createLabel(labelGroup, "income", "Household Income (Median)",3 , "inactive")
        var obeseLabel = createLabel(labelGroup, "obesity", "Obese (%)",1 , "inactive", "transform")
        var smokeLabel = createLabel(labelGroup, "smokes", "Smoke (%)",2 , "inactive", "transform")
        var healthLabel = createLabel(labelGroup, "healthcare", "Lacks Healthcare (%)",3 , "active", "transform")


    // **************************************************************************
    // ********* HANDLING PROCEDURE WHEN A DIFFERENT LABEL WAS CHOSEN  **********
    // **************************************************************************
        labelGroup.selectAll("text").on("click", function(){

            var newChoosenLabel = d3.select(this).property("id");
            var xAxisLabels = ["poverty","age","income"]

            // only update if there was a different label selected
            if (![chosenXLabel,chosenYLabel].includes(newChoosenLabel)){
                
                // reset class for current labels to inactive
                d3.select("#" + chosenXLabel).attr("class", "inactive aText")
                d3.select("#" + chosenYLabel).attr("class", "inactive aText")
                

                // check which label was clicked and update the chosen one
                if (xAxisLabels.includes(newChoosenLabel)) {
                    chosenXLabel =  newChoosenLabel;
                }
                else {
                    chosenYLabel =  newChoosenLabel;
                };
                

                // update class for new labels chosen to active
                d3.select("#" + chosenXLabel).attr("class", "active aText")
                d3.select("#" + chosenYLabel).attr("class", "active aText")
                   

                // update scales
                xScale = xScaleF(data,chosenXLabel)
                yScale = yScaleF(data,chosenYLabel)


                // update axis
                xAxisF(xAxis, xScale);
                yAxisF(yAxis, yScale);
                yGridF(grid, yScale);


                // update circles 
                circlesGroup = circlesGroupF(circlesGroup,xScale,yScale,chosenXLabel,chosenYLabel);

                
                // update annotation of abreviated state name to each circle
                textGroup = annotateUpdate(textGroup,xScale, yScale, chosenXLabel,chosenYLabel);
                
                // update tooltips
                updatingTooltips(circlesGroup, textGroup, chosenXLabel,chosenYLabel)
            };
        });

    }).catch(function(error){
        return console.warn(error);
    });
};

makeResponsive();

d3.select(window).on("resize", makeResponsive)

