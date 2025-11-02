document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const messageDiv = document.getElementById('message');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      messageDiv.textContent = '';

      const data = {
        username: loginForm.username.value,
        password: loginForm.password.value
      };

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          // Store username so we can use it later (e.g., in location tracking)
          localStorage.setItem('username', data.username);

          messageDiv.textContent = 'Login successful!';
          messageDiv.style.color = 'green';

          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = 'you.html';
          }, 1000);
        } else {
          messageDiv.textContent = result.message || 'Login failed';
          messageDiv.style.color = 'red';
        }
      } catch (err) {
        messageDiv.textContent = 'Network error: ' + err.message;
        messageDiv.style.color = 'red';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      messageDiv.textContent = '';

      const data = {
        username: registerForm.regUsername.value,
        password: registerForm.regPassword.value
      };

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          messageDiv.textContent = 'Account created successfully!';
          messageDiv.style.color = 'green';
          registerForm.reset();
        } else {
          messageDiv.textContent = result.message || 'Registration failed';
          messageDiv.style.color = 'red';
        }
      } catch (err) {
        messageDiv.textContent = 'Network error: ' + err.message;
        messageDiv.style.color = 'red';
      }
    });
  }
});
