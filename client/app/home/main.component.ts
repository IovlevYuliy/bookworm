import { ViewChild, Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';

 declare var Chart: any;

import { AlertService} from '../_services/index';
@Component({
    moduleId: module.id,
    templateUrl: 'mainUser.html'
})

export class MainComponent {
    book = {
        name: ""
    };

    constructor(
        private router: Router,
        private alertService: AlertService) { }

    search(): void {
        this.router.navigate(['/books'], { queryParams: { title: this.book.name }});
    }

	@ViewChild('chart') chartDOM: ElementRef;

    ngOnInit() {

        let donutCtx = this.chartDOM.nativeElement.getContext('2d');

        var data = {
            labels: ["Хочу прочесть", "Читаю", "Прочитано", "Заброшено"],
            datasets: [{
		            label: 'Количество книг',
		            data: [12, 2, 6, 1],
		            backgroundColor: [
		                'rgba(255, 99, 132, 0.2)',
		                'rgba(54, 162, 235, 0.2)',
		                'rgba(255, 206, 86, 0.2)',
		                'rgba(75, 192, 192, 0.2)'
		            ],
		            borderColor: [
		                'rgba(255,99,132,1)',
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
			            "yAxes": [{
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
