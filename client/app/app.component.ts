import { Component } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'app',
    templateUrl: 'app.component.html'
})

export class AppComponent {
	 book = {
        name: ""
    };

    search(): void {
        this.router.navigate(['/books'], { queryParams: { title: this.book.name }});
    }
}