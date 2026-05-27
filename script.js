const API = "https://wajik-anime-api-eight.vercel.app/api/otakudesu";
const PROXY = "https://api.allorigins.win/get?url="; 

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

async function fetchData(url) {
    try {
        const res = await fetch(PROXY + encodeURIComponent(url));
        const json = await res.json();
        return JSON.parse(json.contents);
    } catch (err) {
        console.error("Fetch Error:", err);
        return null;
    }
}

async function fetchRecent() {
    const last = localStorage.getItem('last_watch_title');
    if(last) {
        document.getElementById('historyBar').classList.remove('hidden');
        document.getElementById('lastWatch').innerText = last;
    }
    const grid = document.getElementById('grid');
    grid.innerHTML = '<div class="loader mx-auto mt-20"></div>';
    const data = await fetchData(`${API}/recent`);
    if(data && data.recent) renderGrid(data.recent);
}

function renderGrid(list) {
    const grid = document.getElementById('grid');
    grid.innerHTML = list.map(a => `
        <div class="anime-card group cursor-pointer overflow-hidden rounded-2xl" onclick="fetchDetail('${a.endpoint}')">
            <div class="relative overflow-hidden rounded-2xl">
                <img src="${a.thumb}" class="w-full aspect-[2/3] object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <p class="absolute bottom-3 left-3 text-sm font-bold truncate pr-2">${a.title}</p>
            </div>
        </div>
    `).join('');
}

document.getElementById('searchInput').onkeypress = async (e) => {
    if(e.key === 'Enter') {
        const grid = document.getElementById('grid');
        grid.innerHTML = '<div class="loader mx-auto mt-20"></div>';
        const data = await fetchData(`${API}/search/${e.target.value}`);
        if(data && data.search) renderGrid(data.search);
    }
};

async function fetchDetail(endpoint) {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loader mx-auto mt-20"></div>';
    const data = await fetchData(`${API}/detail/${endpoint}`);
    if(!data) return alert("Gagal mengambil data, coba lagi!");
    
    localStorage.setItem('last_watch_title', data.title);
    
    content.innerHTML = `
        <button onclick="location.reload()" class="mb-6 text-indigo-400 hover:text-white transition">← Kembali</button>
        <h1 class="text-4xl font-bold mb-6">${data.title}</h1>
        <div class="aspect-video w-full max-w-4xl mx-auto glass rounded-2xl p-2 shadow-2xl">
            <iframe id="mainPlayer" src="${data.stream_url}" class="w-full h-full rounded-xl" allowfullscreen></iframe>
        </div>
        <div class="mt-4"><button onclick="document.getElementById('mainPlayer').src+='&t=85s'" class="glass px-4 py-2 rounded-lg text-xs text-yellow-500">Skip Intro 85s</button></div>
        
        <div class="mt-8 flex flex-col gap-6">
            <div><h3 class="text-lg font-bold mb-3 text-emerald-400">Server:</h3><div class="flex flex-wrap gap-2">${data.servers?.map(srv => `<button onclick="playEps('${srv.url}')" class="glass hover:bg-emerald-600 px-4 py-2 rounded-lg text-xs font-bold transition border border-emerald-500/30">Server ${srv.name}</button>`).join('') || ''}</div></div>
            <div><h3 class="text-lg font-bold mb-3 text-indigo-300">Episode:</h3><div class="flex flex-wrap gap-2">${data.episode_list?.map(eps => `<button onclick="playEps('${eps.stream_url}')" class="glass hover:bg-indigo-600 px-4 py-2 rounded-lg text-xs font-bold transition">${eps.title}</button>`).join('') || '<p>No episodes.</p>'}</div></div>
        </div>
        <div class="mt-8 p-6 glass rounded-2xl"><h3 class="font-bold text-indigo-400">Sinopsis</h3><p class="text-gray-400 mt-2">${data.synopsis || 'Tidak ada deskripsi.'}</p></div>
    `;
}

function playEps(url) {
    document.getElementById('mainPlayer').src = url;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

fetchRecent();

