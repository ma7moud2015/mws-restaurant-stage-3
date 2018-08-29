let dbpromise;
export default class DBHelper {
	static get DATABASE_URL() {
		return `http://localhost:${1337}/restaurants`
	}
	static get DATABASE_REVIEWS_URL() {
		return `http://localhost:${1337}/reviews`
	}
	static openDataBase() {
		return idb.open('restaurantsReviews', 2, function (a) {
			switch (a.oldVersion) {
				case 0:
					a.createObjectStore('restaurants', {
						keyPath: 'id'
					});
				case 1:
					{
						const b = a.createObjectStore('reviews', {
							keyPath: 'id'
						});b.createIndex('restaurant', 'restaurant_id')
					}
			}
		})
	}
	static fetchRestaurants() {
		return this.openDataBase().then(a => {
			const b = a.transaction('restaurants'),
				c = b.objectStore('restaurants');
			return c.getAll()
		}).then(a => {
			return 0 === a.length ? this.fetchAndCacheRestaurants() : Promise.resolve(a)
		})
	}
	static fetchRestaurantById(a) {
		return DBHelper.fetchRestaurants().then(b => b.find(c => c.id === a))
	}
	static fetchRestaurantByCuisine(a) {
		return DBHelper.fetchRestaurants().then(b => b.filter(c => c.cuisine_type === a))
	}
	static fetchRestaurantByNeighborhood(a) {
		return DBHelper.fetchRestaurants().then(b => b.filter(c => c.neighborhood === a))
	}
	static fetchAndCacheRestaurants() {
		return fetch(DBHelper.DATABASE_URL).then(a => a.json()).then(a => {
			return this.openDataBase().then(b => {
				const c = b.transaction('restaurants', 'readwrite'),
					d = c.objectStore('restaurants');
				return a.forEach(e => d.put(e)), c.complete.then(() => Promise.resolve(a))
			})
		})
	}
	static fetchRestaurantByCuisineAndNeighborhood(a, b) {
		return DBHelper.fetchRestaurants().then(c => {
			let d = c;
			return 'all' !== a && (d = d.filter(e => e.cuisine_type == a)), 'all' !== b && (d = d.filter(e => e.neighborhood == b)), d
		})
	}
	static fetchNeighborhoods() {
		return DBHelper.fetchRestaurants().then(a => {
			const b = a.map((d, e) => a[e].neighborhood),
				c = b.filter((d, e) => b.indexOf(d) == e);
			return c
		})
	}
	static fetchCuisines() {
		return DBHelper.fetchRestaurants().then(b => {
			const c = b.map((e, f) => b[f].cuisine_type),
				d = c.filter((e, f) => c.indexOf(e) == f);
			return d
		})
	}
	static urlForRestaurant(a) {
		return `./restaurant.html?id=${a.id}`
	}
	static imageUrlForRestaurant(a) {
		return `img/${a.id}` + '.jpg'
	}
	static mapMarkerForRestaurant(a) {
		const c = new L.marker([a.latlng.lat, a.latlng.lng], {
			title: a.name,
			alt: a.name,
			url: DBHelper.urlForRestaurant(a)
		});
		return c.addTo(newMap), c
	}
	static updateFav(a, b) {
		console.log('changing status to: ', b);var z = [a, b];if (!navigator.onLine) return void DBHelper.sendDataWhenOnline2(z);
		fetch(`http://localhost:1337/restaurants/${a}/?is_favorite=${b}`, {
			method: 'PUT',
			mode: 'cors'
		}).then(() => {
			console.log('changed fav status succesfukky'), this.openDataBase().then(c => {
				const d = c.transaction('restaurants', 'readwrite'),
					e = d.objectStore('restaurants');
				e.get(a).then(f => {
					f.is_favorite = b, e.put(f)
				})
			})
		})
	}
	static storeIndexedDB(a, b) {
		this.dbPromise.then(function (c) {
			if (c) {
				let d = c.transaction(a, 'readwrite');
				const e = d.objectStore(a);
				Array.isArray(b) ? b.forEach(function (f) {
					e.put(f)
				}) : e.put(b)
			}
		})
	}
	static getStoredObjectById(a, b, c) {
		return this.openDataBase().then(function (d) {
			if (d) {
				const e = d.transaction(a).objectStore(a),
					f = e.index(b);
				return f.getAll(c)
			}
		})
	}
	static fetchReviewsByRestId(a) {
		return fetch(`${DBHelper.DATABASE_REVIEWS_URL}/?restaurant_id=${a}`).then(b => b.json()).then(b => {
			return this.openDataBase().then(c => {
				if (c) {
					let d = c.transaction('reviews', 'readwrite');
					const e = d.objectStore('reviews');
					Array.isArray(b) ? b.forEach(function (f) {
						e.put(f)
					}) : e.put(b)
				}
			}), console.log('revs are: ', b), Promise.resolve(b)
		}).catch(() => {
			return DBHelper.getStoredObjectById('reviews', 'restaurant', a).then(c => {
				return console.log('looking for offline stored reviews'), Promise.resolve(c)
			})
		})
	}
	static fetchReviews(a) {
		return this.openDataBase().then(b => {
			const c = b.transaction('reviews'),
				d = c.objectStore('reviews');
			return console.log('all are: ', d.getAll()), d.getAll()
		}).then(b => {
			return 0 === b.length ? this.fetchAndCacheReviews(a) : (console.log('before resolve: ', b), Promise.resolve(b))
		})
	}
	static fetchAndCacheReviews(a) {
		return console.log('id is', a), fetch(`${DBHelper.DATABASE_REVIEWS_URL}/?restaurant_id=${a}`).then(b => b.json()).then(b => {
			return console.log('all rev are', b), this.openDataBase().then(c => {
				const d = c.transaction('reviews', 'readwrite'),
					e = d.objectStore('reviews');
				return b.forEach(f => e.put(f)), d.complete.then(() => Promise.resolve(b))
			})
		})
	}
	static fetchReviewsByRestaurantId(a) {
		return this.fetchReviews(a).then(b => {
			return this.dbPromise().then(c => {
				const d = c.transaction('reviews'),
					e = d.objectStore('reviews'),
					f = e.index('restaurant');
				return f.getAll(a)
			}).then(() => {
				const d = b.filter(e => e.restaurant_id === a);
				return console.log('by id revs are: ', d), d
			})
		})
	}
	static addReview(a) {
		let b = {
			name: 'addReview',
			data: a,
			object_type: 'review'
		};
		if (!navigator.onLine && 'addReview' === b.name) return void DBHelper.sendDataWhenOnline(b);
		let c = {
			name: a.name,
			rating: parseInt(a.rating),
			comments: a.comments,
			restaurant_id: parseInt(a.restaurant_id)
		};
		console.log('Sending review: ', c);
		var d = {
			method: 'POST',
			body: JSON.stringify(c),
			headers: new Headers({
				'Content-Type': 'application/json'
			})
		};
		fetch(`http://localhost:1337/reviews`, d).then(e => {
			const f = e.headers.get('content-type');
			return f && -1 !== f.indexOf('application/json') ? e.json() : 'API call successfull'
		}).then(() => {
			console.log(`Fetch successful!`)
		}).catch(e => console.log('error:', e))
	}
	static sendDataWhenOnline2(w) {
	localStorage.setItem('data', w);

	window.addEventListener('online', (event) => {
		let data = localStorage.getItem('data');

		if (data !== null) {
			DBHelper.updateFav(w[0], w[1]);
		}
	});
}
	static sendDataWhenOnline(a) {
		console.log('Offline OBJ', a), localStorage.setItem('data', JSON.stringify(a.data)), console.log(`Local Storage: ${a.object_type} stored`), window.addEventListener('online', () => {
			console.log('Browser: Online again!');
			let c = JSON.parse(localStorage.getItem('data'));
			console.log('updating and cleaning ui'), [...document.querySelectorAll('.reviews_offline')].forEach(d => {
				d.classList.remove('reviews_offline'), d.querySelector('.offline_label').remove()
			}), null !== c && (console.log(c), 'addReview' === a.name && DBHelper.addReview(a.data), console.log('LocalState: data sent to api'), localStorage.removeItem('data'), console.log(`Local Storage: ${a.object_type} removed`))
		})
	}
}
window.DBHelper = DBHelper;
