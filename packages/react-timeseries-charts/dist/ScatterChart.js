"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var _ = require("lodash");
var React = require("react");
var pondjs_1 = require("pondjs");
var EventMarker_1 = require("./EventMarker");
var util_1 = require("./util");
var styler_1 = require("./styler");
var style_1 = require("./style");
var ScatterChart = (function (_super) {
    tslib_1.__extends(ScatterChart, _super);
    function ScatterChart(props) {
        var _this = _super.call(this, props) || this;
        _this.handleHover = _this.handleHover.bind(_this);
        _this.handleHoverLeave = _this.handleHoverLeave.bind(_this);
        return _this;
    }
    ScatterChart.prototype.getOffsetMousePosition = function (e) {
        var offset = util_1.getElementOffset(this.eventrect);
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;
        return [Math.round(x), Math.round(y)];
    };
    ScatterChart.prototype.handleClick = function (e, event, column) {
        var point = { event: event, column: column };
        if (this.props.onSelectionChange) {
            this.props.onSelectionChange(point);
        }
    };
    ScatterChart.prototype.handleHover = function (e) {
        var _a = this.getOffsetMousePosition(e), x = _a[0], y = _a[1];
        var point;
        var minDistance = Infinity;
        for (var _i = 0, _b = this.props.columns; _i < _b.length; _i++) {
            var column = _b[_i];
            for (var _c = 0, _d = this.props.series.collection().eventList(); _c < _d.length; _c++) {
                var event_1 = _d[_c];
                var t = event_1.timestamp();
                var value = event_1.get(column);
                var px = this.props.timeScale(t);
                var py = this.props.yScale(value);
                var distance = Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));
                if (distance < minDistance) {
                    point = { event: event_1, column: column };
                    minDistance = distance;
                }
            }
        }
        if (this.props.onMouseNear) {
            this.props.onMouseNear(point);
        }
    };
    ScatterChart.prototype.handleHoverLeave = function () {
        if (this.props.onMouseNear) {
            this.props.onMouseNear(null);
        }
    };
    ScatterChart.prototype.providedStyleMap = function (column, event) {
        var style = {};
        if (this.props.style) {
            if (this.props.style instanceof styler_1.Styler) {
                return this.props.style.scatterChartStyle()[column];
            }
            else if (_.isFunction(this.props.style)) {
                return this.props.style(column, event);
            }
            else if (_.isObject(this.props.style)) {
                return this.props.style ? this.props.style[column] : style_1.defaultScatterChartChannelStyle;
            }
        }
    };
    ScatterChart.prototype.style = function (column, event) {
        var style;
        var styleMap = this.providedStyleMap(column, event);
        var s = styleMap.point;
        var d = style_1.defaultScatterChartChannelStyle.point;
        var isHighlighted = this.props.highlight &&
            column === this.props.highlight.column &&
            pondjs_1.Event.is(this.props.highlight.event, event);
        var isSelected = this.props.selected &&
            column === this.props.selected.column &&
            pondjs_1.Event.is(this.props.selected.event, event);
        if (this.props.selected) {
            if (isSelected) {
                style = _.merge(d.selected, s.selected ? s.selected : {});
            }
            else if (isHighlighted) {
                style = _.merge(d.highlighted, s.highlighted ? s.highlighted : {});
            }
            else {
                style = _.merge(d.muted, s.muted ? s.muted : {});
            }
        }
        else if (isHighlighted) {
            style = _.merge(d.highlighted, s.highlighted ? s.highlighted : {});
        }
        else {
            style = _.merge(d.normal, s.normal ? s.normal : {});
        }
        return style;
    };
    ScatterChart.prototype.renderScatter = function () {
        var _this = this;
        var _a = this.props, series = _a.series, timeScale = _a.timeScale, yScale = _a.yScale;
        var points = [];
        var eventMarker;
        var pointerEvents = this.props.onSelectionChange ? "auto" : "none";
        this.props.columns.forEach(function (column) {
            var key = 1;
            var _loop_1 = function (event_2) {
                var t = new Date(event_2.begin().getTime() + (event_2.end().getTime() - event_2.begin().getTime()) / 2);
                var value = event_2.get(column);
                var style = _this.style(column, event_2);
                var x = timeScale(t);
                var y = yScale(value);
                var radius = _.isFunction(_this.props.radius)
                    ? _this.props.radius(event_2, column)
                    : +_this.props.radius;
                var isHighlighted = _this.props.highlight &&
                    pondjs_1.Event.is(_this.props.highlight.event, event_2) &&
                    column === _this.props.highlight.column;
                if (isHighlighted && _this.props.info) {
                    var eventMarkerProps = {
                        key: "marker",
                        event: event_2,
                        column: column,
                        type: "point",
                        info: _this.props.info,
                        style: _this.props.infoStyle,
                        width: _this.props.width,
                        height: _this.props.height,
                        infoWidth: _this.props.infoWidth,
                        infoHeight: _this.props.infoWidth,
                        infoTimeFormat: _this.props.infoTimeFormat,
                        markerRadius: 0
                    };
                    eventMarker = React.createElement(EventMarker_1.EventMarker, tslib_1.__assign({}, eventMarkerProps));
                }
                var point = (React.createElement("circle", { key: column + "-" + key, cx: x, cy: y, r: radius, style: style, pointerEvents: pointerEvents, onMouseMove: function (e) { return _this.handleHover(e); }, onClick: function (e) { return _this.handleClick(e, event_2, column); } }));
                points.push(point);
                key += 1;
            };
            for (var _i = 0, _a = series.collection().eventList(); _i < _a.length; _i++) {
                var event_2 = _a[_i];
                _loop_1(event_2);
            }
        });
        return (React.createElement("g", null,
            points,
            eventMarker));
    };
    ScatterChart.prototype.render = function () {
        var _this = this;
        return (React.createElement("g", null,
            React.createElement("rect", { key: "scatter-hit-rect", ref: function (c) {
                    _this.eventrect = c;
                }, style: { opacity: 0.0 }, x: 0, y: 0, width: this.props.width, height: this.props.height, onMouseMove: function (e) { return _this.handleHover(e); }, onMouseLeave: function (e) { return _this.handleHoverLeave(); } }),
            this.renderScatter()));
    };
    ScatterChart.defaultProps = {
        columns: ["value"],
        radius: 2.0,
        infoStyle: style_1.defaultEventMarkerStyle,
        infoWidth: 90,
        infoHeight: 30
    };
    return ScatterChart;
}(React.Component));
exports.ScatterChart = ScatterChart;
//# sourceMappingURL=ScatterChart.js.map