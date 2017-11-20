export class BookDetails {
    _id: string;
    name: string;
    description: string;
    publishedYear: string;
    author: string;

    constructor(id: string, _name: string, _description: string, _publishedYear: string, _author: string)
    {
        this._id = id;
        this.name = _name;
        this.description =_description;
        this.publishedYear = _publishedYear;
        this.author = _author;
    }
}