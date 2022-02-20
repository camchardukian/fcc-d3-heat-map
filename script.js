console.log('script is loaded into index.html')
console.log('confirm D3 methods are available', d3)

document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch(
        "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
    );
    if (!response.ok) {
        const errorMessage = `An error has occured: ${response.status}`;
        throw new Error(errorMessage);
    }
    const data = await response.json();
    const { baseTemperature, monthlyVariance } = data;
    console.log("baseTemperature", baseTemperature);
    console.log("monthlyVariance", monthlyVariance);

});