let currentImages = []; // مصفوفة الصور للذكرى المفتوحة حالياً
let currentImageIndex = 0; // مؤشر الصورة الحالية

// متغيرات لتتبع اللمس على الهاتف
let touchStartX = 0;
let touchEndX = 0;

async function init() {
  try {
    const res = await fetch('data/people.json');
    const people = await res.json();
    const peopleDiv = document.getElementById('people');
    
    // تفريغ قسم الأشخاص قبل إضافة الكروت
    peopleDiv.innerHTML = '';

    people.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<img src="${p.profile}" alt="${p.name}"><h3>${p.name}</h3>`;
      card.onclick = () => showMemories(p);
      peopleDiv.appendChild(card);
    });

    // تفعيل السحب باللمس للموبايل بعد تأكد وجود الصفحة
    setupMobileSwipe();
  } catch (error) {
    console.error('حدث خطأ أثناء تحميل البيانات:', error);
  }
}

function showMemories(person) {
  const div = document.getElementById('memories');
  div.innerHTML = '';
  
  const title = document.createElement('h2');
  title.style.gridColumn = '1 / -1';
  title.textContent = `ذكريات ${person.name}`;
  div.appendChild(title);

  person.memories.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card';
    
    // دعم مصفوفة الصور أو الصورة المنفردة
    const imagesList = m.images || (m.image ? [m.image] : []);
    const imagesArrayJson = JSON.stringify(imagesList).replace(/"/g, '&quot;');
    const coverImage = imagesList.length > 0 ? imagesList[0] : '';

    card.innerHTML = `
      <img src="${coverImage}" alt="${m.title}" onclick="openModal(${imagesArrayJson}, 0)">
      <h3>${m.title}</h3>
      <small>${m.date}</small>
      <p>${m.text}</p>
    `;
    div.appendChild(card);
  });
}

// دالة فتح نافذة الصور
function openModal(imagesList, index = 0) {
  currentImages = imagesList;
  currentImageIndex = index;
  
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.style.display = 'block';
    updateModalImage();
  }
}

// دالة تحديث الصورة المعروضة
function updateModalImage() {
  const fullImg = document.getElementById('fullImage');
  if (fullImg && currentImages.length > 0) {
    fullImg.src = currentImages[currentImageIndex];
  }
}

// دالة التنقل بين الصور
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

// دالة إغلاق النافذة
function closeModal() {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// إعداد أحداث اللمس للموبايل بآمان
function setupMobileSwipe() {
  const modalElement = document.getElementById('imageModal');
  if (!modalElement) return;

  modalElement.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
  }, false);

  modalElement.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
  }, false);
}

function handleSwipe() {
  const swipeThreshold = 50;
  
  if (touchStartX - touchEndX > swipeThreshold) {
    changeImage(1); // سحب لليسار -> الصورة التالية
  }
  if (touchEndX - touchStartX > swipeThreshold) {
    changeImage(-1); // سحب لليمين -> الصورة السابقة
  }
}

// التحكم عبر الكيبورد (للكمبيوتر)
window.addEventListener('keydown', function(event) {
  const modal = document.getElementById('imageModal');
  if (modal && modal.style.display === 'block') {
    if (event.key === 'ArrowRight') {
      changeImage(1);
    } else if (event.key === 'ArrowLeft') {
      changeImage(-1);
    } else if (event.key === 'Escape') {
      closeModal();
    }
  }
});

// إغلاق النافذة عند الضغط خارج الصورة
window.onclick = function(event) {
  const modal = document.getElementById('imageModal');
  if (event.target === modal) {
    closeModal();
  }
};

// بدء التشغيل
init();