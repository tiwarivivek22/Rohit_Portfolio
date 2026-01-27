/**
 * Auth Guard & Logout Logic
 * This script should be included in every protected admin page.
 */

// 1. Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('admin_logged_in');

    // If not logged in, redirect to login page immediately
    if (!isLoggedIn) {
        // Use replace to prevent back button from returning to this page
        window.location.replace('login.html');
    }
}

// Run check immediately
checkAuth();

// 2. Handle Logout
document.addEventListener('DOMContentLoaded', () => {
    // Find the logout link
    const logoutLink = document.querySelector('.logout-section a');

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default navigation

            // Clear auth state
            localStorage.removeItem('admin_logged_in');
            localStorage.removeItem('admin_token'); // If used in future

            // Redirect to login
            window.location.replace('login.html');
        });
    }

    // Also prevent going back to protected pages via browser history
    // This part is tricky as we can't clear history, but the checkAuth() above 
    // runs on page load. To handle "Back" from cache (bfcache), we can use pageshow.
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            // Page was restored from bfcache
            checkAuth();
        }
    });

});
