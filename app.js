import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyADNg0HkcGg7SisAq_Cjbfqqc9rH0Nv4-I",
    authDomain: "cineworld-901cb.firebaseapp.com",
    projectId: "cineworld-901cb",
    storageBucket: "cineworld-901cb.firebasestorage.app",
    messagingSenderId: "518573519989",
    appId: "1:518573519989:web:9055e0d6efd4b9b7b2743c",
    measurementId: "G-LP2CXFHMN0"
};

// Website Owner Admin Gmail Address
const ADMIN_EMAIL = "cineworldofficialstream@gmail.com";

// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const searchBox = document.getElementById('searchBox');
const adminPanelBtn = document.getElementById('adminPanelBtn');
const adminModal = document.getElementById('adminModal');
const closeAdminModal = document.getElementById('closeAdminModal');
const addMovieForm = document.getElementById('addMovieForm');

const emailLoginForm = document.getElementById('emailLoginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');

let allMoviesData = [];
let currentUserEmail = "";

// Helper: Escape strings to prevent XSS vulnerabilities
function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

// 1. Google Authentication
googleLoginBtn.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        alert("Google Login දෝෂයක්: " + error.message);
    }
});

// 2. Email Login & Signup
emailLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) return;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (signUpError) {
            alert("ලොගින් දෝෂයක් සිදු විය: " + signUpError.message);
        }
    }
});

// 3. Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
    }
});

// 4. Global Auth Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserEmail = user.email || "";
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');

        // Admin Gmail එකෙන් ආවොත් Admin Panel Button එක පෙන්වීම
        if (currentUserEmail === ADMIN_EMAIL) {
            adminPanelBtn.classList.remove('hidden');
        } else {
            adminPanelBtn.classList.add('hidden');
        }

        fetchMovies();
    } else {
        currentUserEmail = "";
        dashboardSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        adminPanelBtn.classList.add('hidden');
    }
});

// 5. Fetch Movies from Firestore
async function fetchMovies() {
    try {
        const querySnapshot = await getDocs(collection(db, "movies"));
        allMoviesData = [];
        querySnapshot.forEach((doc) => {
            allMoviesData.push({ id: doc.id, ...doc.data() });
        });
        
        displayMovies(allMoviesData);
        setupHeroBanner(allMoviesData);
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

// 6. Setup Hero Banner
function setupHeroBanner(movies) {
    const featured = movies.find(m => m.isTrending) || movies[0];
    if (featured) {
        const banner = document.getElementById('heroBanner');
        const title = document.getElementById('heroTitle');
        const desc = document.getElementById('heroDesc');
        const watchBtn = document.getElementById('heroWatchBtn');

        if (featured.imageUrl) {
            banner.style.backgroundImage = `linear-gradient(to top, #000, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('${escapeHTML(featured.imageUrl)}')`;
        }
        title.innerText = featured.title || "Featured Movie";
        desc.innerText = featured.description || "";
        watchBtn.onclick = () => window.goToDetail(featured.id);
    }
}

// 7. Display Movies Grid
function displayMovies(movies) {
    const top10Container = document.getElementById('top10Container');
    const allMoviesContainer = document.getElementById('allMoviesContainer');
    
    top10Container.innerHTML = "";
    allMoviesContainer.innerHTML = "";

    if (movies.length === 0) {
        allMoviesContainer.innerHTML = "<p class='text-gray-400 col-span-full text-center py-8'>චිත්‍රපට හමු නොවීය.</p>";
        return;
    }

    const isAdmin = currentUserEmail === ADMIN_EMAIL;
    let rank = 1;

    movies.forEach((movie) => {
        const title = escapeHTML(movie.title);
        const img = escapeHTML(movie.imageUrl);
        const category = escapeHTML(movie.category || 'Movie');
        const year = escapeHTML(movie.year || '');

        const deleteButtonHTML = isAdmin ? `
            <button onclick="event.stopPropagation(); window.deleteMovie('${movie.id}')" class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition text-xs z-10" title="Delete Movie">
                <i class="fa-solid fa-trash"></i>
            </button>
        ` : '';

        // Top 10 Card
        if (movie.isTrending && rank <= 10) {
            top10Container.innerHTML += `
                <div onclick="goToDetail('${movie.id}')" class="relative min-w-[180px] bg-gray-900 rounded-xl overflow-hidden shadow-xl cursor-pointer hover:scale-105 transition duration-300 flex-shrink-0 snap-start border border-gray-800">
                    ${deleteButtonHTML}
                    <div class="relative h-64">
                        <img src="${img}" alt="${title}" class="w-full h-full object-cover">
                        <span class="absolute top-2 left-2 bg-red-600 text-white font-extrabold text-sm w-7 h-7 rounded-full flex items-center justify-center shadow-lg">${rank}</span>
                    </div>
                    <div class="p-3">
                        <h3 class="font-bold text-sm truncate">${title}</h3>
                        <p class="text-xs text-gray-400 mt-0.5">${category}</p>
                    </div>
                </div>
            `;
            rank++;
        }

        // All Movies Grid Card
        allMoviesContainer.innerHTML += `
            <div onclick="goToDetail('${movie.id}')" class="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition duration-300 border border-gray-800">
                ${deleteButtonHTML}
                <div class="h-60 bg-gray-950">
                    <img src="${img}" alt="${title}" class="w-full h-full object-cover">
                </div>
                <div class="p-3">
                    <h3 class="font-bold text-xs sm:text-sm truncate">${title}</h3>
                    <p class="text-xs text-gray-400 mt-1">${year}</p>
                </div>
            </div>
        `;
    });
}

// Redirect to Details
window.goToDetail = function(movieId) {
    window.location.href = `detail.html?id=${movieId}`;
}

// Delete Movie (Admin Only)
window.deleteMovie = async function(movieId) {
    if (confirm("ඔබට මෙම චිත්‍රපටය දත්ත ගබඩාවෙන් මකා දැමීමට අවශ්‍යද?")) {
        try {
            await deleteDoc(doc(db, "movies", movieId));
            alert("චිත්‍රපටය සාර්ථකව මකා දමන ලදී!");
            fetchMovies();
        } catch (error) {
            alert("මකා දැමීමට නොහැක: " + error.message);
        }
    }
};

// 8. Admin Modal UI Handlers
adminPanelBtn.addEventListener('click', () => adminModal.classList.remove('hidden'));
closeAdminModal.addEventListener('click', () => adminModal.classList.add('hidden'));

// Add Movie Form Submission
addMovieForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newMovie = {
        title: document.getElementById('mTitle').value.trim(),
        year: document.getElementById('mYear').value.trim(),
        category: document.getElementById('mCategory').value.trim(),
        imageUrl: document.getElementById('mImage').value.trim(),
        description: document.getElementById('mDesc').value.trim(),
        cast: document.getElementById('mCast').value.trim(),
        youtubeUrl: document.getElementById('mYoutube').value.trim(),
        telegramLink: document.getElementById('mTelegram').value.trim(),
        isTrending: document.getElementById('mTrending').checked,
        createdAt: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, "movies"), newMovie);
        alert("චිත්‍රපටය සාර්ථකව එකතු කළා!");
        addMovieForm.reset();
        adminModal.classList.add('hidden');
        fetchMovies();
    } catch (error) {
        alert("එකතු කිරීමට නොහැකි විය: " + error.message);
    }
});

// 9. Search Logic
searchBox.addEventListener('input', (e) => {
    const searchText = e.target.value.toLowerCase().trim();
    const filtered = allMoviesData.filter(movie => 
        (movie.title && movie.title.toLowerCase().includes(searchText)) ||
        (movie.category && movie.category.toLowerCase().includes(searchText))
    );
    displayMovies(filtered);
});
