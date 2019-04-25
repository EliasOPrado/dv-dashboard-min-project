queue() //use the queue library to load data
    .defer(d3.csv, "data/Salaries.csv") // defer will take the format in which will be loaded the data (csv or json) as well as its path. two arguments 1st: the format and 2nd the path.
    .await(makeGraphs); // the await method takes the name of the function that we want to call when the data has been downloaded. 

function makeGraphs(error, salaryData) {//BOILER PLAITE
    var ndx = crossfilter(salaryData);// dont know where come from salaryData?? MAYBE CALLING THE SALARY FROM DATA?
    
    show_discipline_selector(ndx);
    show_gender_balance(ndx); // will be declared on the show_gender_balance function..
    show_average_salaries(ndx);

    dc.renderAll();
}

function show_discipline_selector(ndx) {// followed by the first div discipline-selector
    dim = ndx.dimension(dc.pluck('discipline'));
    group = dim.group()

    dc.selectMenu('#discipline-selector')//DC -- SELECT MENU TYPE <<
        .dimension(dim)
        .group(group);
}

function show_gender_balance(ndx) {//followed by the first div gender-balance.
    var dim = ndx.dimension(dc.pluck('sex'));
    var group = dim.group();

    dc.barChart("#gender-balance")// DC BAR CHART TYPE <<
        .width(400)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(dim) // var dim declared within this function
        .group(group) // var group declared within this function
        .transitionDuration(500) //tells how quicly the chart will be animated 
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel('Gender')
        .yAxis().ticks(20);
}

function show_average_salaries(ndx){
    var dim = ndx.dimension(dc.pluck('sex'));
    
    function add_item(p, v){// argumentos p and v: p is accumulate that keeps track of the total, v represents each element of the data.
        p.count++;
        p.total += v.salary;
        p.average = p.total/ p.count;
        return p;
    }
    
    function remove_item(p, v){
        p.count--;
        if(p.count == 0){
            p.total = 0;
            p.average = 0;
        }else{
            p.total -= v.salary
            p.average = p.total / p.discount;
        }
        return p;
    }
    
    function initialise (){
        return {count: 0, total: 0, average: 0};
    }
    
    var averageSalaryByGender = dim.group().reduce(add_item, remove_item, initialise);
    
}