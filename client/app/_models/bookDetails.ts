export class BookDetails {
    _id: string;
    name: string;
    description: string;
    publishedYear: string;
    authors: string;
    link: string;
    image: string;
    status: string;
    estimatedRating: string;
    ratingCount: string;
    userRating: string;

  //  keywords: Keyword[];

    constructor(id: string, _name: string, _description: string, _publishedYear: string, _authors: string, _link: string, _image: string)
    {
        this._id = id;
        this.name = _name;
        this.description =_description;
        this.publishedYear = _publishedYear;
        this.authors = _authors;
        this.link = _link;
        this.image = _image;
    }
}