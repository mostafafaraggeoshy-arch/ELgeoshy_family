let currentImages = [];
let currentImageIndex = 0;

let touchStartX = 0;
let touchEndX = 0;

async function init() {
  try {
    const res = await fetch('data/people.json');
    const people = await res.json();
    const peopleDiv = document.getElementById('people');
    
    peopleDiv.innerHTML = '';

    people.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<img src="${p.profile}" alt="${p.name}"><h3>${p.name}</h3>`;
      card.onclick = () => showMemories(p);
      peopleDiv.appendChild(card);
    });

    setupMobileSwipe();
  } catch (error) {
    console.error('خطأ في تحميل الملفات:', error);
  }
}

function showMemories(person) {
  const div = document.getElementById('memories');
  div.innerHTML = '';
  
  const title = document.createElement('h2');
  title.style.gridColumn = '1 / -1';
  title.style.textAlign = 'center';
  title.textContent = `ذكريات ${person.name}`;
  div.appendChild(title);

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
    div.appendChild(card);
  });
}

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
  if (modal) {
    modal.style.display = 'none';
  }
}

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
    changeImage(1);
  }
  if (touchEndX - touchStartX > swipeThreshold) {
    changeImage(-1);
  }
}

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

window.onclick = function(event) {
  const modal = document.getElementById('imageModal');
  if (event.target === modal) {
    closeModal();
  }
};

init();