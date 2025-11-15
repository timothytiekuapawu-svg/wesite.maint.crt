// --------- CONFIG (replace with your EmailJS keys if you want real sending) ----------
const EMAILJS_PUBLIC_KEY   = 'ad1dHGUf_gonZ5ERG'; // optional
const EMAILJS_SERVICE_ID   = 'service_972cf37';
const EMAILJS_TEMPLATE_ID  = 'template_3epza38';
// ----------------------------------------------------------------------------------

// Initialize EmailJS
if (window.emailjs && EMAILJS_PUBLIC_KEY) {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('EmailJS initialized');
  } catch(e) {
    console.warn('EmailJS init error', e);
  }
}

// Cached DOM
const welcomeScreen = document.getElementById('welcomeScreen');
const bookingArea   = document.getElementById('bookingArea');
const welcomeBtn    = document.getElementById('welcomeBtn');
const backToWelcome = document.getElementById('backToWelcome');

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

const next1 = document.getElementById('next1');
const back1 = document.getElementById('back1');
const toReview = document.getElementById('toReview');
const editBtn = document.getElementById('editBtn');
const confirmBtn = document.getElementById('confirmBtn');

const quickWhats = document.getElementById('quickWhats');

const resultModal = document.getElementById('resultModal');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
const countdownEl = document.getElementById('countdown');
const manualBackBtn = document.getElementById('manualBack');

const sendingEl = document.getElementById('sending');

const welcomeVideo = document.getElementById('welcomeVideo');
const slideshow = document.getElementById('slideshow');

// slideshow elements
const slides = Array.from(document.querySelectorAll('#slideshow .slide'));
let slideIndex = 0;
let slideTimer = null;
if (slides.length > 0) {
  slides.forEach((s,i)=> s.classList.toggle('active', i===0));
  slideTimer = setInterval(()=> {
    slides[slideIndex].classList.remove('active');
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].classList.add('active');
  }, 10000);
}

// Live date/time for welcome
const liveDateTime = document.getElementById('liveDateTime');
function tick(){ if(liveDateTime) liveDateTime.textContent = new Date().toLocaleString(); }
tick(); setInterval(tick,1000);

// Utility: show/hide welcome vs booking
function showWelcome(){
  welcomeScreen.style.display = 'flex';
  bookingArea.classList.remove('active');
  bookingArea.classList.add('hidden');
  bookingArea.setAttribute('aria-hidden','true');

  // show welcome video, hide slideshow
  if (welcomeVideo) welcomeVideo.style.display = 'block';
  if (slideshow) slideshow.style.display = 'none';
}
function showBooking(){
  welcomeScreen.style.display = 'none';
  bookingArea.classList.remove('hidden');
  bookingArea.classList.add('active');
  bookingArea.setAttribute('aria-hidden','false');

  // hide video, show slideshow
  if (welcomeVideo) welcomeVideo.style.display = 'none';
  if (slideshow) slideshow.style.display = 'block';
}

// initial nav: welcome -> booking
welcomeBtn.addEventListener('click', ()=> {
  showBooking();
  activateStep(1);
  window.scrollTo({top:0,behavior:'smooth'});
});

// Back to welcome
backToWelcome.addEventListener('click', ()=> {
  showWelcome();
  activateStep(1);
});

// Step navigation helpers
function activateStep(n){
  step1.classList.remove('active');
  step2.classList.remove('active');
  step3.classList.remove('active');
  if (n === 1) step1.classList.add('active');
  if (n === 2) step2.classList.add('active');
  if (n === 3) step3.classList.add('active');
}

// STEP1 -> STEP2
next1.addEventListener('click', ()=> {
  const name = document.getElementById('user_name').value.trim();
  const phone = document.getElementById('user_phone').value.trim();
  const type = document.getElementById('maintenance_type').value;
  if(!name || !phone || !type){
    alert('Please fill Full Name, Phone and Maintenance Type.');
    return;
  }
  activateStep(2);
  window.scrollTo({top:0,behavior:'smooth'});
});

// STEP2 BACK -> STEP1
back1.addEventListener('click', ()=> {
  activateStep(1);
  window.scrollTo({top:0,behavior:'smooth'});
});

// STEP2 -> Review
toReview.addEventListener('click', ()=> {
  const email = document.getElementById('user_email').value.trim();
  const priority = document.getElementById('audience_level').value;
  const address = document.getElementById('contact_address').value.trim();
  if(!email || !priority || !address){
    alert('Please fill Email, Priority and Contact Address.');
    return;
  }
  const data = {
    user_name: document.getElementById('user_name').value.trim(),
    user_phone: document.getElementById('user_phone').value.trim(),
    maintenance_type: document.getElementById('maintenance_type').value,
    user_email: email,
    audience_level: priority,
    contact_address: address,
    preferred_datetime: document.getElementById('preferred_datetime').value || '',
    message: document.getElementById('message').value.trim() || ''
  };
  sessionStorage.setItem('smartfix_booking', JSON.stringify(data));
  renderReview(data);
  activateStep(3);
  window.scrollTo({top:0,behavior:'smooth'});
});

// render review box
function renderReview(data){
  const reviewBox = document.getElementById('reviewBox');
  reviewBox.innerHTML = `
    <div><strong>Name:</strong> ${escapeHtml(data.user_name)}</div>
    <div><strong>Phone:</strong> ${escapeHtml(data.user_phone)}</div>
    <div><strong>Maintenance Type:</strong> ${escapeHtml(data.maintenance_type)}</div>
    <div><strong>Email:</strong> ${escapeHtml(data.user_email)}</div>
    <div><strong>Priority:</strong> ${escapeHtml(data.audience_level)}</div>
    <div><strong>Preferred Date & Time:</strong> ${escapeHtml(data.preferred_datetime || 'Not specified')}</div>
    <div><strong>Address:</strong> ${escapeHtml(data.contact_address)}</div>
    <div><strong>Description:</strong> ${escapeHtml(data.message || 'No description provided')}</div>
  `;
}

// EDIT -> back to step2
editBtn.addEventListener('click', ()=> {
  activateStep(2);
  // prefill from sessionStorage (if any)
  const raw = sessionStorage.getItem('smartfix_booking');
  if(raw){
    const d = JSON.parse(raw);
    document.getElementById('user_email').value = d.user_email || '';
    document.getElementById('audience_level').value = d.audience_level || '';
    document.getElementById('contact_address').value = d.contact_address || '';
    document.getElementById('preferred_datetime').value = d.preferred_datetime || '';
    document.getElementById('message').value = d.message || '';
  }
  window.scrollTo({top:0,behavior:'smooth'});
});

// Quick WhatsApp (updates as user types) - only useful on step1
['user_name','user_phone','maintenance_type'].forEach(id=>{
  const el = document.getElementById(id);
  if(!el) return;
  el.addEventListener('input', ()=> {
    const name = document.getElementById('user_name').value.trim() || '[name]';
    const phone = document.getElementById('user_phone').value.trim() || '[phone]';
    const type = document.getElementById('maintenance_type').value || 'electrical assistance';
    quickWhats.href = 'https://api.whatsapp.com/send?phone=233543899210&text=' + encodeURIComponent(`Hello SmartFix, my name is ${name} (${phone}). I need ${type}.`);
  });
});

confirmBtn.addEventListener('click', ()=> {
  const raw = sessionStorage.getItem('smartfix_booking');
  if(!raw){ 
    alert('No booking found.'); 
    return; 
  }
  
  const params = JSON.parse(raw);
  sendingEl.style.display = 'inline-block'; // show spinner

  // Send email via EmailJS
  if(window.emailjs && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID){
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        sendingEl.style.display = 'none';
        showResult(true, 'Thanks for booking with SmartFix electricals. We will contact you soon.');
        sessionStorage.removeItem('smartfix_booking');
      })
      .catch((error) => {
        console.error('FAILED...', error);
        sendingEl.style.display = 'none';
        showResult(false, 'There was an error sending your request. Please try again.');
      });
    return;
  }

  // fallback: simulate success if EmailJS not configured
  setTimeout(()=>{
    sendingEl.style.display = 'none';
    showResult(true, 'Thanks for booking with SmartFix electricals. We will contact you soon.');
    sessionStorage.removeItem('smartfix_booking');
  }, 900);
});



let countdownTimer = null;
function showResult(success, message){
  // blur slideshow images (if present)
  document.querySelectorAll('#slideshow .slide').forEach(img => img.style.filter = 'blur(6px)');

  resultTitle.textContent = success ? '✅ Request Sent' : '❌ Submission Failed';
  resultMessage.textContent = message;
  resultModal.classList.add('active');
  resultModal.setAttribute('aria-hidden','false');

  let seconds = 10;
  countdownEl.textContent = seconds;
  countdownTimer = setInterval(()=>{
    seconds--;
    countdownEl.textContent = seconds;
    if(seconds <= 0){
      clearInterval(countdownTimer);
      resetToStart();
    }
  }, 1000);
}

// manual back to home
manualBackBtn.addEventListener('click', ()=> {
  if(countdownTimer) clearInterval(countdownTimer);
  resetToStart();
});

// reset to beginning: hide result, show welcome screen and clear data
function resetToStart(){
  resultModal.classList.remove('active');
  resultModal.setAttribute('aria-hidden','true');
  document.querySelectorAll('#slideshow .slide').forEach(img => img.style.filter = 'none');

  // show welcome again (as you asked to land initially on welcome)
  showWelcome();
  activateStep(1);

  // clear fields
  ['user_name','user_phone','maintenance_type','user_email','audience_level','contact_address','preferred_datetime','message'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  sessionStorage.removeItem('smartfix_booking');
  window.scrollTo({top:0,behavior:'smooth'});
}

// helper
function escapeHtml(s){ if(!s) return ''; return String(s)
  .replaceAll('&','&amp;')
  .replaceAll('<','&lt;')
  .replaceAll('>','&gt;'); }

// initial state
document.addEventListener('DOMContentLoaded', ()=> {
  // show welcome by default
  document.querySelectorAll('.slideshow').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.bg-video').forEach(v => v.style.display = 'block');

  // quickWhats initial href
  quickWhats.href = 'https://api.whatsapp.com/send?phone=233543899210&text=' + encodeURIComponent('Hello SmartFix, I need assistance.');

  // Ensure bookmarkable keyboard-friendly focus
  welcomeBtn.focus();
});
