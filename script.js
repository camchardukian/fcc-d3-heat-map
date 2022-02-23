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
  const roundToNearestTenth = (number) => {
    return Math.round(number * 10) / 10;
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
    // @TODO -- Add class to apply fill color based on temperature of said data point
    .attr("class", "cell")
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month))
    // @TODO -- Fix width and height below to calculate dynamically
    .attr("width", () => 4)
    .attr("height", () => 20)
    .attr("data-year", (d) => d.year)
    .attr("data-month", (d) => d.month - 1)
    .attr("data-temp", (d) => baseTemperature + d.variance)
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
