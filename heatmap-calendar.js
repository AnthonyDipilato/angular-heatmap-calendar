/*
*       Heatmap Calendar Directive        
*       Inspired by the Github contibutions calenders
*/

angular.module('heatmapCalendar', [])
    .constant('calendarConfig', {})
    .directive('heatmapCalendar', ['calendarConfig', function(calendarConfig) {
        return {
            restrict: 'EA',
            scope: {data:'=ngModel', tooltips:'=tooltips', units:'=units', verb:'@verb', maxColor:'@maxColor', test:'=test', callback:'&callback'},
            replace: true,
            template: '<div class="heatmap-calendar"></div>',
            link: function(scope, element) {
                
                scope.$watch('data',function(){
                    render(scope.data);
                },true);
                
                // setup callback if set
                var callback = (scope.callback) ? scope.callback : angular.noop;
                // check if units set
                var unit_names = (scope.units) ? scope.units : ['unit','units','units'];
                if(typeof unit_names[2] === 'undefined') unit_names[2] = unit_names[1];
                // check if verb is set
                var verb = (scope.verb) ? scope.verb : 'logged';
                // Color range
                if(typeof scope.maxColor === 'undefined') scope.maxColor = '#000';
                
                // Format settings
                var width = 675,
                    height = 125,
                    cellSize = 10;

                // Month Labels
                var month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                // Week Labels
                var day_labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                
                // Date for now
                var now = new Date();
                
                // Date formatting
                var day         = d3.timeFormat("%w"),
                    month       = d3.timeFormat("%m"),
                    percent     = d3.timeFormat(".1%"),
                    format      = d3.timeFormat("%Y%m%d"),
                    date_format = d3.timeFormat("%Y-%m-%d");
                    date_normal = d3.timeFormat("%m/%d/%Y");
            
                var color = d3.scaleLinear().range(['white', scope.maxColor])
                        .domain([0, 1]);
                
                // Define the div for the tooltip
                var tooltip = d3.select(element[0]).append("div")	
                    .attr("class", "heatmap-tooltip")				
                    .style("opacity", 0);
                
                
                var render = function(calendar_data){
                    // make sure value is not null
                    if(calendar_data === null || typeof calendar_data === 'undefined') calendar_data = [];
                    // clear out existing svg for rerender
                    d3.select(element[0]).selectAll("svg").remove();
                    // Initialize chart
                    var svg = d3.select(element[0])
                        .append("svg")
                        .attr("width", '100%')
                        .attr("viewBox",'0 0 ' + width + ' ' + height)
                        .attr("id", "calendarContainer")
                        .append("g")
                        .attr("transform", "translate(25,25)");

                    // Day Labels
                    for (var i=0; i<7; i++){
                        var y = ((cellSize + 2) * i) + 8; // offset by height of font (8px)
                        svg.append("text")
                            .attr("transform", "translate( -5," + y + ")")
                            .style("text-anchor", "end")
                            .attr("class", "heatmap-day-label")
                            .text(function(d) { return day_labels[i]; }); 
                     }

                    // Draw Day Cells
                    var weekCount = 0;
                    function weekCheck(d){
                        if(parseInt(day(d)) === 6){weekCount++;}
                    }

                    var d = new Date();
                    var last_year = d.setMonth(d.getMonth() - 12);
                    
                    var rect = svg.selectAll(".day")
                            .data(d3.timeDays(last_year, now))
                            .enter()
                            .append("rect")
                            .attr("width", cellSize)
                            .attr("height", cellSize)
                            .each(function(d) {
                                d3.select(this)
                                    .attr("y", day(d) * (cellSize + 2))
                                    .attr("x", weekCount * (cellSize + 2))
                                    .attr("data-month", month(d))
                                    .attr("data-date", date_format(d))
                                    .attr("data-title", "<b>No " + unit_names[2] + " " + verb + "</b><br> on " + date_normal(d))
                                    .attr("class", "heatmap-day")
                                    .on("mouseover", function(d) {
                                        if(scope.tooltips){
                                            var mouse = d3.mouse(this);
                                            tooltip.transition()		
                                                .duration(200)		
                                                .style("opacity", .9);		
                                            tooltip.html(d3.select(this).attr("data-title"))	
                                                .style("left", (d3.event.layerX) + "px")		
                                                .style("top", (d3.event.layerY - 50) + "px");
                                        }
                                    })					
                                    .on("mouseout", function(d) {
                                        if(scope.tooltips){
                                        tooltip.transition()		
                                            .duration(500)		
                                            .style("opacity", 0);	
                                        }
                                    });
                                weekCheck(d);
                            })
                            .attr("fill",'#ebedf0')
                            .datum(format);

                    // Month Labels
                    d = new Date();
                    var startMonth = parseInt(d.getMonth());
                    var months_resorted = month_labels.slice(startMonth).concat(month_labels.slice(0,startMonth));
                    var legend = svg.selectAll(".legend")
                            .data(months_resorted)
                            .enter().append("text")
                            .attr("transform", function(d, i) { return "translate(" + (((i+1) * 50)+8) + ",0)"; })
                            .style("text-anchor", "end")
                            .attr("dy", "-.25em")
                            .attr("class", "heatmap-month-label")
                            .attr("data-month", function(d,i){ return month_labels.indexOf(months_resorted[i]) + 1; })
                            .text(function(d,i){ return months_resorted[i]; });

                    // Find max value
                    var value_max = d3.max(calendar_data, function(d) { return d.value; });

                    // Roll up data
                    var data = d3.nest()
                            .key(function(d) { return d.date; })
                            .rollup(function(d) { return   {
                                percent: Math.sqrt(d[0].value / value_max),
                                amount: d[0].value
                            };})
                            .map(calendar_data);


                    rect.filter(function(d) { return '$'+d in data; })
                        .attr("fill", function(d) {return color(data['$'+d]['percent']); })
                        .attr("class","heatmap-day heatmap-pointer")
                        .attr("data-title", function(d) {
                            var units = (data['$'+d]['amount'] === 1) ? unit_names[0] : unit_names[1];
                            var message = '<b>' + data['$'+d]['amount'] + ' ' + units + '</b> ' + verb + ' <br> on ' + fixDate(d);
                            return message;
                        })
                        .on("click", function(d){
                            callback({date: d});
                        });  

                };
                // Fill Colors and tool tips
                function fixDate(date){
                    return date.substr(4,2)+'/'+date.substr(6,2)+'/'+date.substr(0,4);
                }
            }

        };
    }]);

