// Reference the API configuration from lead-automation.js
// If API_CONFIG is not defined, create with safe defaults
if (typeof API_CONFIG === 'undefined') {
  const API_CONFIG = {
    BASE_URL: 'https://api-example-chatbot.example.com',
    API_KEY: 'YOUR_API_KEY_HERE',
    VERSION: 'v1'
  };
}

// User menu dropdown toggle
document.getElementById('user-menu-button').addEventListener('click', function() {
  const dropdown = document.getElementById('user-dropdown');
  const isActive = dropdown.classList.contains('opacity-100');
  
  if (isActive) {
    // Hide dropdown
    dropdown.classList.remove('opacity-100', 'scale-100');
    dropdown.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
      dropdown.classList.add('hidden');
    }, 200);
  } else {
    // Show dropdown
    dropdown.classList.remove('hidden');
    setTimeout(() => {
      dropdown.classList.remove('opacity-0', 'scale-95');
      dropdown.classList.add('opacity-100', 'scale-100');
    }, 10);
    
    // Update email display in dropdown
    const userEmailDisplay = document.getElementById('user-email-display');
    const userEmail = localStorage.getItem("userEmail") || "Guest";
    userEmailDisplay.textContent = userEmail;
    
    // Show/hide auth options based on login status
    const authOptions = document.getElementById('auth-options');
    if (localStorage.getItem("userData")) {
      authOptions.classList.add('hidden');
    } else {
      authOptions.classList.remove('hidden');
    }
  }
});

// Handle clicking outside to close dropdown
document.addEventListener('click', function(event) {
  const userMenu = document.getElementById('user-menu');
  const dropdown = document.getElementById('user-dropdown');
  
  if (!userMenu.contains(event.target) && !dropdown.classList.contains('hidden')) {
    dropdown.classList.remove('opacity-100', 'scale-100');
    dropdown.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
      dropdown.classList.add('hidden');
    }, 200);
  }
});

// Handle login and signup redirections
document.addEventListener('DOMContentLoaded', function() {
  // Check if auth links exist in dropdown
  const loginLink = document.querySelector('#auth-options a[href="login.html"]');
  const signupLink = document.querySelector('#auth-options a[href="signup.html"]');
  
  if (loginLink) {
    loginLink.addEventListener('click', function(e) {
      // Track click on login
      if (window.leadManager) {
        const email = localStorage.getItem("userEmail");
        if (email) {
          window.leadManager.addLeadInteraction(email, 'navigation', 'Clicked login from dropdown');
        }
      }
    });
  }
  
  if (signupLink) {
    signupLink.addEventListener('click', function(e) {
      // Track click on signup
      if (window.leadManager) {
        const email = localStorage.getItem("userEmail");
        if (email) {
          window.leadManager.addLeadInteraction(email, 'navigation', 'Clicked signup from dropdown');
        }
      }
    });
  }
  
  // Add logout functionality if user is logged in
  if (localStorage.getItem("userData")) {
    const userDropdown = document.getElementById('user-dropdown');
    
    // Check if logout button already exists
    let logoutButton = document.getElementById('logout-button');
    if (!logoutButton) {
      logoutButton = document.createElement('button');
      logoutButton.id = 'logout-button';
      logoutButton.className = 'block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700';
      logoutButton.textContent = 'Log Out';
      userDropdown.appendChild(logoutButton);
      
      // Add logout handler
      logoutButton.addEventListener('click', function() {
        // Track logout action
        if (window.leadManager) {
          const email = localStorage.getItem("userEmail");
          if (email) {
            window.leadManager.addLeadInteraction(email, 'auth', 'User logged out');
          }
        }
        
        // Clear user data
        localStorage.removeItem("userData");
        showToast('Logged out successfully');
        
        // Show login/signup options
        const authOptions = document.getElementById('auth-options');
        if (authOptions) {
          authOptions.classList.remove('hidden');
        }
        
        // Redirect after short delay
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000);
      });
    }
  }
});