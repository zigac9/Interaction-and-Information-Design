$(function () {
  let dates = [];

  // Fetch dates from the CSV file
  fetch('data/game_dates.csv')
    .then(response => response.text())
    .then(data => {
      dates = data.split('\n').map(dateString => {
        const year = parseInt(dateString.substring(0, 4));
        const month = parseInt(dateString.substring(4, 6)) - 1;
        const day = parseInt(dateString.substring(6, 8));
        return new Date(year, month, day);
      }).filter(date => !isNaN(date));
    })
    .catch(error => console.error('Error fetching dates:', error));

  $("#datepicker").datepicker({
    dateFormat: "yy-mm-dd", // Change date format to DD/MM/YYY
    numberOfMonths: [1, 1],
    beforeShowDay: highlightDays,
  });

  function highlightDays(date) {
    for (var i = 0; i < dates.length; i++) {
      if (
        date.getFullYear() === dates[i].getFullYear() &&
        date.getMonth() === dates[i].getMonth() &&
        date.getDate() === dates[i].getDate()
      ) {
        return [true, "highlight"];
      }
    }
    return [true, ""];
  }
});

document
  .getElementById("clearDatePicker")
  .addEventListener("click", function () {
    document.getElementById("datepicker").value = "";
    document.getElementById("teamDropdown").disabled = false;
  });

function updateYearLabel(value) {
  let startYear = value;
  let endYear = parseInt(value) + 1;
  document.getElementById(
    "selectedYear"
  ).textContent = `${startYear}/${endYear}`;
}

function toggleAllYearFilter(checkbox) {
  if (checkbox.checked) {
    document.getElementById("yearSlider").disabled = true;
    document.getElementById("selectedYear").textContent = "All Years";
  } else {
    document.getElementById("yearSlider").disabled = false;
    updateYearLabel(document.getElementById("yearSlider").value);
  }
}
