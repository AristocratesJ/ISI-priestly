document.addEventListener('DOMContentLoaded', () => {
    // Theme switcher functionality (same as login.js)
    const toggleSwitch = document.querySelector('#checkbox');
    const currentTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', currentTheme);
    toggleSwitch.checked = currentTheme === 'dark';

    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Registration form validation
    const form = document.querySelector('.login-form');
    const password = document.querySelector('#password');
    const confirmPassword = document.querySelector('#confirmPassword');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Password validation
        if (password.value !== confirmPassword.value) {
            alert('Hasła nie są identyczne!');
            return;
        }

        if (password.value.length < 8) {
            alert('Hasło musi mieć co najmniej 8 znaków!');
            return;
        }

        // Collect form data
        const formData = {
            firstName: document.querySelector('#firstName').value,
            lastName: document.querySelector('#lastName').value,
            email: document.querySelector('#email').value,
            parish: document.querySelector('#parish').value,
            password: password.value,
            terms: document.querySelector('#terms').checked
        };

        // Here you would typically make an API call to your backend
        console.log('Registration attempt:', formData);
        
        // For demo purposes, show success message
        alert('Rejestracja przebiegła pomyślnie! Sprawdź swoją skrzynkę email, aby potwierdzić konto.');
    });

    // Real-time password match validation
    confirmPassword.addEventListener('input', function() {
        if (password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity('Hasła muszą być identyczne');
        } else {
            confirmPassword.setCustomValidity('');
        }
    });
}); 