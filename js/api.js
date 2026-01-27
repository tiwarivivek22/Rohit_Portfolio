/**
 * API Configuration and Helper Functions
 */

const API_BASE_URL = 'https://rohit-portfolio-backend.vercel.app/api/v1';


/**
 * Submit Pitch Form (with file upload)
 */
async function submitPitch(formData) {
    try {
        const payload = new FormData();

        payload.append("name", formData.name || '');
        payload.append("company_name", formData.company || '');
        payload.append("sector", formData.sector || '');
        payload.append("investment_required", formData.investment || '');
        payload.append("email", formData.email || '');
        payload.append("contact_number", formData.phone || '');
        payload.append("pitch_summary", formData.pitchSummary || '');

        if (formData.file instanceof File) {
            payload.append("proposal_file", formData.file, formData.file.name);
        }

        const response = await fetch(`${API_BASE_URL}/pitch`, {
            method: "POST",
            body: payload
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return { success: true, data: await response.json() };

    } catch (error) {
        console.error("Pitch Submit Error:", error);
        return { success: false, error: error.message };
    }
}

/* CONNECT*/

async function submitConnect(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/connect/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return { success: true, data: await response.json() };

    } catch (error) {
        console.error("Connect Error:", error);
        return { success: false, error: error.message };
    }
}

/* 
   MENTORSHIP APIs  */

/* 
   MENTORSHIP APIs  */

/**
 * Step 1️⃣ Get Available Mentorship Slots
 */
async function getMentorshipAvailability(meetingDate, durationMinutes) {
    try {
        // Send params as query string for GET request
        const queryParams = new URLSearchParams({
            meeting_date: meetingDate,
            duration_minutes: durationMinutes
        }).toString();

        const response = await fetch(`${API_BASE_URL}/mentorship/availability?${queryParams}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        return { success: true, slots: data.slots };

    } catch (error) {
        console.error("Availability Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Step 2️⃣ Create Razorpay Order
 */
async function createPaymentOrder(amount) {
    try {
        const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount,
                currency: 'INR'
            })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return { success: true, order: await response.json() };

    } catch (error) {
        console.error("Payment Order Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Step 4️ Book Mentorship Session (FINAL)
 */
async function bookMentorshipSession(bookingData) {
    try {
        const response = await fetch(`${API_BASE_URL}/mentorship/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return { success: true, data: await response.json() };

    } catch (error) {
        console.error("Booking Error:", error);
        return { success: false, error: error.message };
    }
}

/* UI NOTIFICATIONS */

function showNotification(message, type = 'success') {
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: #fff;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 99999;
        font-family: Inter, sans-serif;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);

    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.innerHTML = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

/* FORM DATA FORMATTERS]*/

function formatPitchData(formElements) {
    const fileInput = document.getElementById('file-upload');

    return {
        name: formElements['name']?.value || '',
        company: formElements['company']?.value || '',
        sector: formElements['sector']?.value || '',
        investment: formElements['investment']?.value || '',
        email: formElements['email']?.value || '',
        phone: formElements['phone']?.value || '',
        pitchSummary: formElements['pitchSummary']?.value || '',
        file: fileInput?.files?.[0] || null
    };
}

function formatConnectData(formElements) {
    return {
        name: formElements[0]?.value || '',
        email: formElements[1]?.value || '',
        purpose: formElements[2]?.value || '',
        message: formElements[3]?.value || '',
        created_at: new Date().toISOString() // Attempting to send date from frontend
    };
}



const RAZORPAY_KEY = 'rzp_test_RS3fi4SsM1ltwU';

/* ADMIN GET APIs */

/**
 * Get Connect Requests (Admin)
 * GET /api/v1/connect/?skip=0&limit=10
 */
async function getConnectRequests(skip = 0, limit = 10) {
    try {
        const response = await fetch(`${API_BASE_URL}/connect/?skip=${skip}&limit=${limit}`);

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        return { success: true, ...data };
    } catch (error) {
        console.error("Get Connect Requests Error:", error);
        return { success: false, error: error.message, data: [], count: 0 };
    }
}

/**
 * Get Pitch Requests (Admin)
 * GET /api/v1/pitch/?skip=0&limit=10
 */
async function getPitchRequests(skip = 0, limit = 10) {
    try {
        const response = await fetch(`${API_BASE_URL}/pitch/?skip=${skip}&limit=${limit}`);

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        return { success: true, ...data };
    } catch (error) {
        console.error("Get Pitch Requests Error:", error);
        return { success: false, error: error.message, data: [], count: 0 };
    }
}

/**
 * Get Mentorship Requests (Admin)
 * GET /api/v1/mentorship/?skip=0&limit=20
 */
async function getMentorshipRequests(skip = 0, limit = 20) {
    try {
        const response = await fetch(`${API_BASE_URL}/mentorship/?skip=${skip}&limit=${limit}`);

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        return { success: true, ...data };
    } catch (error) {
        console.error("Get Mentorship Requests Error:", error);
        return { success: false, error: error.message, data: [], count: 0 };
    }
}

/**
 * Admin Login
 * POST /api/v1/admin/login
 */
async function loginAdmin(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText);
        }

        const data = await response.json();
        return { success: true, ...data };

    } catch (error) {
        console.error("Login Error:", error);
        let errorMessage = "Login failed";
        try {
            const parsed = JSON.parse(error.message);
            if (parsed.detail) errorMessage = parsed.detail;
            else errorMessage = error.message;
        } catch (e) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    }
}
