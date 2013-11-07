function BarGraph(el, max) {
    this.el = el;
    this.max = max;
    this.chart = d3.select(el).append("svg")
        .attr("class","chart")
        .attr("width", "100%")
        .attr("height", "100%");
    this.maxHeight = parseFloat(this.chart.style("height")) / 2;
    this.maxWidth = parseFloat(this.chart.style("width"));
    this.y = d3.scale.linear()
        .domain([-this.max, this.max])
        .range([0,this.maxHeight]);
}

BarGraph.prototype.update = function(data) { 
    var that = this;
    var w = this.maxWidth / data.length;

    var bars = this.chart.selectAll("rect").data(data);

    bars.enter().append("rect");

    bars.attr("x", function(d,i) { return w * i })
        .attr("width", w)
        .attr("y", function(d) { return that.maxHeight - that.y(Math.max(0,d)); })
        .attr("height", function(d) { return Math.abs(that.y(d) - that.y(0)); });

    bars.exit().remove();
}
