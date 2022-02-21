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
  console.log("baseTemperature", baseTemperature);
  console.log("dataset", dataset);

  const width = 800;
  const height = 400;
  const padding = 60;

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
    .domain([1, 12])
    .range([height - padding, padding]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => Object.keys(months).find((key) => months[key] === d));

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
