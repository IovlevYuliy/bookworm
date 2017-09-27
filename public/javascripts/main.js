function bookSearch() {
	var search = document.getElementById('search').value;
	var results = document.getElementById('results');

	$.ajax({
		type: 'GET',
		url: 'https://www.googleapis.com/books/v1/volumes?q=' + search,
		dataType: json,

		success: function(data) {
			results.innerHTML = data;
		}
	})
}
document.getElementById('search-btn').addEventListener('click', bookSearch, false);
