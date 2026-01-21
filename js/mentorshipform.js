/* CALENDAR  */

const monthYear = document.getElementById("monthYear");
const dates = document.getElementById("dates");

let date = new Date();

function renderCalendar() {
  dates.innerHTML = "";

  const year = date.getFullYear();
  const month = date.getMonth();

  monthYear.innerText =
    date.toLocaleString("default", { month: "long" }) + " " + year;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    dates.innerHTML += "<span></span>";
  }

  for (let d = 1; d <= lastDate; d++) {
    const span = document.createElement("span");
    span.innerText = d;

    span.onclick = () => {
      document
        .querySelectorAll(".dates span")
        .forEach(s => s.classList.remove("active"));
      span.classList.add("active");
    };

    dates.appendChild(span);
  }
}

document.getElementById("prevMonth").onclick = () => {
  date.setMonth(date.getMonth() - 1);
  renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
  date.setMonth(date.getMonth() + 1);
  renderCalendar();
};

renderCalendar();

/* TIME SLOTS  */

const durationSelect = document.querySelector(".right select");
const timeSlotsContainer = document.getElementById("timeSlots");

durationSelect.addEventListener("change", generateTimeSlots);

function generateTimeSlots() {
  timeSlotsContainer.innerHTML = "";

  let gap;
  if (durationSelect.value.includes("30")) gap = 30;
  else if (durationSelect.value.includes("1")) gap = 60;
  else if (durationSelect.value.includes("2")) gap = 120;
  else return;

  let startMinutes = 10 * 60; // 10:00 AM
  let endMinutes = 18 * 60;   // 6:00 PM

  while (startMinutes + gap <= endMinutes) {
    const endTime = startMinutes + gap;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerText = formatTime(startMinutes) + " - " + formatTime(endTime);

    btn.onclick = () => {
      document
        .querySelectorAll(".time-slots button")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };

    timeSlotsContainer.appendChild(btn);
    startMinutes = endTime;
  }
}

function formatTime(minutes) {
  let h = Math.floor(minutes / 60);
  let m = minutes % 60;
  let ampm = h >= 12 ? "PM" : "AM";

  h = h % 12 || 12;
  m = m < 10 ? "0" + m : m;

  return `${h}:${m} ${ampm}`;
}

// form submit rokega
document.querySelector(".book-btn").addEventListener("click", function (e) {
  e.preventDefault();
  alert("Booking Button Clicked Successfully ✅");
});

