export class BookDetails {
    _id: string;
    title: string;
    description: string;
    publishedDate: string;
    authors: string;
    link: string;
    thumbnail: string;
    status: string;

  //  keywords: Keyword[];

    constructor(id: string, _name: string, _description: string, _publishedYear: string, _author: string, _link: string, _image: string)
    {
        this._id = id;
        this.title = _name;
        this.description =_description;
        this.publishedDate = _publishedYear;
        this.authors = _author;
        this.link = _link;
        this.thumbnail = _image;
    }
}