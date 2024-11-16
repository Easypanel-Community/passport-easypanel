document.addEventListener('DOMContentLoaded', () => {
    const messageElement = document.getElementById('message');

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            const code = document.getElementById('code').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password, rememberMe, code })
                });

                if (!response.ok) {
                    const error = await response.json();
                    messageElement.textContent = `Error: ${error.error}`;
                } else {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    window.location.href = '/profile.html';
                }
            } catch (err) {
                messageElement.textContent = 'Error: Unable to login.';
            }
        });
    }

    const userElement = document.getElementById('user');
    if (userElement) {
        const token = localStorage.getItem('token');
        if (!token) {
            userElement.textContent = 'You are not logged in.';
            return;
        }

        fetch('/profile', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(async (response) => {
                if (!response.ok) {
                    const error = await response.json();
                    userElement.textContent = `Error: ${error.error}`;
                } else {
                    const data = await response.json();
                    userElement.textContent = `User: ${JSON.stringify(data.user)}`;
                }
            })
            .catch(() => {
                userElement.textContent = 'Error: Unable to fetch profile.';
            });
    }
});
