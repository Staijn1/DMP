import {Component, OnInit} from '@angular/core';
import {HubService} from '../../services/hub/hub.service';

@Component({
  selector: 'app-hub-page',
  templateUrl: './hub-page.component.html',
  styleUrls: ['./hub-page.component.scss'],
})
export class HubPageComponent implements OnInit {
  hubItems: any[] = [];

  constructor(private readonly hubService: HubService) {
  }

  ngOnInit(): void {
    this.hubService.queryItems().then(r => {
      this.hubItems = r.results
      console.log(this.hubItems[0].toJSON())
    });
  }
}
