import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubscribeModalComponent } from 'src/app/@shared/modals/subscribe-model/subscribe-modal.component';
import { CustomerService } from 'src/app/@shared/services/customer.service';
import { SeoService } from 'src/app/@shared/services/seo.service';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit {
  @ViewChild('slidesContainer') slidesContainer: ElementRef;
  @ViewChild('btnPrev') btnPrev!: ElementRef;
  @ViewChild('btnNext') btnNext!: ElementRef;

  imgWidth: number = 0;
  isSlideAnimating: boolean = false;
  slides: any = [
    {
      img: 'assets/images/banner/banner-1.png',
    },
    {
      img: 'assets/images/landingpage/OD-default-profile.png',
    },
  ];
  rightImage: any = [
    {
      img: 'assets/images/landingpage/OD-default-profile.png',
    },
    {
      img: 'assets/images/landingpage/OD-default-profile.png',
    },
    {
      img: 'assets/images/landingpage/OD-default-profile.png',
    },
    {
      img: 'assets/images/landingpage/OD-default-profile.png',
    },
  ];
  dataList: any = [];
  pagination: any = {
    page: 0,
    limit: 10,
  };

  currentSlideIndex = 0;
  currentImageIndex: number = this.dataList.length - 1;

  constructor(
    private customerService: CustomerService,
    private modelService: NgbModal,
    private seoService:SeoService
  ) {
    const data = {
      title: 'Organic dating Carousel',
      url: `${location.href}`,
      description: '',
    };
    this.seoService.updateSeoMetaData(data);
  }

  ngOnInit(): void {
    this.currentImageIndex = this.dataList.length;
    this.getPictures(this.pagination);
  }

  prev() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.dataList.length - 1;
    }
  }

  next() {
    if (this.currentImageIndex < this.dataList.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0;
    }
  }
  backFirst() {
    this.currentImageIndex = 0;
  }

  getPictures(paggination) {
    return this.customerService
      .getPictures(paggination.page, paggination.limit)
      .subscribe({
        next: (res: any) => {
          this.dataList = res.data;
        },
        error: (err) => {},
      });
  }

  isFirstSlide(): boolean {
    return this.currentSlideIndex === 0;
  }

  isLastSlide(): boolean {
    const slides = this.slidesContainer?.nativeElement?.children;

    return this.currentSlideIndex === slides?.length - 1;
  }
  subscribeBtn() {
    const modalRef = this.modelService.open(SubscribeModalComponent, {
      centered: true,
    });
    // modalRef.componentInstance.data = this.dataList;
  }
}
