var has = Object.prototype.hasOwnProperty,
    chart = {

        init: function(options) {
            for (var prop in options) {
                if (has.call(options, prop)) {
                    this[prop] = options[prop];
                }
            }
        },

        build: function(target) {
            var self = this,
                isSummary = has.call(self, "summaryCharts"),
                setupForm = target.find(".setup-form"),
                Xdata = setupForm.find("[name=Xdata]"),
                Ydata = setupForm.find("[name=Ydata]"),
                dataSource = self.dataSource || "data.json",
                chartBlock = target.find(".preview");

            self.container = target;
            self.chartBlock = chartBlock;
            self.setupForm = setupForm;
            self.isSummary = isSummary;
            self.getDataSet = function(setupForm) {
                var dataSet = {},
                    setupForm = $(setupForm),
                    inputs = setupForm.find("input"),
                    selects = setupForm.find("select"),
                    chartName = inputs.filter("[name=chartName]"),
                    chartType = selects.filter("[name=chartType]"),
                    Ydata = selects.filter("[name=Ydata]"),
                    chartColor = inputs.filter("[name=chartColor]"),
                    chartPoint = inputs.filter("[name=chartPoint]:checked"),
                    chartPointColor = inputs.filter("[name=chartPointColor]"),
                    Yname = inputs.filter("[name=Yname]"),
                    Xdata = selects.filter("[name=Xdata]"),
                    Ymin = inputs.filter("[name=Ymin]"),
                    Ymax = inputs.filter("[name=Ymax]"),
                    Xmin = inputs.filter("[name=Xmin]"),
                    Xmax = inputs.filter("[name=Xmax]");

                dataSet.chartName = chartName.val();
                dataSet.Xdata = Xdata.val();
                dataSet.chartType = chartType.val();
                dataSet.Ydata = Ydata.val();
                dataSet.chartColor = chartColor.val();
                dataSet.chartPoint = chartPoint.val();
                dataSet.chartPointColor = chartPointColor.val();
                dataSet.Yname = Yname.val();
                dataSet.Ymin = Ymin.val();
                dataSet.Ymax = Ymax.val();
                dataSet.Xmin = Xmin.val();
                dataSet.Xmax = Xmax.val();

                return self.dataPrepare(dataSet);
            };
            self.getSummaryDataSet = function(setupForm) {
                var dataSet = {},
                    setupForm = $(setupForm),
                    inputs = setupForm.find("input"),
                    selects = setupForm.find("select"),
                    chartName = inputs.filter("[name=chartName]"),
                    Yname = inputs.filter("[name=Yname]"),
                    Xdata = selects.filter("[name=Xdata]");

                dataSet.Yname = chartName.val();
                dataSet.chartName = Yname.val();
                dataSet.Xdata = Xdata.val();

                return self.summaryDataPrepare(dataSet);
            };
            self.dataPrepare = function(dataSet) {
                var self = this;

                if(!isFinite(parseInt(dataSet.Xdata, 10))
                    || !isFinite(parseInt(dataSet.Ydata, 10))
                    || dataSet.chartType === "none") {
                        return null;
                }
                dataSet.xAxis = self.data.map(function(el) { return el[self.fields[dataSet.Xdata].name]; });
                dataSet.yAxis = self.data.map(function(el) { return el[self.fields[dataSet.Ydata].name]; });
                dataSet.xType = self.fields[dataSet.Xdata].type;
                dataSet.yType = self.fields[dataSet.Ydata].type;
                dataSet.Xmin = parseInt(dataSet.Xmin, 10) || self.fields[dataSet.Xdata].min;
                dataSet.Xmax = parseInt(dataSet.Xmax, 10) || self.fields[dataSet.Xdata].max;
                dataSet.Ymin = parseInt(dataSet.Ymin, 10) || self.fields[dataSet.Ydata].min;
                dataSet.Ymax = parseInt(dataSet.Ymax, 10) || self.fields[dataSet.Ydata].max;
                if(dataSet.xType === "string") {
                    dataSet.data = [{
                        name: dataSet.Yname,
                        color: dataSet.chartColor,
                        data: dataSet.yAxis.map(function(el, indx) {
                                return {
                                    color: dataSet.chartPointColor,
                                    y: el
                                };
                            }),
                        marker: {
                            symbol: dataSet.chartPoint
                        }
                    }];
                    dataSet.categories = dataSet.xAxis;
                } else {
                    dataSet.data = [{
                        name: dataSet.Yname,
                        color: dataSet.chartColor,
                        data: dataSet.xAxis.map(function(el, indx) {
                                return {
                                    color: dataSet.chartPointColor,
                                    x: el,
                                    y: dataSet.yAxis[indx]
                                };
                            }),
                        marker: {
                            symbol: dataSet.chartPoint
                        }
                    }];
                }
                
                
                return dataSet;
            };
            self.summaryDataPrepare = function(dataSet) {
                var self = this;

                if(!isFinite(parseInt(dataSet.Xdata, 10))) {
                    return null;
                }
                dataSet.xAxis = self.data.map(function(el) { return el[self.fields[dataSet.Xdata].name]; });
                dataSet.xType = self.fields[dataSet.Xdata].type;
                dataSet.series = self.summaryCharts.map(function(indx, el) {
                    var setupForm = $(el).find(".setup-form"),
                        dataSet = self.getDataSet(setupForm);

                    if(!dataSet) return null;
                    dataSet.yType = self.fields[dataSet.Ydata].type;                
                    return dataSet;
                }).filter(function(indx, el) {
                    return el;
                });
                
                dataSet.data = dataSet.series.map(function(indx, el) {
                    return {
                        name: el.Yname,
                        data: el.yAxis.map(function(yAxisEl) {
                                return {
                                    color: el.chartPointColor,
                                    y: yAxisEl
                                };
                            }),
                        color: el.chartColor,
                        marker: {
                            symbol: el.chartPoint
                        }
                    }
                });
                dataSet.categories = dataSet.xAxis;                
                
                return dataSet;
            };

            return $.getJSON(dataSource)
                .done(function(json) {
                    var data = json.data,
                        fields = json.fields,
                        fieldNames = fields.map(function(el) { return el.name; });

                    fieldNames.forEach(function(el, indx, arr) {
                        var option = $("<option/>")
                                .attr("value", indx)
                                .html(el);

                        option.clone().appendTo(Xdata);
                        option.appendTo(Ydata);
                    });
                    self.data = data;
                    self.fields = fields;
                })
                .fail(function(request, type, error) {
                    console.log("error loading data: " + error);
                });  
        },

        setEventListeners: function() {
            var self = this,
                setupForm = self.setupForm,
                refreshBtn = self.container.find("button.chart-refresh"),
                refresh = function() {
                    var dataSet = (self.isSummary) ? self.getSummaryDataSet(setupForm) : self.getDataSet(setupForm);
                    if(dataSet) {
                        self.chartInit(dataSet);
                    } 
                };

            setupForm.on("change", refresh);
            refreshBtn.on("click", refresh);
        },

        chartInit: function(dataSet) {
            var self = this,
                target = self.chartBlock,
                options = {
                    chart: {
                        defaultSeriesType: dataSet.chartType || "line"
                    },
                    title: {
                        text: dataSet.chartName || "График",
                        x: -20
                    },
                    xAxis: {
                        min: dataSet.Xmin,
                        max: dataSet.Xmax
                    },
                    yAxis: {
                        title: {
                            text: dataSet.Yname
                        },
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: "#808080"
                        }],
                        min: dataSet.Ymin,
                        max: dataSet.Ymax
                    },
                    legend: {
                        enabled: self.isSummary
                    },
                    series: dataSet.data
                };

            if(has.call(dataSet, "categories") && dataSet.categories) {
                options.xAxis.categories = dataSet.categories;
            }

            target.highcharts(options);

        }
        
    },
    _getCurrentTabIndex = function() {
        var reg = new RegExp(/^#tab\d/),
            hash = (reg.test(window.location.hash)) ? window.location.hash.match(reg).shift() : null;

        return (hash) ? hash.replace("#tab", "") : 1;
    },
    _setTab = function(index) {
        var nav = $(".nav"),
            tabs = nav.nextAll(".tab"),
            targetTab = $("#tab" + index);

        if(index && isFinite(index)) {
            nav.find(".active").removeClass("active");
            nav.children().eq(index - 1).addClass("active");
            tabs.hide(0);
            targetTab.show(0);
        }
    },
    _tabNavigate = function() {
        var index = _getCurrentTabIndex();
        _setTab(index);
    };

jQuery.fn.chart = function(options) {
    var options = options || {},
        chartObj = inherit(chart);

    if(this.hasClass("chart")) return false;

    chartObj.init(options);
    chartObj.build(this)
        .then(function() {
            chartObj.setEventListeners();
        });

    function inherit(proto) {
        function F() {}
        F.prototype = proto;
        return new F();
    }
};

$(window).on("hashchange", _tabNavigate);

$(document).ready(function() {
    _tabNavigate();
    $('.colorpicker-component').colorpicker();
    $(".chart-this").each(function(indx, target) {
        $(target).chart();
    });
    $(".chart-this-summary").chart({summaryCharts: $(".chart-this")});
});