import { Component, OnInit } from '@angular/core';
import { SeoService } from 'src/app/@shared/services/seo.service';

@Component({
  selector: 'app-find-connections',
  templateUrl: './find-connections.component.html',
  styleUrls: ['./find-connections.component.scss'],
})
export class ConnectionsComponent implements OnInit {
  
  constructor(
    private seoService:SeoService
  ) {
    const data = {
      title: 'Organic dating Connections',
      url: `${location.href}`,
      description: '',
    };
    this.seoService.updateSeoMetaData(data);
  }
  

  ngOnInit(): void {}
}
