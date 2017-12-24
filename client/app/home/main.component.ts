import { ViewChild, Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { BookDetails } from '../_models/index';
import { BookService, AlertService } from '../_services/index';
import { SendDataService } from '../_services/data.service';
import { Router } from '@angular/router';
 declare var Chart: any;

@Component({
    moduleId: module.id,
    templateUrl: 'mainUser.html'
})

export class MainComponent {
    constructor(private bookService: BookService,
    	private router: Router,
		private route: ActivatedRoute,
        private alertService: AlertService,
        private _SendDataService: SendDataService) { }

	currentUser: any;
	@ViewChild('chart') chartDOM: ElementRef;
	// private fragment: string;
    ngOnInit() {
		// this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
		if (this.currentUser)
		{
			this.bookService.getFavouriteBooksStatistics(this.currentUser.UserId)
			.subscribe(
				data => {
					if (data.length != 0)
					{
						this.drawChart([data[0].readNow, data[0].wantToRead, data[0].alreadyRead, data[0].gaveUp]);
					}
					else{
						this.drawChart([0,0,0,0]);
					}
				},
				error => {
					this.alertService.error(error);
				});
		}
	} 

	ngAfterViewInit(): void {
		// try {
		//   document.querySelector('#' + this.fragment).scrollIntoView();
		// } catch (e) { }
	  }
	scrollTo(place:string) {
		document.querySelector('#'+place).scrollIntoView();
		
	}

	getRandomBook(){
		this.bookService.getRandomBook()
            .subscribe(
                data => {
                    console.log('getbookresult', data);
                    this._SendDataService.setData(data);
                    this.router.navigate(['/bookDetails']);
                },
                error => {
                    this.alertService.error(error);
                    console.log(error);
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
					"onClick": function(event:any, elem:any) {
						var elem = elem[0];
						if (!elem) return; // check and return if not clicked on bar/data
						
						var type = '';
						if(elem._index === 0) {
							type = '4BA77A47-7A4A-40D4-9643-DB856125F6B2';
						}
						if(elem._index === 1) {
							type = '9B86AD37-88ED-4CE7-9029-1030A42719F8';
						}
						if(elem._index === 2) {
							type='8CBB414C-ED49-414B-8631-3DF4F92CD9C9';
						}
						if(elem._index === 3) {
							type='407FBC8A-9AB4-4DB4-9D9C-4D71B926593C';
						}
						var uri = this.canvas.baseURI + 'favouriteBooks/' + type;
						location.href = uri;
					},
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
