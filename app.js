import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Owner Email (Admin Panel එක පෙනෙන්නේ මේ Email එකෙන් ලොග් වුනොත් පමණි)
const OWNER_EMAIL = "dissanayakavinethsaranga@gmail.com";

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const settingsBtn = document.getElementById('settingsBtn');
const profilePicBtn = document.getElementById('profilePicBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const logoutBtn = document.getElementById('logoutBtn');
const adminSettingsSection = document.getElementById('adminSettingsSection');
const adminPanelBtn = document.getElementById('adminPanelBtn');
const adminModal = document.getElementById('adminModal');
const closeAdminModal = document.getElementById('closeAdminModal');
const addMovieForm = document.getElementById('addMovieForm');

// Google Login
googleLoginBtn.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login අසාර්ථක විය: " + error.message);
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.reload();
});

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');

        // Set User Details & Google DP
        const userDp = user.photoURL || 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png';
        document.getElementById('navUserDp').src = userDp;
        document.getElementById('profileModalDp').src = userDp;
        document.getElementById('userEmailText').innerText = user.email;

        // Check if Owner
        if (user.email === OWNER_EMAIL) {
            adminSettingsSection.classList.remove('hidden');
        } else {
            adminSettingsSection.classList.add('hidden');
        }

        loadMovies();
    } else {
        loginSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
});

// Settings & Modal Controls
settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
profilePicBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));

adminPanelBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
    adminModal.classList.remove('hidden');
});
closeAdminModal.addEventListener('click', () => adminModal.classList.add('hidden'));

// Add Movie (Admin)
addMovieForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await addDoc(collection(db, "movies"), {
            title: document.getElementById('mTitle').value,
            year: document.getElementById('mYear').value,
            category: document.getElementById('mCategory').value,
            image: document.getElementById('mImage').value,
            desc: document.getElementById('mDesc').value,
            cast: document.getElementById('mCast').value,
            youtube: document.getElementById('mYoutube').value,
            telegram: document.getElementById('mTelegram').value,
            isTrending: document.getElementById('mTrending').checked,
            createdAt: serverTimestamp()
        });

        alert("Movie එක සාර්ථකව එකතු කරන ලදී!");
        addMovieForm.reset();
        adminModal.classList.add('hidden');
        loadMovies();
    } catch (error) {
        console.error("Error adding movie:", error);
        alert("Error: " + error.message);
    }
});

// Load Movies from Firestore
async function loadMovies() {
    const preferredContainer = document.getElementById('preferredMovies');
    const trendingContainer = document.getElementById('trendingMovies');

    preferredContainer.innerHTML = '';
    trendingContainer.innerHTML = '';

    const querySnapshot = await getDocs(collection(db, "movies"));
    
    querySnapshot.forEach((doc) => {
        const movie = doc.data();
        const cardHtml = `
            <div class="flex-none w-36 sm:w-44 bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:scale-105 transition duration-300">
                <img src="${movie.image}" class="w-full h-52 sm:h-60 object-cover">
                <div class="p-3 space-y-1">
                    <h3 class="text-white font-bold text-xs sm:text-sm truncate">${movie.title}</h3>
                    <p class="text-gray-400 text-xs">${movie.year} • ${movie.category}</p>
                    <a href="${movie.telegram || '#'}" target="_blank" class="block text-center bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1.5 rounded mt-2">
                        Download
                    </a>
                </div>
            </div>
        `;

        if (movie.isTrending) {
            trendingContainer.innerHTML += cardHtml;
        } else {
            preferredContainer.innerHTML += cardHtml;
        }
    });
}

// Live Search Functionality
const searchInput = document.getElementById('searchBox');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const movieCards = document.querySelectorAll('#preferredMovies > div, #trendingMovies > div');

        movieCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            if (title.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Language Translation Function
window.setAppLanguage = function(langCode) {
    const selectElem = document.querySelector('.goog-te-combo');
    if (selectElem) {
        selectElem.value = langCode;
        selectElem.dispatchEvent(new Event('change'));
    } else {
        alert("Language tool is loading, please try again in a few seconds.");
    }
};
