const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = 'da16d7185d5dd4192defd37bfaff4184';

// Елементы
const leftMenu = document.querySelector('.left-menu'),
	hamburger = document.querySelector('.hamburger'),
	tvShowsList = document.querySelector('.tv-shows__list'),
	modal = document.querySelector('.modal');

class DBService {
	getData = async (url) => {
		const res = await fetch(url);
		if (res.ok) {
			return res.json();
		} else {
			throw new Error(`Не удалось получить данные по адресу ${url}`);
		};
	};

	// Метод который делает запрос к нашему test.json, чтоб мы сразу могли проверять, что мы получаем
	getTestData = () => {
		return this.getData('test.json');
	};
};

const renderCard = response => {
	console.log(response);
	tvShowsList.textContent = '';

	response.results.forEach(item => {
		const {
			backdrop_path: backdrop,
			name: title,
			poster_path: poster,
			vote_average: vote,
		} = item;

		// Проверка на то, что если нет постера
		const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
		const backdropIMG = ''; // дз если нет backdrop то то ничего не добавляем
		const voteElem = ''; // если нет voteElem то не выводим span tv-card__vote

		const card = document.createElement('li');
		card.className = 'tv-shows__item';
		card.innerHTML = `
			<a href="#" class="tv-card">
				<span class="tv-card__vote">${vote}</span>
				<img class="tv-card__img"
					src="${posterIMG}"
					data-backdrop="${IMG_URL + backdrop}"
					alt="${title}">
				<h4 class="tv-card__head">${title}</h4>
			</a>
		`;

		tvShowsList.append(card);
	});
};

// Здесь мы создаём новый объект просто не даём ему никакого имени
new DBService().getTestData().then(renderCard);

// Открытие закрытие меню
hamburger.addEventListener('click', () => {
	leftMenu.classList.toggle('openMenu');
	hamburger.classList.toggle('open');
});

// Закрытие меню при клике на любой эелемент страницы кроме меню
document.addEventListener('click', event => {
	const target = event.target;

	if (!target.closest('.left-menu')) {
		leftMenu.classList.remove('openMenu');
		hamburger.classList.remove('open');
	};

});

leftMenu.addEventListener('click', event => {
	const target = event.target;
	const dropDown = target.closest('.dropdown');

	if (dropDown) {
		dropDown.classList.toggle('active');
		leftMenu.classList.add('openMenu');
		hamburger.classList.add('open');
	};

});

// Открытие модального окна
tvShowsList.addEventListener('click', event => {

	event.preventDefault();

	const target = event.target;
	const card = target.closest('.tv-card');

	if (card) {
		document.body.style.overflow = 'hidden';
		modal.classList.remove('hide');
	};
});

// Закрытие модального окна
modal.addEventListener('click', event => {

	// здесь происходит закрытие модального окна либо при нажатии на крестик ('.cross') или при нажатии мимо крестика или модального окна
	if (event.target.closest('.cross') ||
		event.target.classList.contains('modal')) { // ('modal') пишем без точки т.к. работаем с classList , это означает , что мы работаем со всеми классами
		document.body.style.overflow = '';
		modal.classList.add('hide');
	};

});

// Смена карточки
const changeImage = event => {
	const card = event.target.closest('.tv-shows__item');

	if (card) {
		const img = card.querySelector('.tv-card__img');
		
		if (img.dataset.backdrop) {
			// Здесь смена картинок сделана с помощью деструкторизации
			[img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
		};
	};

};

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);
