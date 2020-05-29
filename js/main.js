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
	searchFormInput = document.querySelector('.search__form-input'),
	preloader = document.querySelector('.preloader'),
	dropdown = document.querySelectorAll('.dropdown'),
	tvShowsHead = document.querySelector('.tv-shows__head'),
	posterWrapper = document.querySelector('.poster__wrapper'),
	modalContent = document.querySelector('.modal__content'),
	pagination = document.querySelector('.pagination');

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

	getSearchResult = query => {
		this.temp = `${this.SERVER}/search/tv?api_key=${this.API_KEY}&language=ru-RU&query=${query}`;
		return this.getData(this.temp);
	};

	getNextPage = page => {
		return this.getData(this.temp + '&page=' + page);
	};

	getTvShow = id => this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`);

	getTopRate = () => this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=ru-RU`);

	getPopular = () => this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=ru-RU`);

	getToday = () => this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=ru-RU`);

	getWeek = () => this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RU`);
};

const dbService = new DBService();

const renderCard = (response, target) => {
	tvShowsList.textContent = '';

	console.log(response);

	if (!response.total_results) {
		loading.remove();
		tvShowsHead.textContent = 'К сожалению по вашему запросу ничего не найдено...';
		tvShowsHead.style.color = 'red';
		return;
	}

	// При клике на разделы меню(сегодня, на неделю, топ сеоиалы) так же подписывается h3 - tv-shows__head
	tvShowsHead.textContent = target ? target.textContent : 'Результат поиска:';
	tvShowsHead.style.color = 'green';

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

	pagination.textContent = '';

	if (/*!target &&*/ response.total_pages > 1) {
		for (let i = 1; i <= response.total_pages; i++) {
			pagination.innerHTML += `<li><a class="pages" href="#">${i}</a></li>`;
		}
	}
};

searchForm.addEventListener('submit', event => {
	event.preventDefault();
	const value = searchFormInput.value.trim();

	if (value) {
		tvShows.append(loading);
		// Здесь мы создаём новый объект просто не даём ему никакого имени
		dbService.getSearchResult(value).then(renderCard);
	};

	searchFormInput.value = '';
});

// Открытие, закрытие меню
const closeDropdown = () => {
	dropdown.forEach(item => {
		item.classList.remove('active');
	});
};

hamburger.addEventListener('click', () => {
	leftMenu.classList.toggle('openMenu');
	hamburger.classList.toggle('open');
	closeDropdown();
});

// Закрытие меню при клике на любой эелемент страницы кроме меню
document.addEventListener('click', event => {
	const target = event.target;

	if (!target.closest('.left-menu')) {
		leftMenu.classList.remove('openMenu');
		hamburger.classList.remove('open');
		closeDropdown();
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

	if (target.closest('#top-rated')) {
		tvShows.append(loading);
		dbService.getTopRate().then((response) => renderCard(response, target));
	};

	if (target.closest('#popular')) {
		tvShows.append(loading);
		dbService.getPopular().then((response) => renderCard(response, target));
	};

	if (target.closest('#week')) {
		tvShows.append(loading);
		dbService.getWeek().then((response) => renderCard(response, target));
	};

	if (target.closest('#today')) {
		tvShows.append(loading);
		dbService.getToday().then((response) => renderCard(response, target));
	};

	if (target.closest('#search')) {
		tvShowsList.textContent = '';
		tvShowsHead.textContent = '';
	}
});

// Открытие модального окна
tvShowsList.addEventListener('click', event => {

	event.preventDefault();

	const target = event.target;
	const card = target.closest('.tv-card');

	if (card) {
		// Включаем прилоадер в тот момент когда мы определились что щёкнули по карточке , до того как мы делаем запрос new DBService().getTvShow(card.id)
		preloader.style.display = 'block';

		// Создаём новый запрос
		dbService.getTvShow(card.id)
			.then(({
				poster_path: posterPath,
				name: title, genres,
				vote_average: voteAverage,
				overview,
				homepage}) => {

					if (posterPath) {
						tvCardImg.src = IMG_URL + posterPath;
						tvCardImg.alt = title;
						posterWrapper.style.display = '';
						modalContent.style.paddingLeft = '';
					} else {
						posterWrapper.style.display = 'none';
						modalContent.style.paddingLeft = '25px';
					};

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
			})
			// Скрывем прилоадер
			.then(() => {
				preloader.style.display = '';
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

pagination.addEventListener('click', event => {
	event.preventDefault();
	const target = event.target;

	if (target.classList.contains('pages')) {
		tvShows.append(loading);
		dbService.getNextPage(target.textContent).then(renderCard);
	}
});