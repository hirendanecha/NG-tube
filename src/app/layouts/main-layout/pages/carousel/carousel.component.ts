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
import { TokenStorageService } from 'src/app/@shared/services/token-storage.service';

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
      img: 'assets/images/landingpage/NudeGirls-Tube-Square-Logo.png',
    },
  ];
  rightImage: any = [
    {
      img: 'assets/images/landingpage/NudeGirls-Tube-Square-Logo.png',
    },
    {
      img: 'assets/images/landingpage/NudeGirls-Tube-Square-Logo.png',
    },
    {
      img: 'assets/images/landingpage/NudeGirls-Tube-Square-Logo.png',
    },
    {
      img: 'assets/images/landingpage/NudeGirls-Tube-Square-Logo.png',
    },
  ];
  dataList: any = [];
  pagination: any = {
    page: 0,
    limit: 10,
  };

  currentSlideIndex = 0;
  currentImageIndex: number = this.dataList.length - 1;
  profileId: number;

  constructor(
    private customerService: CustomerService,
    private modelService: NgbModal,
    private seoService: SeoService,
    private tokenStorageService: TokenStorageService
  ) {
    this.profileId = +localStorage.getItem('profileId');
    const data = {
      title: 'NudeGirls.tube Carousel',
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

  getPictures(paggination): void {
    const gender = this.tokenStorageService.getUser()?.gender;

    this.customerService
      .getPictures(paggination.page, paggination.limit, this.profileId, gender)
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
