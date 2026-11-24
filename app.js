(()=>{'use strict';
const data=window.PORTFOLIO,byId=new Map(data.images.map(i=>[i.id,i]));
const caseDialog=document.getElementById('case-dialog'),lightbox=document.getElementById('lightbox');
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const image=(item,thumb=false)=>{const n=el('img');n.src=thumb?item.thumb:item.src;n.alt=item.title;n.width=item.width;n.height=item.height;n.loading='lazy';n.decoding='async';return n;};
let activeImages=data.images,activeIndex=0;
function syncLock(){document.body.classList.toggle('modal-open',caseDialog.open||lightbox.open);}
function renderLightbox(){const item=activeImages[activeIndex];const im=document.getElementById('lightbox-image');im.src=item.original;im.alt=item.title;document.getElementById('image-position').textContent=`${activeIndex+1} / ${activeImages.length}`;}
function openImage(item,collection){activeImages=collection;activeIndex=collection.indexOf(item);renderLightbox();lightbox.showModal();syncLock();}
document.getElementById('prev-image').onclick=()=>{activeIndex=(activeIndex-1+activeImages.length)%activeImages.length;renderLightbox();};
document.getElementById('next-image').onclick=()=>{activeIndex=(activeIndex+1)%activeImages.length;renderLightbox();};
lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();document.getElementById('prev-image').click();}if(e.key==='ArrowRight'){e.preventDefault();document.getElementById('next-image').click();}});
const videoCategories = window.PORTFOLIO_VIDEO_CATEGORIES;

function projectVideos(project) {
  return videoCategories.find(category => category.id === project.videoCategory)?.videos ?? [];
}

function appendSummary(target, project) {
  target.replaceChildren();
  project.summary.split(/(AI人模库、场景库和提示词库|约14天缩短至5–7天)/).forEach((part, index) => {
    target.append(index % 2 ? el('strong', '', part) : part);
  });
}

function openCase(project) {
  document.getElementById('case-title').textContent = project.title;
  document.getElementById('case-kicker').textContent = project.kicker;
  appendSummary(document.getElementById('case-summary'), project);
  const notes = document.getElementById('case-notes');
  notes.replaceChildren();
  notes.classList.toggle('four-notes', project.notes.length === 4);
  for (const [title, description] of project.notes) {
    const note = el('div');
    note.append(el('h3', '', title), el('p', '', description));
    notes.append(note);
  }
  const media = document.getElementById('case-images');
  const more = document.getElementById('case-video-link');
  media.replaceChildren();
  media.classList.toggle('case-videos', Boolean(project.videoCategory));
  more.hidden = !project.videoCategory;
  if (project.videoCategory) {
    more.href = '#video/' + project.videoCategory;
    for (const entry of projectVideos(project).slice(0, 6)) {
      media.append(createVideoCard(entry, true));
    }
  } else {
    const collection = project.ids.map(id => byId.get(id));
    for (const item of collection) {
      const figure = el('figure');
      const button = el('button');
      button.type = 'button';
      button.setAttribute('aria-label', '放大作品：' + item.title);
      button.append(image(item));
      button.onclick = () => openImage(item, collection);
      figure.append(button);
      media.append(figure);
    }
  }
  pauseVideos(document);
  caseDialog.showModal();
  caseDialog.scrollTop = 0;
  syncLock();
}

for (const project of data.projects) {
  const article = el('article', 'project');
  let cover;
  if (project.videoCategory) {
    cover = el('div', 'project-cover project-video-cover');
    for (const entry of projectVideos(project).slice(0, 2)) {
      cover.append(createVideoCard(entry, false));
    }
  } else {
    cover = el('button', 'project-cover');
    cover.type = 'button';
    cover.setAttribute('aria-label', '查看专题：' + project.title);
    for (const id of project.covers) cover.append(image(byId.get(id)));
    cover.onclick = () => openCase(project);
  }
  const copy = el('div', 'project-copy');
  const summary = el('p');
  appendSummary(summary, project);
  const button = el('button', 'text-button', '查看创意拆解');
  button.type = 'button';
  button.onclick = () => openCase(project);
  copy.append(el('h3', '', project.title), summary, el('div', 'tags', project.tags), button);
  article.append(cover, copy);
  const destination = project.videoCategory ? 'video-projects' : 'projects';
  document.getElementById(destination).append(article);
}
let currentCategory='全部';const grid=document.getElementById('gallery-grid');
function renderGallery(){const endIds = [78, 79, 83]; const categoryItems = currentCategory === '全部' ? [...data.images.filter(item => !endIds.includes(item.id)), ...endIds.map(id => byId.get(id))] : data.images.filter(item => item.tags.includes(currentCategory)); const items = [...categoryItems.filter(item => item.width === item.height), ...categoryItems.filter(item => item.width !== item.height)];grid.replaceChildren();items.forEach(item=>{const b=el('button','gallery-item');b.type='button';b.setAttribute('aria-label','放大作品：'+item.title);b.append(image(item,true));b.onclick=()=>openImage(item,items);grid.append(b);});document.querySelectorAll('.filters button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===currentCategory)));}
const categories = [
  ['all', '全部作品'], ['electronics', '电子商品'], ['campaigns', '品牌联名'],
  ['seasonal', '大字报'], ['aigc', 'AIGC'], ['other', '其他商品']
];
const mainNav = document.querySelector('header nav');
const homeLink = el('a', '', '首页');
homeLink.href = '#home';
mainNav.prepend(homeLink);
const workNav = el('nav', 'work-nav wrap');
workNav.setAttribute('aria-label', '图片创意子目录');
for (const [route, label] of [['work', '精选专题'], ...categories]) {
  const link = el('a', '', label);
  link.href = route === 'work' ? '#work' : '#work/' + route;
  workNav.append(link);
}
const main = document.querySelector('main');
main.removeAttribute('id');
main.before(workNav);
document.querySelector('.filters').hidden = true;
const panels = {
  home: [...main.querySelectorAll(':scope > section:not([id])')],
  work: [document.getElementById('work')],
  gallery: [document.getElementById('gallery')],
  video: [document.getElementById('video')],
  about: [document.getElementById('about')],
  games: [document.getElementById('games')]
};
const videoNav = document.getElementById('video-nav');
main.before(videoNav);
const videoItems = document.getElementById('video-items');
const videoProjects = document.getElementById('video-projects');
const featuredLink = el('a', '', '精选专题');
featuredLink.href = '#video/featured';
videoNav.append(featuredLink);
for (const category of videoCategories) {
  const link = el('a', '', category.label);
  link.href = '#video/' + category.id;
  videoNav.append(link);
}
let activeVideoCategory;
function pauseVideos(container, except) {
  for (const player of container.querySelectorAll('video')) {
    if (player !== except) player.pause();
  }
}

function createVideoCard(entry, showTitle) {
  const card = el('article', 'video-card');
  const player = el('video');
  player.controls = true;
  player.playsInline = true;
  player.preload = 'metadata';
  player.src = entry.src;
  player.setAttribute('aria-label', entry.title);
  if (entry.poster) player.poster = entry.poster;
  player.addEventListener('play', () => pauseVideos(document, player));
  card.append(player);
  if (showTitle) card.append(el('h3', '', entry.title));
  if (entry.description) card.append(el('p', '', entry.description));
  return card;
}

function showVideos(subpage) {
  const featured = !subpage || subpage === 'featured';
  const category = videoCategories.find(item => item.id === subpage) || videoCategories[0];
  const route = featured ? 'featured' : category.id;
  if (activeVideoCategory === route) return;
  activeVideoCategory = route;
  videoProjects.hidden = !featured;
  videoItems.hidden = featured;
  pauseVideos(videoProjects);
  for (const link of videoNav.querySelectorAll('a')) {
    if (link.hash === '#video/' + route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  pauseVideos(videoItems);
  videoItems.replaceChildren();
  if (featured) return;
  if (!category.videos.length) {
    videoItems.append(el('p', 'video-placeholder', '这个分类暂未添加作品。'));
    return;
  }
  for (const entry of category.videos) {
    videoItems.append(createVideoCard(entry, category.id === 'ai-story' || category.id === 'live'));
  }
}
const backToTop = document.getElementById('back-to-top');
const footer = backToTop.parentElement;
const introStrip = document.querySelector('.intro-strip .wrap');
function showPage() {
  if (caseDialog.open) caseDialog.close();
  const [requestedSection, subpage] = location.hash.slice(1).split('/');
  const section = requestedSection === 'about' && subpage === 'games'
    ? 'games' : requestedSection;
  const category = section === 'gallery' ? categories[0] : categories.find(([route]) => route === subpage);
  const page = section === 'gallery' || (section === 'work' && category)
    ? 'gallery' : (['work', 'video', 'about', 'games'].includes(section) ? section : 'home');
  for (const [name, sections] of Object.entries(panels)) {
    for (const panel of sections) panel.hidden = name !== page;
  }
  workNav.hidden = page !== 'work' && page !== 'gallery';
  videoNav.hidden = page !== 'video';
  (page === 'home' ? introStrip : footer).append(backToTop);
  footer.hidden = page === 'home';
  const activeMain = page === 'gallery' ? '#work' : '#' + page;
  const activeSub = page === 'gallery' ? '#work/' + category[0] : '#work';
  for (const [nav, active] of [[mainNav, activeMain], [workNav, activeSub]]) {
    for (const link of nav.querySelectorAll('a')) {
      if (link.hash === active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  }
  if (page === 'gallery') {
    currentCategory = category[0] === 'all' ? '全部' : category[1];

    renderGallery();
  }
  if (page === 'video') showVideos(subpage);
  else {
    pauseVideos(videoItems);
    pauseVideos(videoProjects);
  }
  if (page !== 'work') pauseVideos(document.getElementById('projects'));
  window.scrollTo({top: 0, behavior: 'instant'});
}
window.addEventListener('hashchange', showPage);
for (const nav of [mainNav, workNav, videoNav]) {
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    link.getAnimations().filter(animation => animation.id === 'nav-press')
      .forEach(animation => animation.cancel());
    link.animate(
      [{transform: 'translateY(2px) scale(.97)'}, {transform: 'none'}],
      {id: 'nav-press', duration: 180, easing: 'ease-out'}
    );
  });
}
showPage();
caseDialog.addEventListener('close', () => pauseVideos(caseDialog));
document.getElementById('case-video-link').addEventListener('click', () => caseDialog.close());
[caseDialog,lightbox].forEach(d=>{d.querySelector('.close').onclick=()=>d.close();d.addEventListener('close',syncLock);d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
})();

 document.getElementById('back-to-top').addEventListener('click', () => window.scrollTo({top: 0}));












