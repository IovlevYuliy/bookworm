$('#search-btn')
    .click(bookSearch);

function bookSearch() {
	var search = $('#search').val();

    let container = $('#book-container').empty();
	$.ajax({
		type: 'GET',
		url: 'https://www.googleapis.com/books/v1/volumes?q=' + search,
		dataType: "json",

		success: function(data) {
            for (let i = 0 ; i < data.items.length; ++i) {
                let book = $('<div>')
                    .attr({
                        'class': 'book-item',
                    });

                let image = $('<img>')
                    .attr({
                        'class': 'book-image',
                        'src': data.items[i].volumeInfo.imageLinks.smallThumbnail,
                    });

                 let divImg = $('<div>')
                    .attr({
                        'class': 'book-image-container',
                    })
                    .height(Math.max(200, image[0].height))
                    .append(image)
                    .appendTo(book);

                let title = $('<span>')
                    .attr({
                        'class': 'book-title',
                    })
                    .text(data.items[i].volumeInfo.title)
                    .appendTo(book);

                container.append(book);
            }
		}
	})
}
