let allPeopleData = [];
let currentImages = [];
let currentImageIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

async function init() {
  try {
    const res = await fetch('data/people.json');
    allPeopleData = await res.json();
    showMainPage();
    setupMobileSwipe();
  } catch (error) {
    console.error('خطأ في تحميل البيانات:', error);
  }
}

// عرض القائمة الرئيسية لجميع أفراد العائلة
function showMainPage() {
  const peopleDiv = document.getElementById('people');
  const memoriesDiv = document.getElementById('memories');
  
  memoriesDiv.innerHTML = ''; // إخفاء قسم الذكريات
  peopleDiv.style.display = 'grid'; // إظهار شبكة الأشخاص

  peopleDiv.innerHTML = '';
  allPeopleData.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img src="${p.profile}" alt="${p.name}"><h3>${p.name}</h3>`;
    card.onclick = () => openProfile(p);
    peopleDiv.appendChild(card);
  });
}

// فتح بروفايل الشخص بالكامل في نفس التاب
function openProfile(person) {
  const peopleDiv = document.getElementById('people');
  const memoriesDiv = document.getElementById('memories');

  peopleDiv.style.display = 'none'; // إخفاء قائمة الأشخاص

  // بناء واجهة البروفايل الكاملة
  memoriesDiv.innerHTML = `
    <button class="back-btn" onclick="showMainPage()">⬅ العودة للقائمة الرئيسية</button>
    
    <div class="profile-header">
      <img src="${person.profile}" alt="${person.name}">
      <h2>${person.name}</h2>
    </div>

    <h3 style="text-align:center; margin-top:20px;">معرض الذكريات 📸</h3>
    <div id="memoriesGrid" class="grid"></div>
  `;

  const memoriesGrid = document.getElementById('memoriesGrid');

  person.memories.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card';
    
    const imagesList = m.images || (m.image ? [m.image] : []);
    const imagesArrayJson = JSON.stringify(imagesList).replace(/"/g, '&quot;');
    const coverImage = imagesList.length > 0 ? imagesList[0] : '';

    card.innerHTML = `
      <img src="${coverImage}" alt="${m.title}" onclick="openModal(${imagesArrayJson}, 0)">
      <h3>${m.title}</h3>
      <small>${m.date}</small>
      <p>${m.text}</p>
    `;
    memoriesGrid.appendChild(card);
  });
}

// فتح الصورة بكامل الشاشة
function openModal(imagesList, index = 0) {
  currentImages = imagesList;
  currentImageIndex = index;
  
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.style.display = 'block';
    updateModalImage();
  }
}

function updateModalImage() {
  const fullImg = document.getElementById('fullImage');
  if (fullImg && currentImages.length > 0) {
    fullImg.src = currentImages[currentImageIndex];
  }
}

function changeImage(direction) {
  if (!currentImages || currentImages.length === 0) return;
  currentImageIndex += direction;
  
  if (currentImageIndex >= currentImages.length) {
    currentImageIndex = 0;
  } else if (currentImageIndex < 0) {
    currentImageIndex = currentImages.length - 1;
  }
  updateModalImage();
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  if (modal) modal.style.display = 'none';
}

function setupMobileSwipe() {
  const modalElement = document.getElementById('imageModal');
  if (!modalElement) return;

  modalElement.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  modalElement.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);
}

function handleSwipe() {
  const swipeThreshold = 50;
  if (touchStartX - touchEndX > swipeThreshold) changeImage(1);
  if (touchEndX - touchStartX > swipeThreshold) changeImage(-1);
}

window.addEventListener('keydown', function(e) {
  const modal = document.getElementById('imageModal');
  if (modal && modal.style.display === 'block') {
    if (e.key === 'ArrowRight') changeImage(1);
    if (e.key === 'ArrowLeft') changeImage(-1);
    if (e.key === 'Escape') closeModal();
  }
});

window.onclick = function(e) {
  const modal = document.getElementById('imageModal');
  if (e.target === modal) closeModal();
};

init();