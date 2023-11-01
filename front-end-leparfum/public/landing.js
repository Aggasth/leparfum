
  const isLoggedIn = true;

  document.addEventListener("DOMContentLoaded", function() {
    const loginBtn = document.getElementById('loginBtn');
    const dropdown = document.querySelector('.dropdown');

    if (isLoggedIn) {
      loginBtn.style.display = 'none';
      dropdown.style.display = 'block';
    } else {
      loginBtn.style.display = 'block';
      dropdown.style.display = 'none';
    }
  });
