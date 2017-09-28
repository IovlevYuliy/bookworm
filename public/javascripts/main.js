$('#search-btn')
    .click(bookSearch);

function bookSearch() {
	var search = $('#search').val();
	var results = $('#results');

	$.ajax({
		type: 'GET',
		url: 'https://www.googleapis.com/books/v1/volumes?q=' + search,
		dataType: "json",

		success: function(data) {
            let container = $('#book-container');
            for (let i = 0 ; i < data.items.length; ++i) {
                let book = $('<div>')
                    .attr({
                        'class': 'book-item',
                    });

                let title = $('<span>')
                    .text(data.items[i].volumeInfo.title)
                    .appendTo(book);

                let image = $('<img>')
                    .attr({
                        'class': 'book-image',
                        'src': data.items[i].volumeInfo.imageLinks.smallThumbnail,
                    })
                    .appendTo(book);
                container.append(book);
            }
		}
	})
}
