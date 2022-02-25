document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
  );
  if (!response.ok) {
    const errorMessage = `An error has occured: ${response.status}`;
    throw new Error(errorMessage);
  }
  const fetchedResponse = await response.json();
  const { baseTemperature, monthlyVariance: dataset } = fetchedResponse;
  console.log("dataset", dataset);

  const width = 800;
  const height = 400;
  const padding = 60;
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

  const roundToNearestTenth = (number) => {
    return Math.round(number * 10) / 10;
  };

  const handleApplyFillColor = (varianceFromBaseTemp) => {
    const rectTemperature = roundToNearestTenth(
      baseTemperature + varianceFromBaseTemp
    );
    console.log("rectTemperature", rectTemperature);
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

  const months = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const xScale = d3
    .scaleLinear()
    .domain([d3.min(dataset, (d) => d.year), d3.max(dataset, (d) => d.year)])
    .range([padding, width - padding]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 12])
    .range([height - padding, padding]);

  const xAxis = d3.axisBottom(xScale).tickFormat((d) => d);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => Object.keys(months).find((key) => months[key] === d));

  const tooltip = d3.select("body").append("div").attr("id", "tooltip");

  svg
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("fill", (d) => handleApplyFillColor(d?.variance))
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month))
    // @TODO -- Fix width and height below to calculate dynamically
    .attr("width", () => 4)
    .attr("height", () => 20)
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
  // @TODO -- Add a legend to the heat map
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
});
