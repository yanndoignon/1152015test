'use strict'

var React = require('react')
var d3 = require('d3')
var numeral = require('numeral')
var MapUtils = require('../utils/MapUtils')
var _ = require('lodash')

var Store = require('../stores/Store')

var Scatterplot = React.createClass({
  getDefaultProps: function() {
    return {
      width: 450,
      height: 80,
      labelHeight: 20,
      data: [15, 12, 25, 8, 20]
    }
  },

  componentDidMount: function() {
    this.renderGraph()
  },

  componentDidUpdate: function() {
    this.renderGraph()
  },

  render: function() {
    return React.createElement('div', null)
  },

  renderGraph: function() {
    var el = this.getDOMNode()
    while (el.firstChild) {
      el.removeChild(el.firstChild)
    }

    var width = this.props.width
    var height = this.props.height
    var labelHeight = this.props.labelHeight
    var data = this.props.data.slice()
    var selectedIndex = this.props.selectedIndex
    var onCircleClick = this.props.onCircleClick || (function() {})

    var xScale = d3.scale.linear()
      .domain([0, data.length])
      .range([height/2, width - height/2])

    var rScale = d3.scale.linear()
      .domain([d3.min(data), d3.max(data)])
      .range([5, height/2 - 5])

    var svg = d3.select(this.getDOMNode())
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')

    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', function(d, i) {
        return xScale(i) + height/2
      })
      .attr('cy', height/2)
      .attr('r', function(d) {
        return rScale(d)
      })
      .attr('fill', function(d, i) {
        var data = Store.getAll()
        var selected_indicator = Store.getSelectedIndicator()
        if (_.isEmpty(data) || _.isEmpty(selected_indicator)) return

        var configs = data.configs
        var meta = data.global.meta

        return MapUtils.getNumberColor(d, configs, meta, selected_indicator)
      })
      .style('cursor', 'pointer')
      .style('opacity', function(d, i) {
        if (selectedIndex === i) {
          return .9
        } else {
          return .6
        }
      })
      .on('mouseover', function(d) {
        d3.select(this)
          .attr('r', function(d) {
            return rScale(d) + 2
          })
      })
      .on('mouseout', function(d) {
        d3.select(this)
          .transition()
          .delay(250)
          .attr('r', function(d) {
            return rScale(d)
          })
      })
      .on('click', function(d, i) {
        d3.select(this).style('opacity', .8)
        onCircleClick(d, i)
      })

    var yearLabel = d3.select(this.getDOMNode())
      .append('svg')
      .attr('width', width)
      .attr('height', labelHeight)
      .append('g')

    yearLabel.selectAll('year-label')
      .data(data)
      .enter()
      .append('text')
      .text(function(d, i) {
        try {
          var _data = Store.getAll()
          var selected_indicator = Store.getSelectedIndicator()
          var meta = _data.global.meta.indicators
          var indicatorData = meta[selected_indicator]
        } catch (e) {
          console.error('get year from meta error', e)
        }
        return indicatorData.years[i]
      })
      .style('pointer-events', 'none')
      .attr('font-size', 12)
      .attr('fill', function(d, i) {
        if (selectedIndex === i) return '#68db75'
        return '#5262BC'
      })
      .attr('x', function(d, i) {
        return xScale(i) + height/2
      })
      .attr('y', labelHeight)
      .attr('text-anchor', 'middle')

    var valueLabel = d3.select(this.getDOMNode())
      .append('svg')
      .attr('width', width)
      .attr('height', labelHeight)
      .append('g')
      
    valueLabel.selectAll('values')
      .data(data)
      .enter()
      .append('text')
      .text(function(d, i) {
        return numeral(d).format('0.00')
      })
      .style('pointer-events', 'none')
      .attr('font-size', 12)
      .attr('fill', function(d, i) {
        if (selectedIndex === i) return '#68db75'
        return '#212121'
      })
      .attr('x', function(d, i) {
        return xScale(i) + height/2
      })
      .attr('y', labelHeight)
      .attr('text-anchor', 'middle')
  }
})

module.exports = Scatterplot