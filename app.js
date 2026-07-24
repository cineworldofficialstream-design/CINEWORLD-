import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyADNg0HkcGg7SisAq_Cjbfqqc9rH0Nv4-I",
    authDomain: "cineworld-901cb.firebaseapp.com",
    projectId: "cineworld-901cb",
    storageBucket: "cineworld-901cb.firebasestorage.app",
    messagingSenderId: "518573519989",
    appId: "1:518573519989:web:9055e0d6efd4b9b7b2743c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Admin Email Validation
const ADMIN_EMAIL = "cineworldofficialstream@gmail.com";

// HTML Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const searchBox = document.getElementById('searchBox');

// Settings & Chat Elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const openChatBtn = document.getElementById('openChatBtn');
const userEmailText = document.getElementById('userEmailText');
const userInitial = document.getElementById('userInitial');

// Admin Elements
const adminSettingsSection = document.getElementById('adminSettingsSection');
const adminPanelBtn = document.getElementById('adminPanelBtn');
const adminModal = document.getElementById('adminModal');
const closeAdminModal = document.getElementById('closeAdminModal');
const addMovieForm = document.getElementById('addMovieForm');

let allMoviesData = [];
let currentUserEmail = "";
let userFollowers = 0; // Followers count (Change this logic later in DB)

// Google Translation Logic
window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
}

window.changeLanguage = function(langCode) {
    const selectField = document.querySelector(".goog-te-combo");
    if(selectField) {
        selectField.value = langCode;
        selectField.dispatchEvent(new Event('change'));
        settingsModal.classList.add('hidden'); // භාෂාව තේරූ පසු Settings වැසේ
    } else {
        alert("Translation tool is still loading. Please try again in a few seconds.");
    }
}

// Login
googleLoginBtn.addEventListener('click', async () => {
    try { await signInWithPopup(auth, provider); } 
    catch (e) { alert("Login Error: " + e.message); }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    settingsModal.classList.add('hidden');
});

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserEmail = user.email;
        userEmailText.innerText = currentUserEmail;
        userInitial.innerText = currentUserEmail.charAt(0).toUpperCase();
        
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');

        // අයිතිකරුට පමණක් Admin Dashboard Section එක පෙන්වීම
        if (currentUserEmail === ADMIN_EMAIL) {
            adminSettingsSection.classList.remove('hidden');
        } else {
            adminSettingsSection.classList.add('hidden');
        }

        fetchMovies();
    } else {
        currentUserEmail = "";
        dashboardSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    }
});

// Settings Modal UI
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
    settingsModal.classList.add('flex');
});
closeSettings.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
    settingsModal.classList.remove('flex');
});

// Chat Logic (Followers required)
openChatBtn.addEventListener('click', () => {
    if (userFollowers > 0) {
        alert("Chat Box Opening..."); // Add Real Chat UI later
    } else {
        alert("Chat එක භාවිතා කිරීමට ඔබට අඩුම තරමේ එක් Follower කෙනෙක් හෝ සිටිය යුතුය!");
    }
});

// Admin Modal UI
adminPanelBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
    adminModal.classList.remove('hidden');
});
closeAdminModal.addEventListener('click', () => adminModal.classList.add('hidden'));

// Search Function
if(searchBox) {
    searchBox.addEventListener('input', (e) => {
        const txt = e.target.value.toLowerCase();
        const filtered = allMoviesData.filter(m => m.title.toLowerCase().includes(txt) || m.category.toLowerCase().includes(txt));
        displayMovies(filtered);
    });
}

// Add Movie Database Logic
addMovieForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newMovie = {
        title: document.getElementById('mTitle').value,
        year: document.getElementById('mYear').value,
        category: document.getElementById('mCategory').value,
        imageUrl: document.getElementById('mImage').value,
        description: document.getElementById('mDesc').value,
        cast: document.getElementById('mCast').value,
        youtubeUrl: document.getElementById('mYoutube').value,
        telegramLink: document.getElementById('mTelegram').value,
        isTrending: document.getElementById('mTrending').checked,
        createdAt: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, "movies"), newMovie);
        alert("චිත්‍රපටය සාර්ථකව එකතු කළා!");
        addMovieForm.reset();
        adminModal.classList.add('hidden');
        fetchMovies();
    } catch (e) { alert("Error: " + e.message); }
});

// Delete Movie Database Logic
window.deleteMovie = async function(id) {
    if (confirm("මෙම චිත්‍රපටය මකා දැමීමට අවශ්‍යද?")) {
        await deleteDoc(doc(db, "movies", id));
        fetchMovies();
    }
}

// Fetch & Display Movies Logic
async function fetchMovies() {
    const qs = await getDocs(collection(db, "movies"));
    allMoviesData = [];
    qs.forEach(d => allMoviesData.push({ id: d.id, ...d.data() }));
    
    // Set Hero Banner
    const featured = allMoviesData.find(m => m.isTrending) || allMoviesData[0];
    if (featured) {
        document.getElementById('heroBanner').style.backgroundImage = `linear-gradient(to top, #121212, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url('${featured.imageUrl}')`;
        document.getElementById('heroTitle').innerText = featured.title;
        document.getElementById('heroDesc').innerText = featured.description;
        document.getElementById('heroWatchBtn').onclick = () => window.location.href = `detail.html?id=${featured.id}`;
    }
    
    displayMovies(allMoviesData);
}

function displayMovies(movies) {
    const pref = document.getElementById('preferredMovies');
    const trend = document.getElementById('trendingMovies');
    pref.innerHTML = ""; trend.innerHTML = "";
    
    const isAdmin = currentUserEmail === ADMIN_EMAIL;

    movies.forEach((m, idx) => {
        const delBtn = isAdmin ? `<button onclick="event.stopPropagation(); deleteMovie('${m.id}')" class="absolute top-2 right-2 bg-red-600 p-1.5 rounded-full text-white text-xs z-10 hover:bg-red-700 shadow"><i class="fa-solid fa-trash"></i></button>` : '';
        
        const card = `
            <div onclick="window.location.href='detail.html?id=${m.id}'" class="relative w-36 sm:w-44 flex-shrink-0 cursor-pointer snap-start group border border-gray-800 rounded-xl overflow-hidden bg-[#1a1a1a] shadow-lg">
                ${delBtn}
                <div class="h-48 sm:h-64 overflow-hidden">
                    <img src="${m.imageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-90 group-hover:opacity-100">
                </div>
                <div class="p-3">
                    <h3 class="text-xs sm:text-sm font-bold text-white truncate">${m.title}</h3>
                    <p class="text-[10px] sm:text-xs text-gray-500 mt-1">${m.category} • ${m.year}</p>
                </div>
            </div>
        `;

        if (m.isTrending || idx % 2 !== 0) trend.innerHTML += card;
        else pref.innerHTML += card;
    });
}
