import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, fromEvent } from 'rxjs';
import { CustomerService } from 'src/app/@shared/services/customer.service';
import { SharedService } from 'src/app/@shared/services/shared.service';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { TokenStorageService } from 'src/app/@shared/services/token-storage.service';
import { UploadFilesService } from 'src/app/@shared/services/upload-files.service';

@Component({
  selector: 'app-on-boarding',
  templateUrl: './on-boarding.component.html',
  styleUrls: ['./on-boarding.component.scss'],
})
export class OnBoardingComponent implements OnInit {
  currentStep: number = 0;
  steps = [
    'Tell Us Your Location',
    'Add a photo',
    'Vaccine status',
    'Do You Have Children',
    `What's Your Highest Level of Education?`,
    `What's Your Ethnicity?`,
    `What's Your Height?`,
    `What's Your Religion?`,
    'Do You Smoke?',
    'What type of relationship are you looking for?',
  ];
  childOptions = [
    'No',
    'Yes, at home with me',
    "Yes, but they don't live with me",
  ];
  smokeOptions = ['No', 'Yes'];
  religions: string[] = [
    'Agnostic',
    'Atheist',
    'Buddist',
    'Christian',
    'Christian - Catholic',
    'Hindu',
    'Jewish',
    'Muslim',
    'Other',
    'Sikh',
    'Spiritual',
  ];
  ethnicities = [
    'White / Caucasian',
    'Black / African Descent',
    'East Asian',
    'Hispanic / Latinx',
    'Middle Eastern',
    'Mixed',
    'Other',
    'South Asian',
  ];
  studyOptions = [
    'No degree',
    'High school graduate',
    'Attended college',
    'College graduate',
    'Advanced degree',
  ];

  relationshipOptions = [
    'Friendship',
    'Short term dating',
    'Long term dating',
    'Casual dating',
    `Don't know yet`,
    'Other',
  ];
  defaultCountry = 'US';
  feetOptions: number[] = [];
  inchOptions: number[] = [];
  allCountryData: any;
  @ViewChild('zipCode') zipCode: ElementRef;
  profilePic: string;
  profileImg: any = {
    file: null,
    url: '',
  };
  whatImCovid: string = '';
  whatImFlu: string = '';
  statusofChild: string = '';
  statusofStudy: string = '';
  statusofEthnicity: string = '';
  statusofReligion: string = '';
  statusofSmoke: string = '';
  selectedRelationOptions: string[] = [];
  userId: number;
  profileId: number;

  onBoardingForm = new FormGroup({
    userId: new FormControl(null),
    userName: new FormControl(''),
    isVaccinated: new FormControl('', [Validators.required]),
    isFluShot: new FormControl('', [Validators.required]),
    haveChild: new FormControl('', [Validators.required]),
    education: new FormControl('', [Validators.required]),
    ethnicity: new FormControl('', [Validators.required]),
    religion: new FormControl('', [Validators.required]),
    isSmoke: new FormControl('', [Validators.required]),
    relationshipType: new FormControl('', [Validators.required]),
    height: new FormControl('', [Validators.required]),
    country: new FormControl('US', [Validators.required]),
    zip: new FormControl({ value: '', disabled: true }, [Validators.required]),
    city: new FormControl({ value: '', disabled: true }, [Validators.required]),
    imageUrl: new FormControl('', [Validators.required]),
  });

  constructor(
    private spinner: NgxSpinnerService,
    private customerService: CustomerService,
    private toastService: ToastService,
    private uploadService: UploadFilesService,
    private router: Router,
    private route: ActivatedRoute,
    private tokenStorageService: TokenStorageService,
    private sharedService: SharedService
  ) {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      this.tokenStorageService.saveToken(token);
    });
  }

  ngOnInit(): void {
    this.getAllCountries();
  }

  ngAfterViewInit(): void {
    // fromEvent(this.zipCode.nativeElement, 'input')
    //   .pipe(debounceTime(1000))
    //   .subscribe((event) => {
    //     const val = event['target'].value;
    //     if (val.length > 3) {
    //       this.onZipChange(val);
    //     }
    //   });
  }

  getImageName(step: string): string {
    switch (step) {
      case 'Tell Us Your Location':
        return 'location.png';
      case 'Add a photo':
        return 'photo.png';
      case 'Vaccine status':
        return 'vaccine.png';
      case 'Do You Have Children':
        return 'children.png';
      case `What's Your Highest Level of Education?`:
        return 'education.png';
      case `What's Your Ethnicity?`:
        return 'ethnicity.png';
      case `What's Your Height?`:
        return 'height.png';
      case `What's Your Religion?`:
        return 'religion.png';
      case 'Do You Smoke?':
        return 'smoke.png';
      case 'What type of relationship are you looking for?':
        return 'relationship.png';
      default:
        return 'default.png';
    }
  }

  goToStep(index: number): void {
    this.currentStep = index;
  }

  validateAndNextStep(): void {
    const validations = [
      {
        step: 0,
        condition:
          this.onBoardingForm.get('zip').valid ||
          this.onBoardingForm.get('city').valid,
        errorMessage: 'Please fill in ZIP or city',
      },
      {
        step: 1,
        condition: !!this.profileImg.file,
        errorMessage: 'Please select an image',
      },
      {
        step: 2,
        condition:
          this.onBoardingForm.get('isFluShot').valid &&
          this.onBoardingForm.get('isVaccinated').valid,
        errorMessage: 'Please select options',
      },
      {
        step: 3,
        condition: this.onBoardingForm.get('haveChild').valid,
        errorMessage: 'Please select an option',
      },
      {
        step: 4,
        condition: this.onBoardingForm.get('education').valid,
        errorMessage: 'Please select an option',
      },
      {
        step: 5,
        condition: this.onBoardingForm.get('ethnicity').valid,
        errorMessage: 'Please select an option',
      },
      {
        step: 6,
        condition: this.onBoardingForm.get('height').valid,
        errorMessage: 'Please select an option',
      },
      {
        step: 7,
        condition: this.onBoardingForm.get('religion').valid,
        errorMessage: 'Please select an option',
      },
      {
        step: 8,
        condition: this.onBoardingForm.get('isSmoke').valid,
        errorMessage: 'Please select an option',
      },
      {
        step: 9,
        condition: this.onBoardingForm.get('relationshipType').valid,
        errorMessage: 'Please select an option',
      },
    ];
    const validation = validations.find(
      (item) => item.step === this.currentStep
    );
    if (validation) {
      if (validation.condition) {
        this.nextStep();
      } else {
        this.toastService.danger(validation.errorMessage);
      }
    }
  }

  isNextButtonDisabled(): boolean {
    switch (this.currentStep) {
      case 0:
        return !this.onBoardingForm.get('zip').valid && !this.onBoardingForm.get('city').valid;
      case 1:
        return !this.profileImg.file;
      case 2:
        return !this.onBoardingForm.get('isFluShot').valid || !this.onBoardingForm.get('isVaccinated').valid;
      case 3:
        return !this.onBoardingForm.get('haveChild').valid;
      case 4:
        return !this.onBoardingForm.get('education').valid;
      case 5:
        return !this.onBoardingForm.get('ethnicity').valid;
      case 6:
        return !this.onBoardingForm.get('height').valid;
      case 7:
        return !this.onBoardingForm.get('religion').valid;
      case 8:
        return !this.onBoardingForm.get('isSmoke').valid;
      case 9:
        return !this.onBoardingForm.get('relationshipType').valid;
      default:
        return !this.onBoardingForm.valid;
    }
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
    if (this.currentStep === 2 && this.profileImg?.file) {
      this.upload(this.profileImg?.file);
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  submitForm(): void {
    this.userId = this.tokenStorageService.getUser()?.userId;
    this.profileId = this.tokenStorageService.getUser()?.profileId;
    const userName = this.tokenStorageService.getUser()?.userName;
    this.onBoardingForm.get('userId').setValue(this.userId);
    this.onBoardingForm.get('userName').setValue(userName);
    this.customerService
      .updateProfile(this.profileId, this.onBoardingForm.value)
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (!res.error) {
            this.toastService.success(res.message);
            this.sharedService.getUserDetails();
            this.router.navigate([`/home`]);
          } else {
            this.toastService.danger(res?.message);
          }
        },
        error: (error) => {
          console.log(error.error.message);
          this.spinner.hide();
          this.toastService.danger(error.error.message);
        },
      });
  }

  getAllCountries() {
    // this.spinner.show();
    this.customerService.getCountriesData().subscribe({
      next: (result) => {
        this.spinner.hide();
        this.allCountryData = result;
        this.onBoardingForm.get('zip').enable();
        this.onBoardingForm.get('city').enable();
      },
      error: (error) => {
        this.spinner.hide();
        console.log(error);
      },
    });
  }

  onZipChange(event) {
    // this.spinner.show();
    this.customerService
      .getZipData(event, this.onBoardingForm.get('country').value)
      .subscribe(
        (data) => {
          if (data[0]) {
            const zipData = data[0];
            // this.onBoardingForm.get('city').enable();
            this.onBoardingForm.patchValue({
              city: zipData.city,
            });
          } else {
            // this.onBoardingForm.get('city').enable();
            this.toastService.danger(data?.message);
          }
          this.spinner.hide();
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }

  selectFiles(event) {
    this.profileImg = event;
  }

  upload(file: any = {}) {
    this.spinner.show();
    if (file) {
      this.uploadService.uploadFile(file).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res.body) {
            this.profilePic = res?.body?.url;
            this.onBoardingForm.get('imageUrl').setValue(this.profilePic);
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.profileImg = {
            file: null,
            url: '',
          };
          return 'Could not upload the file:' + file.name;
        },
      });
    }
  }

  clearProfileImg(event: any): void {
    event.stopPropagation();
    event.preventDefault();

    this.profileImg = {
      file: null,
      url: '',
    };
  }

  calculateTotalHeight(event: Event) {
    const feet = parseInt(
      (document.getElementById('heightFeet') as HTMLSelectElement).value
    );
    const inches = parseInt(
      (document.getElementById('heightInches') as HTMLSelectElement).value
    );
    const height = feet + ' Feet ' + inches + ' Inches';
    this.onBoardingForm.get('height').setValue(height);
  }

  vaccineStatus(vaccine: string, type: string) {
    if (type === 'covid') {
      this.whatImCovid = vaccine;
      this.onBoardingForm.get('isVaccinated').setValue(this.whatImCovid);
    } else if (type === 'flu') {
      this.whatImFlu = vaccine;
      this.onBoardingForm.get('isFluShot').setValue(this.whatImFlu);
    }
  }

  childStatus(child: string) {
    this.statusofChild = child;
    this.onBoardingForm.get('haveChild').setValue(this.statusofChild);
  }

  generateId(label: string) {
    return label.toLowerCase().replace(/\s+/g, '');
  }

  studyStatus(study: string) {
    this.statusofStudy = study;
    this.onBoardingForm.get('education').setValue(this.statusofStudy);
  }

  ethnicityStatus(ethnicity: string) {
    this.statusofEthnicity = ethnicity;
    this.onBoardingForm.get('ethnicity').setValue(this.statusofEthnicity);
  }

  religionStatus(religion: string) {
    this.statusofReligion = religion;
    this.onBoardingForm.get('religion').setValue(this.statusofReligion);
  }

  smokeStatus(smoke: string) {
    let mappedValue: string;
    if (smoke === 'Yes') {
      mappedValue = 'Y';
    } else if (smoke === 'No') {
      mappedValue = 'N';
    }
    this.statusofSmoke = smoke;
    this.onBoardingForm.get('isSmoke').setValue(mappedValue);
  }

  relationshipOption(option: string) {
    this.selectedRelationOptions = [];
    this.selectedRelationOptions.push(option);
    const selectedValue = this.selectedRelationOptions.join(', ');
    this.onBoardingForm.get('relationshipType').setValue(selectedValue);
  }
}
