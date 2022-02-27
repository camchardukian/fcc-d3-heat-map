document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
  );
  if (!response.ok) {
    const errorMessage = `An error has occured: ${response.status}`;
    throw new Error(errorMessage);
  }
  const fetchedResponse = await response.json();

  // CONST DECLARATIONS
  const { baseTemperature, monthlyVariance: dataset } = fetchedResponse;
  const width = 800;
  const height = 400;
  const padding = 60;
  const minYear = d3.min(dataset, (d) => d.year)
  const maxYear = d3.max(dataset, (d) => d.year)
  const numberOfYears = maxYear - minYear
  const HEAT_SCALE = {
    COLDEST: 3.9,
    COLD: 5.0,
    CHILLY: 6.1,
    COOL: 7.2,
    NEUTRAL: 8.3,
    LUKE_WARM: 9.5,
    WARM: 10.6,
    HOT: 11.7,
    HOTTEST: 12.8,
  };

  // HELPER METHODS
  const roundToNearestTenth = (number) => {
    return Math.round(number * 10) / 10;
  };

  const handleApplyFillColor = (varianceFromBaseTemp) => {
    const rectTemperature = roundToNearestTenth(
      baseTemperature + varianceFromBaseTemp
    );
    if (rectTemperature <= HEAT_SCALE.COLDEST) return "#4575b4";
    if (rectTemperature <= HEAT_SCALE.COLD) return "#74add1";
    if (rectTemperature <= HEAT_SCALE.CHILLY) return "#abd9e9";
    if (rectTemperature <= HEAT_SCALE.COOL) return "#e0f3f8";
    if (rectTemperature <= HEAT_SCALE.NEUTRAL) return "#ffffbf";
    if (rectTemperature <= HEAT_SCALE.LUKE_WARM) return "#fee090";
    if (rectTemperature <= HEAT_SCALE.WARM) return "#fdae61";
    if (rectTemperature <= HEAT_SCALE.HOT) return "#f46d43";
    if (rectTemperature <= HEAT_SCALE.HOTTEST) return "#ff5733";
  };

  // SVG
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // SCALES
  const xScale = d3
    .scaleLinear()
    .domain([minYear, maxYear])
    .range([padding, width - padding]);

  const yScale = d3
    .scaleTime()
    .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
    .range([height - padding, padding]);

  // AXES
  const xAxis = d3.axisBottom(xScale).tickFormat((d) => d);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat(d3.timeFormat('%B'))

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height - padding})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding},0)`)
    .call(yAxis);

  // TOOLTIP
  const tooltip = d3.select("body").append("div").attr("id", "tooltip");

  // RECT
  svg
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("fill", (d) => handleApplyFillColor(d?.variance))
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(new Date(0, d.month) - 1, 0, 0, 0, 0, 0))
    .attr("width", () => (width - (padding * 2)) / numberOfYears)
    .attr("height", () => (height - (padding * 2)) / 12)
    .attr("data-year", (d) => d.year)
    .attr("data-month", (d) => d.month - 1)
    .attr("data-temp", (d) => roundToNearestTenth(baseTemperature + d.variance))
    .on("mouseenter", (item) => {
      const rectData = item.target?.__data__;
      const roundedTempVariance =
        roundToNearestTenth(rectData?.variance) > 0
          ? `+${roundToNearestTenth(rectData?.variance)}`
          : `${roundToNearestTenth(rectData?.variance)}`;
      tooltip
        .transition()
        .style("visibility", "visible")
        .text(
          `Date: ${rectData?.month}/${rectData?.year}
        Temperature: ${roundToNearestTenth(
            baseTemperature + rectData?.variance
          )}
        Variance from base temperature: ${roundedTempVariance}`
        )
        .attr("data-year", rectData?.year);
    })
    .on("mouseout", () => tooltip.transition().style("visibility", "hidden"));

  // LEGEND
  const legendWidth = width / 2;
  const temperatureScaleArray = Object.values(HEAT_SCALE)
  const xScaleLegend = d3
    .scaleLinear()
    .domain([0, 9])
    .range([0, legendWidth]);

  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("width", legendWidth)
    .attr("transform", `translate(${(width - legendWidth) / 2},${height - (padding / 1.75)})`)

  const legendScale = legend.append("g").attr("id", "legend-scale");

  legendScale
    .selectAll("rect")
    .data(temperatureScaleArray)
    .enter()
    .append("rect")
    .attr("class", "legend-scale-cell")
    .attr("fill", (d) => handleApplyFillColor(d - baseTemperature))
    .attr("width", xScaleLegend(1))
    .attr("height", () => 20)
    .attr("x", (_, i) => xScaleLegend(i))

  legendScale.selectAll("text")
    .data(temperatureScaleArray)
    .enter()
    .append("text")
    .attr("x", (_, i) => xScaleLegend(i) + 10)
    .attr("y", 32)
    .text((d) => String(d).length > 1 ? d : `${d}.0`)
});
