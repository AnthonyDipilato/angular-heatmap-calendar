/*
*       Heatmap Calendar Directive        
*       Inspired by the Github contibutions calenders
*/

angular.module('heatmapCalendar', [])
    .constant('calendarConfig', {})
    .directive('heatmapCalendar', ['calendarConfig', function(calendarConfig) {
        return {
            restrict: 'EA',
            scope: {data:'=ngModel', options:'=options', callback:'&callback'},
            replace: true,
            template: '<div class="heatmap-calendar"></div>',
            link: function(scope, element, attrs, controller) {
                
                // setup callback if set
                var callback = (scope.callback) ? scope.callback : angular.noop;
                // check if units set
                var unit_names = (scope.options.units) ? scope.options.units : ['unit','units'];
                // check if verb is set
                var verb = (scope.options.verb) ? scope.options.verb : 'logged';
                
                // Format settings
                var width = 1024,
                    height = 125,
                    cellSize = 10;

                // Month Labels
                var month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                // Week Labels
                var day_labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                
                // Date formatting
                var day         = d3.timeFormat("%w"),
                    month       = d3.timeFormat("%m"),
                    percent     = d3.timeFormat(".1%"),
                    format      = d3.timeFormat("%Y%m%d"),
                    date_format = d3.timeFormat("%Y-%m-%d");
                    date_normal = d3.timeFormat("%m/%d/%Y");
            
                // Color range
                if(typeof scope.options.cellColor === 'undefined') scope.options.cellColor = '#000';
                var color = d3.scaleLinear().range(['white', scope.options.cellColor])
                        .domain([0, 1]);
                
                // Define the div for the tooltip
                var tooltip = d3.select(element[0]).append("div")	
                    .attr("class", "heatmap-tooltip")				
                    .style("opacity", 0);
                
                // Initialize chart
                var svg = d3.select(element[0]).selectAll("svg")
                    .data(d3.range(2018, 2019))
                    .enter().append("svg")
                    .attr("width", '100%')
                    .attr("viewBox",'0 0 ' + width + ' ' + height)
                    .attr('id', 'calendarContainer')
                    .append("g")
                    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + ((height - cellSize * 7 - 1) / 2) + ")");

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
                
                var rect = svg.selectAll(".day")
                        .data(d3.timeDays(moment().subtract(1,"years"), moment()))
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
                                .attr("data-title", "<b>No " + unit_names[1] + " " + verb + "</b><br> on " + date_normal(d))
                                .attr("data-toggle", "tooltip")
                                .attr("class", "heatmap-day")
                                .on("mouseover", function(d) {
                                    if(scope.options.tooltips){
                                        tooltip.transition()		
                                            .duration(200)		
                                            .style("opacity", .9);		
                                        tooltip.html(d3.select(this).attr("data-title"))	
                                            .style("left", (d3.event.pageX) + "px")		
                                            .style("top", (d3.event.pageY - 28) + "px");	
                                    }
                                })					
                                .on("mouseout", function(d) {
                                    if(scope.options.tooltips){
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
                var startMonth = parseInt(moment().format("MM"));
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
                var value_max = d3.max(scope.data, function(d) { return d.value; });
                
                // Roll up data
                var data = d3.nest()
                        .key(function(d) { return d.date; })
                        .rollup(function(d) { return   {
                            percent: Math.sqrt(d[0].value / value_max),
                            amount: d[0].value
                        };})
                        .map(scope.data);
                
                // Fill Colors and tool tips
                function fixDate(date){
                    return date.substr(4,2)+'/'+date.substr(6,2)+'/'+date.substr(0,4);
                }
                rect.filter(function(d) { return '$'+d in data; })
                    .attr("fill", function(d) {return color(data['$'+d]['percent']); })
                    .attr("data-title", function(d) {
                        var units = (data['$'+d]['amount'] === 1) ? unit_names[0] : unit_names[1];
                        var message = '<b>' + data['$'+d]['amount'] + ' ' + units + '</b> ' + verb + ' <br> on ' + fixDate(d);
                        return message;
                    })
                    .on("click", function(d){
                        callback({date: d});
                    });  
                    
                
                
            }

        };
    }]);

