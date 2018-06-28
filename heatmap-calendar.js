/*
*       Heatmap Calendar Directive        
*       Inspired by the Github contibutions calenders
*/

angular.module('heatmapCalendar', [])
    .constant('calendarConfig', {})
    .directive('heatmapCalendar', ['calendarConfig', function(calendarConfig) {
        return {
            restrict: 'EA',
            scope: {data:'=data', options:'=options'},
            replace: true,
            template: '<div class="heatmap-calendar"></div>',
            link: function(scope, element) {
                
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
            
                // Color range
                var color = d3.scaleLinear().range(['white', '#144592'])
                        .domain([0, 1]);
                
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
                        .attr("class", "dayLabel")
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
                                .attr("date-month", month(d))
                                .attr("data-date", date_format(d))
                                .attr("class", "day");
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
                        .attr("class", function(d,i){ return "monthLabel "+months_resorted[i]; })
                        .text(function(d,i){ return months_resorted[i] });
                
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
                        var units = (data['$'+d]['amount'] === 1) ? 'mile' : 'miles';
                        var message = '<b>' + data['$'+d]['amount'] + ' ' + units + '</b> logged on ' + fixDate(d);
                        return message;
                    });  
                $("rect").tooltip({container: 'body', html: true, placement:'top'}); 
                
            }

        };
    }]);

