import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ඔයා දුන් නිවැරදි Firebase Configuration එක
const firebaseConfig = {
    apiKey: "AIzaSyADNg0HkcGg7SisAq_Cjbfqqc9rH0Nv4-I",
    authDomain: "cineworld-901cb.firebaseapp.com",
    projectId: "cineworld-901cb",
    storageBucket: "cineworld-901cb.firebasestorage.app",
    messagingSenderId: "518573519989",
    appId: "1:518573519989:web:9055e0d6efd4b9b7b2743c",
    measurementId: "G-LP2CXFHMN0"
};

// Firebase Initialize කිරීම
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Database එකෙන් Movies ටික Fetch කරගැනීම
async function loadMovies() {
    const movieListElement = document.getElementById("movieList");
    try {
        const querySnapshot = await getDocs(collection(db, "movies"));
        
        if(querySnapshot.empty) {
            movieListElement.innerHTML = "<p>තවම චිත්‍රපට එකතු කර නැත.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const movie = doc.data();
            const card = document.createElement("div");
            card.className = "movie-card";
            card.innerHTML = `
                <h3>${movie.title || 'Movie Title'}</h3>
                <p>${movie.genre || ''}</p>
            `;
            movieListElement.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading movies: ", error);
        movieListElement.innerHTML = "<p>චිත්‍රපට පූරණය කිරීමේ දෝෂයක් සිදු විය.</p>";
    }
}

loadMovies();
