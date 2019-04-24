queue()//use the queue library to load data
.defer(d3.csv, "data/Salaries.csv")// defer will take the format in which will be loaded the data as well as its path. two arguments 1st: the format and 2nd the path It could be a d3.json!
.await(makeGraphs);// the await method takes the name of the function that we want to call when the data has been downloaded. 

function makeGraphs(error, salaryData){
    var ndx = crossfilter(salaryData);
    
    show_gender_balance(ndx);// will be created on next line..
}

function show_gender_balance(ndx){
    var dim = ndx.dimension(dc.pluck('sex'));
    var group = dim.group();
}