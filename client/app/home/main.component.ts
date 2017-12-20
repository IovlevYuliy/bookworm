import { ViewChild, Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { BookDetails } from '../_models/index';
import { BookService, AlertService } from '../_services/index';
 declare var Chart: any;

@Component({
    moduleId: module.id,
    templateUrl: 'mainUser.html'
})

export class MainComponent {
    constructor(private bookService: BookService,
        private route: ActivatedRoute,
        private alertService: AlertService) { }

	@ViewChild('chart') chartDOM: ElementRef;

    ngOnInit() {
		let currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.bookService.getFavouriteBooksStatistics(currentUser.UserId)
		.subscribe(
			data => {
				if (data.length != 0)
				{
					this.drawChart(Array.from(data, (v, k) => v.BooksCount));
				}
			},
			error => {
				this.alertService.error(error);
			});
	} 
	drawChart(userBooksStatistics : Array<Number>) {
		let donutCtx = this.chartDOM.nativeElement.getContext('2d');		
		var data = {
            labels: ["Читаю", "Хочу прочесть", "Прочитано", "Заброшено"],
            datasets: [{
		            label: 'Количество книг',
		            data: userBooksStatistics,
		            backgroundColor: [
		                'rgba(255, 99, 132, 0.2)',
		                'rgba(54, 162, 235, 0.2)',
		                'rgba(255, 206, 86, 0.2)',
		                'rgba(75, 192, 192, 0.2)'
		            ],
		            borderColor: [
		                'rgba(255, 99, 132, 1)',
		                'rgba(54, 162, 235, 1)',
		                'rgba(255, 206, 86, 1)',
		                'rgba(75, 192, 192, 1)'
		            ],
		            borderWidth: 1
		        }]
        };

        var chart = new Chart(
            donutCtx,
            {
    			"type": 'horizontalBar',
		    	"data": data,
		    
			    "options": {
				"maintainAspectRatio": false,
			        "scales": {
						"xAxes": [{
			                "ticks": {
			                    "beginAtZero":true
			                }
						}]
			        }
			    }
            }
        );
	}
}
