export class BookDetails {
    _id: string;
    bookId: string;
    title: string;
    description: string;
    publishedDate: string;
    authors: string;
    link: string;
    thumbnail: string;
    status: string;
    estimatedRating: number;
    ratingCount: number;
    userRating: number;

  //  keywords: Keyword[];

    constructor(id: string, _name: string, _description: string, _publishedYear: string, _authors: string, _link: string, _image: string, 
        _estimatedRating : number, _ratingCount:number, _userRating:number)
    {
        this._id = id;
        this.title = _name;
        this.description =_description;
        this.authors = _authors;
        this.publishedDate = _publishedYear;
        this.link = _link;
        this.thumbnail = _image;
        this.estimatedRating = _estimatedRating;
        this.ratingCount = _ratingCount;
        this.userRating = _userRating;
    }

}