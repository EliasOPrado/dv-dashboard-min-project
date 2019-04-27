queue() //use the queue library to load data
    .defer(d3.csv, "data/Salaries.csv") // defer will take the format in which will be loaded the data (csv or json) as well as its path. two arguments 1st: the format and 2nd the path.
    .await(makeGraphs); // <<<< the await method takes the name of the function that we want to call when the data has been downloaded. 

function makeGraphs(error, salaryData) { //BOILER PLAITE
    var ndx = crossfilter(salaryData); // dont know where come from salaryData?? MAYBE CALLING THE SALARY FROM DATA?

    salaryData.forEach(function(d) {
        d.salary = parseInt(d.salary);
        d.yrs_service = parseInt(d["yrs.service"]);
    })

    show_discipline_selector(ndx);

    show_percentage_that_are_professors(ndx, "Female", "#percentage-of-women-professor");
    show_percentage_that_are_professors(ndx, "Male", "#percentage-of-men-professor");

    show_gender_balance(ndx); // will be declared on the show_gender_balance function..
    show_average_salaries(ndx);
    show_rank_distribution(ndx);
    
    show_service_to_salary_correlation(ndx);

    dc.renderAll();
}

function show_discipline_selector(ndx) { // followed by the first div discipline-selector
    dim = ndx.dimension(dc.pluck('discipline'));
    group = dim.group()

    dc.selectMenu('#discipline-selector') //DC -- SELECT MENU TYPE <<
        .dimension(dim)
        .group(group);
}


function show_percentage_that_are_professors(ndx, gender, element) {

    var percentageThatAreProf = ndx.groupAll().reduce(
        function(p, v) {
            if (v.sex === gender) {
                p.count++;
                if (v.rank === "Prof") {
                    p.are_prof++;
                }
            }
            return p;
        },
        function(p, v) {
            if (v.sex === gender) {
                p.count--;
                if (v.rank === "Prof") {
                    p.are_prof++;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_prof: 0 };
        }
    );

    dc.numberDisplay(element)//element displays the id path such as #percentage-of-men-professor
        .formatNumber(d3.format(".2%"))
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_prof / d.count);
            }
        })
        .group(percentageThatAreProf);
}

function show_gender_balance(ndx) { //followed by the first div gender-balance.
    var dim = ndx.dimension(dc.pluck('sex'));
    var group = dim.group();

    dc.barChart("#gender-balance") // DC BAR CHART TYPE <<
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

function show_average_salaries(ndx) {
    var dim = ndx.dimension(dc.pluck('sex'));


    function add_item(p, v) { // argumentos p and v: p is accumulate that keeps track of the total, v represents each element of the data.
        p.count++;
        p.total += v.salary;
        p.average = p.total / p.count;
        return p;
    }

    function remove_item(p, v) {
        p.count--;
        if (p.count == 0) {
            p.total = 0;
            p.average = 0;
        }
        else {
            p.total -= v.salary
            p.average = p.total / p.discount;
        }
        return p;
    }

    function initialise() {
        return { count: 0, total: 0, average: 0 };
    }

    var averageSalaryByGender = dim.group().reduce(add_item, remove_item, initialise);

    dc.barChart("#average-salary")
        .width(400)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(dim)
        .group(averageSalaryByGender)
        .valueAccessor(function(d) {
            return d.value.average.toFixed(2);
        })
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel('Gender')
        .yAxis().ticks(4);
}

function show_rank_distribution(ndx) {


    function rankByGender(dimension, rank) {

        return dimension.group().reduce(

            function(p, v) {
                p.total++;
                if (v.rank == rank) {
                    p.match++;
                }
                return p;
            },
            function(p, v) {
                p.total--;
                if (v.rank == rank) {
                    p.match--;
                }
                return p;
            },
            function() {
                return { total: 0, match: 0 };
            }
        );
    }

    var dim = ndx.dimension(dc.pluck("sex"));
    var ProfByGender = rankByGender(dim, "Prof");
    var asstProfByGender = rankByGender(dim, "AsstProf");
    var assocProfByGender = rankByGender(dim, "AssocProf");

    dc.barChart('#rank-distribution')
        .width(400)
        .height(300)
        .dimension(dim)
        .group(ProfByGender, "Prof")
        .stack(asstProfByGender, "Asst Prof")
        .stack(assocProfByGender, "Assoc Prof")
        .valueAccessor(function(d) {
            if (d.value.total > 0) {
                return (d.value.match / d.value.total) * 100;
            }
            else {
                return 0;
            }
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .legend(dc.legend().x(320).y(20).itemHeight(15).gap(5))
        .margins({ top: 10, right: 100, bottom: 30, left: 30 });
}

function show_service_to_salary_correlation(ndx){
    var eDim = ndx.dimension(dc.pluck("yrs_service"));
    var experienceDim = ndx.dimension(function (d){
        return [d.yrs_service, d.salary];
    });
    var experienceSalaryGroup = experienceDim.group();
    
    var minExperience = eDim.bottom(1)[0].yrs_service;
    var maxExperience = eDim.top(1)[0].yrs_service;
    
    dc.scatterPlot("#service-salary")
        .width(800)
        .height(400)
        .x(d3.scale.linear().domain([minExperience, maxExperience]))
        .brushOn(true)
        .symbolSize(8)
        .clipPadding(10)
        .yAxisLabel("Years of Service")
        .title(function (d){
            return "Earned " + d.key[1];
        })
        .dimension(experienceDim)
        .group(experienceSalaryGroup)
        .margins({top: 10, right: 50, bottom: 75, left: 75});
}