const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';

// Елементы
const leftMenu = document.querySelector('.left-menu'),
	hamburger = document.querySelector('.hamburger'),
	tvShowsList = document.querySelector('.tv-shows__list'),
	modal = document.querySelector('.modal'),
	tvShows = document.querySelector('.tv-shows'),
	tvCardImg = document.querySelector('.tv-card__img'),
	modalTitle = document.querySelector('.modal__title'),
	genresList = document.querySelector('.genres-list'),
	rating = document.querySelector('.rating'),
	description = document.querySelector('.description'),
	modalLink = document.querySelector('.modal__link'),
	searchForm = document.querySelector('.search__form'),
	searchFormInput = document.querySelector('.search__form-input');

// Создаём прилоадер
const loading = document.createElement('div');
loading.className = 'loading';

class DBService {
	constructor() {
		this.SERVER = 'https://api.themoviedb.org/3';
		this.API_KEY = 'da16d7185d5dd4192defd37bfaff4184';
	};

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

	getTestCard = () => {
		return this.getData('card.json');
	};

	getSearchResult = query => this.getData(`${this.SERVER}/search/tv?api_key=${this.API_KEY}&language=ru-RU&query=${query}`);

	getTvShow = id => this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`);
};

const renderCard = response => {
	tvShowsList.textContent = '';

	response.results.forEach(item => {
		const {
			backdrop_path: backdrop,
			name: title,
			poster_path: poster,
			vote_average: vote,
			id,
		} = item;

		// Проверка на то, что если нет постера, то мы ставим картинку - Ксожалению постер отсутствует
		const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
		const backdropIMG = backdrop ? IMG_URL + backdrop : ''; // дз если нет backdrop то то ничего не добавляем
		const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : ''; // если нет voteElem то не выводим span tv-card__vote

		const card = document.createElement('li');
		card.className = 'tv-shows__item';
		card.innerHTML = `
			<a href="#" id="${id}" class="tv-card">
				${voteElem}
				<img class="tv-card__img"
					src="${posterIMG}"
					data-backdrop="${backdropIMG}"
					alt="${title}">
				<h4 class="tv-card__head">${title}</h4>
			</a>
		`;

		loading.remove();
		tvShowsList.append(card);
	});
};

searchForm.addEventListener('submit', event => {
	event.preventDefault();
	const value = searchFormInput.value.trim();
	if (value) {
		tvShows.append(loading);
		// Здесь мы создаём новый объект просто не даём ему никакого имени
		new DBService().getSearchResult(value).then(renderCard);
	}
	searchFormInput.value = '';
});

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
	event.preventDefault();

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
		// Создаём новый запрос
		new DBService().getTvShow(card.id)
			.then(({
				poster_path: posterPath,
				name: title, genres,
				vote_average: voteAverage,
				overview,
				homepage}) => {
				tvCardImg.src = IMG_URL + posterPath;
				tvCardImg.alt = title;
				modalTitle.textContent = title;
				// Вариант перебора - 1
				//genresList.innerHTML = data.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, '');
				// Очищаем
				genresList.textContent = '';

				// Вариант перебора - 2
				// for (const item of data.genres) {
				// 	genresList.innerHTML += `<li>${item.name}</li>`;
				// };

				// Вариант перебора - 3
				genres.forEach(item => {
					genresList.innerHTML += `<li>${item.name}</li>`
				});
				rating.textContent = voteAverage;
				description.textContent = overview;
				modalLink.href = homepage;
			})
			// Делаем асинхронную загрузку постера в pop up
			.then(() => {
				document.body.style.overflow = 'hidden';
				modal.classList.remove('hide');
			});

		
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
