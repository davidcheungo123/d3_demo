import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import * as geo from 'd3-geo'

import "./App.css"

function App() {

  const world_map = useRef()

  const [countries, setCountries] = useState(null)
  const [data, setData] = useState(null)
  const [selectedOption, setSelectedOption] = useState('population')
  const [data_gross, setData_gross] = useState(null)

  const dimensions = {
    marginTop: 30, marginBottom: 30, marginLeft: 30, marginRight: 30,
    width: 500, height: 500, mapWidth: 600, mapHeight: 600
  }

  dimensions.ctrWidth = dimensions.width - dimensions.marginLeft - dimensions.marginRight
  dimensions.ctrHeight = dimensions.height - dimensions.marginTop - dimensions.marginBottom


  const BOXSIZE = 30

  const svg = d3.select("#svg1")
    .attr("height", dimensions.height)
    .attr("width", 800)
    .attr('transform', `translate(${dimensions.marginLeft},${dimensions.marginTop})`)


  const tooltip = d3.select('#tooltip');



  const genBarChart = (specificData) => {
    svg.selectAll('*').remove();
    let copiedData = { ...specificData }

    delete copiedData["% Women"]
    delete copiedData["Delegation"]
    delete copiedData["Men"]
    delete copiedData["Women"]
    delete copiedData["Total"]
    delete copiedData["lat"]
    delete copiedData["lng"]

    const yData = Object.values(copiedData)
    console.log(yData)

    const xScale = d3.scaleBand().domain(["2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020"]).range([0, dimensions.ctrWidth])
    const xScaleIndex = d3.scaleBand().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).range([0, dimensions.ctrWidth])
    const yScale = d3.scaleLinear().domain([0, d3.max(yData)]).range([dimensions.ctrHeight, 0])
    const invertyScale = d3.scaleLinear().domain([0, d3.max(yData)]).range([0, dimensions.ctrHeight])


    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)
    const xAxisGroup = svg.append("g").call(xAxis).style("transform", `translate(${110}px,${dimensions.ctrHeight}px)`)
    const yAxisGroup = svg.append("g").call(yAxis).style("transform", `translate(${110}px, ${0}px)`)

    xAxisGroup.append("text").attr("x", dimensions.ctrWidth / 2).attr("y", dimensions.marginBottom)
      .attr("fill", 'black')
      .text("Years").style("font-weight", "bold")
    yAxisGroup.append("text").attr("x", -40).attr("y", dimensions.ctrHeight / 2).attr("fill", "black")
      .text("Pop.(10k)").style("font-weight", "bold")

    svg.append("g").style("transform", `translate(${110}px,${0}px)`).selectAll("rect").data(yData).join(
      (enter) => enter.append('rect')
        .attr('width', d => BOXSIZE)
        .attr('height', 0)
        .attr('x', (d, i) => xScaleIndex(i))
        .attr('y', dimensions.ctrHeight)
        .attr('fill', '#37A4DE'),
      (update) => update,
      (exit) => exit.attr('fill', '#f39233')
        .transition()
        .attr('y', dimensions.ctrHeight)
        .attr('height', 0)
        .remove()
    ).transition()
      .attr("height", d => invertyScale(d)).attr("width", BOXSIZE)
      .attr("x", (d, i) => dimensions.ctrWidth * i / 10 + (dimensions.ctrWidth / 10 - BOXSIZE) / 2)
      .attr("y", d => dimensions.ctrHeight - invertyScale(d))
  }


  const genBarChart_Gross = (specificData) => {
    svg.selectAll('*').remove();
    let copiedData = {...specificData}

    delete copiedData["Region"]

    let yData = Object.values(copiedData)

    const xScale = d3.scaleBand().domain(["2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020"]).range([0, dimensions.ctrWidth])
    const xScaleIndex = d3.scaleBand().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).range([0, dimensions.ctrWidth])
    const yScale = d3.scaleLinear().domain([0, d3.max(yData)]).range([dimensions.ctrHeight, 0])
    const invertyScale = d3.scaleLinear().domain([0, d3.max(yData)]).range([0, dimensions.ctrHeight])


    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)
    const xAxisGroup = svg.append("g").call(xAxis).style("transform", `translate(${110}px,${dimensions.ctrHeight}px)`)
    const yAxisGroup = svg.append("g").call(yAxis).style("transform", `translate(${110}px, ${0}px)`)

    xAxisGroup.append("text").attr("x", dimensions.ctrWidth / 2).attr("y", dimensions.marginBottom)
      .attr("fill", 'black')
      .text("Years").style("font-weight", "bold")
    yAxisGroup.append("text").attr("x", -40).attr("y", dimensions.ctrHeight / 2).attr("fill", "black")
      .text("Gross").style("font-weight", "bold")

    svg.append("g").style("transform", `translate(${110}px,${0}px)`).selectAll("rect").data(yData).join(
      (enter) => enter.append('rect')
        .attr('width', d => BOXSIZE)
        .attr('height', 0)
        .attr('x', (d, i) => xScaleIndex(i))
        .attr('y', dimensions.ctrHeight)
        .attr('fill', '#37A4DE'),
      (update) => update,
      (exit) => exit.attr('fill', '#f39233')
        .transition()
        .attr('y', dimensions.ctrHeight)
        .attr('height', 0)
        .remove()
    ).transition()
      .attr("height", d => invertyScale(d)).attr("width", BOXSIZE)
      .attr("x", (d, i) => dimensions.ctrWidth * i / 10 + (dimensions.ctrWidth / 10 - BOXSIZE) / 2)
      .attr("y", d => dimensions.ctrHeight - invertyScale(d))

  }

  useEffect(() => {

    const runningFunction = async () => {

      const data = await d3.csv("population_info.csv", (info) => {
        info = Object.entries(info)
        info = info.map((data) => {
          if (data[0].startsWith("Population")) {
            data[0] = data[0].replace("Population", "").trim()
          }
          data[1] = data[1].replaceAll(",", "")
          let temp = parseFloat(data[1])
          if (isNaN(temp)) {
            return [data[0], data[1]]
          } else {
            return [data[0], temp]
          }
        })
        return Object.fromEntries(info)
      })


      let data_gross = await d3.csv("gross_china.csv" , (info) => {
        let parsedData = Object.entries(info)
        parsedData = parsedData.map((ele) => {
          if (ele[1].includes(",")) {
            ele[1] = ele[1].replaceAll(",", "")
          }
          let temp = parseFloat(ele[1])
          if (isNaN(temp)) {
            return [ele[0], ele[1]]
          } else {
            return [ele[0], temp]
          }
        })
        return Object.fromEntries(parsedData)
      })


      console.log("data_gross:", data_gross)

      setData_gross(data_gross)

      const data_geo = await d3.json('/chinaGeo.json');

      const projection = geo.geoMercator()
        .scale(550)
        .center([105, 38])
        .translate([dimensions.mapWidth / 2, dimensions.mapHeight / 2]);

      console.log(data_geo.features)


      const path = geo.geoPath(projection);

      const color = d3.quantize((t) => d3.interpolateOranges(t), data_geo["features"].length)
      const colorScale = d3.scaleQuantize().domain(d3.extent(data, d => d["2020"])).range(color)

      let places = data.map((d) => {
        return { name: d.Delegation, lat: parseFloat(d.lat), log: parseFloat(d.lng) }
      })


      const svg_geo = d3.select("#svg")
        .attr("width", dimensions.mapWidth)
        .attr("height", dimensions.mapHeight)

      svg_geo.selectAll('path')
        .data(data_geo.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', function (d, i) {
          return colorScale(data.find((datum) => datum.Delegation.toLowerCase() === d.properties.name.toLowerCase())["2020"]);
        })
        .attr('stroke', 'rgba(0, 0, 0, 1')
        .attr('stroke-width', 1);

      const location = svg_geo.selectAll('.location')
        .data(places)
        .enter()
        .append('g')
        .attr('class', 'location')
        .attr('transform', (d) => {
          const coor = projection([d.log, d.lat]);
          return 'translate(' + coor[0] + ',' + coor[1] + ')';
        });


      location.append('circle')
        .attr('r', 4)
        .attr('fill', '#e91e63')
        .attr('class', 'location');

      setData(data)
      setCountries(data.map((datum) => datum.Delegation))

    }
    runningFunction()
  }, [])


  d3.select("#metric").on('change', function (e) {
    e.preventDefault()
    let specificData = data.find(datum => datum.Delegation === this.value)
    genBarChart(specificData)
  })


  d3.select("#svg").selectAll('.location').on('touchmouse mousemove', function (d) {
    let specificData = data.find(datum => datum.Delegation === d.target.__data__.name)
    d.stopPropagation();
    tooltip
      .style('left', d.x + 20 + 'px')
      .style('top', d.y + 'px')
      .style('opacity', 1);
    d3.select(this).select('circle').transition()
      .duration(150)
      .attr('r', 8);
    tooltip.select("#country").text(`Country: ${d.target.__data__.name}`).style("color", "black")
    tooltip.select("#population").text(`Population in 2020: ${specificData["2020"]}`).style("color", "black")
    tooltip.select("#percentage").text(`2010-2020 change: ${Math.round((specificData['2020'] - specificData['2011']) * 100 / specificData['2011'], 2)}%`).style("color", "black")
  }).on('mouseout', function (d) {
    d.stopPropagation();
    tooltip.style('opacity', 0);
    d3.select(this)
      .select('circle')
      .transition()
      .duration(150)
      .attr('r', 4);
  }).on("click", (d) => {
    d.stopPropagation();
    console.log("this is onClick event", d);
    if (selectedOption === "population") {
      genBarChart(data.find(datum => datum.Delegation === d.target.__data__.name))
    } else {
      genBarChart_Gross(data_gross.find(datum => datum["Region"].toLowerCase() === d.target.__data__.name.toLowerCase() ))
    }
    
  })


  const onChangeHandler = (e) => {
    e.preventDefault();
    console.log(e.target.value)
    setSelectedOption(e.target.value)
  }

  return (
    <>
      <p>Here is the title for the graphic</p>
      <select onChange={onChangeHandler}>
        <option value="population" selected="selected">population</option>
        <option value="gross">gross</option>
      </select>
      <div id="container">
        <div id="world">
          <svg id="svg"></svg>
          <div id="tooltip">
            <span id="country"></span>
            <br />
            <span id="population"></span>
            <br />
            <span id="percentage"></span>
          </div>
        </div>
        {/*<select id="metric">
      {countries ? countries.map((country) => {
        return <option value={country}>{country}</option>
      }) : null}
    </select>*/}
        <div id="world-map">
          <svg ref={world_map} id="svg1">
          </svg>
        </div>


      </div>
    </>
  );
}

export default App;
