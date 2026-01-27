const API_BASE_URL = 'https://rohit-portfolio-backend.vercel.app/api/v1';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (hamburgerBtn && sidebar && sidebarOverlay) {
        const toggleSidebar = () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        };

        hamburgerBtn.addEventListener('click', toggleSidebar);
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }

    // 2. Set Date
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }

    // 3. Fetch Data and Populate Dashboard
    fetchDashboardData();
});

async function fetchDashboardData() {
    try {
        // Fetch specific endpoints
        // Using limit=100 to avoid Backend 422 Error (Unprocessable Entity)
        const [pitches, contacts, mentorships] = await Promise.all([
            fetchData('pitch'),
            fetchData('connect'),
            fetchData('mentorship')
        ]);

        console.log("Pitches:", pitches.length);
        console.log("Contacts:", contacts.length);
        console.log("Mentorships:", mentorships.length);

        // Update UI
        updateSection('All', pitches, contacts, mentorships);
        updateSection('Today', pitches, contacts, mentorships);

    } catch (error) {
        console.error("Dashboard Error:", error);
    }
}

async function fetchData(endpoint) {
    try {
        // Reduced limit from 10000 to 100 to prevent API errors
        const response = await fetch(`${API_BASE_URL}/${endpoint}/?skip=0&limit=100`);
        if (!response.ok) {
            throw new Error(`API Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle different possible response structures
        if (Array.isArray(data)) {
            return data;
        } else if (data.data && Array.isArray(data.data)) {
            return data.data; // Common paginated structure
        } else if (data.items && Array.isArray(data.items)) {
            return data.items;
        } else {
            console.warn(`Unexpected data format for ${endpoint}`, data);
            return [];
        }
    } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);

        // Visual Feedback for the user
        // Map endpoint to ID prefix
        let prefix = "";
        if (endpoint === 'pitch') prefix = "pitches";
        else if (endpoint === 'connect') prefix = "contact";
        else if (endpoint === 'mentorship') prefix = "mentorship";

        if (prefix) {
            const el = document.getElementById(`${prefix}TotalCount`);
            if (el) {
                el.innerText = "-"; // Indicate missing data
                el.style.color = "red";
                el.title = "Failed to load data";
            }
        }

        return [];
    }
}

function updateSection(type, pitches, contacts, mentorships) {
    // type is 'All' or 'Today'
    let outputPitches = 0;
    let outputContacts = 0;
    let outputMentorships = 0;

    if (type === 'All') {
        outputPitches = pitches.length;
        outputContacts = contacts.length;
        outputMentorships = mentorships.length;

        animateValue("pitchesTotalCount", 0, outputPitches, 1000);
        animateValue("contactTotalCount", 0, outputContacts, 1000);
        animateValue("mentorshipTotalCount", 0, outputMentorships, 1000);

    } else if (type === 'Today') {
        outputPitches = countToday(pitches);
        outputContacts = countToday(contacts);
        outputMentorships = countToday(mentorships);

        animateValue("pitchesTodayCount", 0, outputPitches, 1000);
        animateValue("contactTodayCount", 0, outputContacts, 1000);
        animateValue("mentorshipTodayCount", 0, outputMentorships, 1000);
    }
}

function countToday(items) {
    if (!Array.isArray(items)) return 0;

    const today = new Date();
    const isSameDate = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    return items.filter(item => {
        // Connect API response might lack 'created_at' in the minimal view
        // We check for multiple variations including 'timestamp' if available
        const dateStr = item.createdAt || item.created_at || item.date || item.timestamp;

        if (!dateStr) {
            // If date is missing, we can't count it as today
            return false;
        }

        const itemDate = new Date(dateStr);
        // Check for invalid dates
        if (isNaN(itemDate.getTime())) return false;

        return isSameDate(itemDate, today);
    }).length;
}

// Animation helper
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;

    // If end is 0, just set it
    if (end === 0) {
        obj.textContent = "0";
        return;
    }

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}