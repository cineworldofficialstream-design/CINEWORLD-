// login.js
import { auth } from './firebase.js';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Email / Password Login
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            checkUserAndRedirect(userCredential.user);
        })
        .catch((error) => {
            alert("Error: වැරදි ඊමේල් එකක් හෝ පාස්වර්ඩ් එකක්! (" + error.message + ")"); 
        });
});

// Google Sign-In
const googleLoginBtn = document.getElementById('google-login-btn');
const provider = new GoogleAuthProvider();

googleLoginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            checkUserAndRedirect(result.user);
        }).catch((error) => {
            alert("Google Sign In Error: " + error.message);
        });
});

// Admin ද සාමාන්‍ය User කෙනෙක්ද බලන Function එක
function checkUserAndRedirect(user) {
    if(user.email === 'cineworldofficialstream@gmail.com') {
        alert("Welcome Website Owner! Admin Dashboard එකට යොමු කෙරේ...");
        window.location.href = "admin.html"; // අනාගතයේ හදන admin පිටුව
    } else {
        alert("Welcome to Cineworld! Movies පිටුවට යොමු කෙරේ...");
        window.location.href = "movies.html"; // අනාගතයේ හදන movies පිටුව
    }
}
