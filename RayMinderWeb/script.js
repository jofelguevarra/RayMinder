document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const messageDiv = document.getElementById('message');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      messageDiv.textContent = ''; // Clear previous messages

      const data = {
        username: loginForm.username.value,
        password: loginForm.password.value
      };

      try {
        const response = await fetch('http://localhost:5007/api/auth/login', {  // adjust endpoint accordingly
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          messageDiv.textContent = 'Login successful!';
          messageDiv.style.color = 'green';
          // You could redirect user to dashboard or something here
        } else {
          const error = await response.json();
          messageDiv.textContent = error.message || 'Login failed';
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
      messageDiv.textContent = ''; // Clear previous messages

      const data = {
        username: registerForm.regUsername.value,
        password: registerForm.regPassword.value
      };

      try {
        const response = await fetch('http://localhost:5007/api/auth/register', {  // adjust endpoint accordingly
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          messageDiv.textContent = 'Account created successfully!';
          messageDiv.style.color = 'green';
          registerForm.reset();
        } else {
          const error = await response.json();
          messageDiv.textContent = error.message || 'Registration failed';
          messageDiv.style.color = 'red';
        }
      } catch (err) {
        messageDiv.textContent = 'Network error: ' + err.message;
        messageDiv.style.color = 'red';
      }
    });
  }
});
