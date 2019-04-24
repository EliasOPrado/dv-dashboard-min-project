queue()//use the queue library to load data
.defer(d3.csv, "data/Salaries.csv")// defer will take the format in which will be loaded the data (csv or json) as well as its path. two arguments 1st: the format and 2nd the path.
.await(makeGraphs);// the await method takes the name of the function that we want to call when the data has been downloaded. 

function makeGraphs(error, salaryData){
    var ndx = crossfilter(salaryData);
    
    show_gender_balance(ndx);// will be declared on the show_gender_balance function..
    
    dc.renderAll();
}

function show_gender_balance(ndx){
    var dim = ndx.dimension(dc.pluck('sex'));
    var group = dim.group();
    
    dc.barChart("#gender-balance")
    .width(400)
    .height(300)
    .margins({top:10, right:50, bottom:30, left:50})
    .dimension(dim)// var dim declared within this function
    .group(group)// var group declared within this function
    .transitionDuration(500)//tells how quicly the chart will be animated 
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .elasticY(true)
    .xAxisLabel('Gender')
    .yAxis().ticks(20);
}