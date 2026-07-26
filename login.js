import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "firebase/auth";

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Admin ද කියලා බලනවා
            if(user.email === 'cineworldofficialstream@gmail.com') {
                alert("Welcome Website Owner! Admin Dashboard එකට යොමු කෙරේ...");
                window.location.href = "admin.html"; 
            } else {
                alert("Welcome to Cineworld! Movies පිටුවට යොමු කෙරේ...");
                window.location.href = "movies.html"; 
            }
        })
        .catch((error) => {
            alert("Error: වැරදි ඊමේල් එකක් හෝ පාස්වර්ඩ් එකක්!"); 
        });
});
