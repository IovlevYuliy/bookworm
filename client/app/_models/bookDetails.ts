export class BookDetails {
    _id: string;
    name: string;
    description: string;
    publishedYear: string;
    author: string;
    link: string;
    image: string;
    status: string;
    EstimatedRating: string;
    RatingCount: string;
    UserRating: string;

  //  keywords: Keyword[];

    constructor(id: string, _name: string, _description: string, _publishedYear: string, _author: string, _link: string, _image: string)
    {
        this._id = id;
        this.name = _name;
        this.description =_description;
        this.publishedYear = _publishedYear;
        this.author = _author;
        this.link = _link;
        this.image = _image;
    }
}