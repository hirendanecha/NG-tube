import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Howl } from 'howler';
import { SocketService } from '../../services/socket.service';
import { EncryptDecryptService } from '../../services/encrypt-decrypt.service';

import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SoundControlService } from '../../services/sound-control.service';
import { CustomerService } from '../../services/customer.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-incoming-call-modal',
  templateUrl: './incoming-call-modal.component.html',
  styleUrls: ['./incoming-call-modal.component.scss'],
})
export class IncomingcallModalComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() cancelButtonLabel: string = 'Hangup';
  @Input() confirmButtonLabel: string = 'Join';
  @Input() title: string = 'Incoming call...';
  @Input() calldata: any;
  @Input() sound: any;
  hangUpTimeout: any;
  currentURL: any = [];
  profileId: number;
  isOnCall = false;
  soundEnabledSubscription: Subscription;

  constructor(
    public activateModal: NgbActiveModal,
    private socketService: SocketService,
    public encryptDecryptService: EncryptDecryptService,
    private soundControlService: SoundControlService,
    private router: Router,
    private modalService: NgbModal,
    private customerService: CustomerService,
    private sharedService: SharedService
  ) {
    this.profileId = +localStorage.getItem('profileId');
    this.isOnCall = this.router.url.includes('/dating-call/') || false;
  }

  ngAfterViewInit(): void {
    this.soundControlService.initStorageListener();
    // this.sound?.close();
    this.soundEnabledSubscription =
      this.soundControlService.soundEnabled$.subscribe((soundEnabled) => {
        if (soundEnabled === false) {
          // console.log(soundEnabled);
          this.sound?.stop();
        }
      });
    // const SoundOct = JSON.parse(
    //   localStorage.getItem('soundPreferences')
    // )?.callSoundEnabled;
    // if (SoundOct !== 'N') {
    //   if (this.sound) {
    //     this.sound?.play();
    //   }
    // }
    this.sharedService.loginUserInfo.subscribe((user) => {
      const callNotificationSound = user.callNotificationSound;
      if (callNotificationSound === 'Y') {
        if (this.sound) {
          this.sound?.play();
        }
      }
    });
    if (!this.hangUpTimeout) {
      this.hangUpTimeout = setTimeout(() => {
        this.hangUpCall(false, '');
      }, 60000);
    }
    this.socketService.socket?.on('notification', (data: any) => {
      if (data?.actionType === 'DC') {
        this.sound.stop();
        this.activateModal.close('cancel');
      }
    });
  }

  ngOnInit(): void {
    this.socketService.socket?.on('notification', (data: any) => {
      if (data?.actionType === 'SC') {
        this.sound?.stop();
        this.modalService.dismissAll();
        clearTimeout(this.hangUpTimeout);
      }
    });
  }
  pickUpCall(): void {
    this.sound?.stop();
    clearTimeout(this.hangUpTimeout);
    if (!this.currentURL.includes(this.calldata?.link)) {
      this.currentURL.push(this.calldata.link);
      // window.open(this.calldata.link, '_blank');

      // console.log('incomin', this.calldata.link);
      // this.router.navigate([`/appointment-call/${this.calldata.link}`]);
      let chatDataPass = {
        roomId: this.calldata.roomId || null,
        groupId: this.calldata.groupId || null,
      };
      if (this.calldata?.roomId) {
        localStorage.setItem('callRoomId', this.calldata?.roomId);
      }
      if (this.isOnCall) {
        // const url = window.location.href;
        const parts = window.location.href.split('/');
        const callId = parts[parts.length - 1];
        this.calldata.link = callId;
        this.router.navigate([`/dating-call/${callId}`], {
          state: { chatDataPass },
        });
      } else {
        const callId = this.calldata.link.replace(
          'https://meet.facetime.tube/',
          ''
        );
        this.router.navigate([`/dating-call/${callId}`], {
          state: { chatDataPass },
        });
      }
      // this.router.navigate([`/dating-call/${callId}`]);
      this.sound?.stop();
    }
    this.activateModal.close('success');

    const data = {
      notificationToProfileId:
        this.calldata.notificationByProfileId || this.profileId,
      roomId: this.calldata?.roomId,
      groupId: this.calldata?.groupId,
      notificationByProfileId:
        this.calldata.notificationToProfileId || this.profileId,
      link: this.calldata.link,
    };

    const buzzRingData = {
      actionType: 'DC',
      notificationByProfileId: this.profileId,
      notificationDesc: 'decline call...',
      notificationToProfileId: this.calldata.notificationToProfileId,
      domain: 'nudegirls.tube',
    };
    this.customerService.startCallToBuzzRing(buzzRingData).subscribe({
      // next: (data: any) => {},
      error: (err) => {
        console.log(err);
      },
    });

    this.socketService?.pickUpCall(data, (data: any) => {
      return;
    });
  }

  hangUpCall(isCallCut, messageText): void {
    this.sound?.stop();
    clearTimeout(this.hangUpTimeout);
    const data = {
      notificationToProfileId:
        this.calldata.notificationByProfileId || this.profileId,
      roomId: this.calldata?.roomId,
      groupId: this.calldata?.groupId,
      notificationByProfileId:
        this.calldata.notificationToProfileId || this.profileId,
    };
    this.socketService?.hangUpCall(data, (data: any) => {
      if (isCallCut && messageText) {
        // const message = `Call declined`;
        this.sendMessage(messageText);
      } else {
        // const message = `You have a missed call.`;
        // this.sendMessage(message);
      }
      this.activateModal.close('cancel');
    });
  }

  sendMessage(message: string) {
    // const message = this.encryptDecryptService?.encryptUsingAES256(`I'll call you back.`);
    const data = {
      messageText: this.encryptDecryptService?.encryptUsingAES256(message),
      roomId: this.calldata?.roomId || null,
      groupId: this.calldata?.groupId || null,
      sentBy: this.calldata.notificationToProfileId || this.profileId,
      profileId: this.calldata.notificationByProfileId || this.profileId,
    };
    if (!window.document.hidden) {
      this.socketService.sendMessage(data, async (data: any) => {});
    }
  }

  ngOnDestroy(): void {
    this.soundEnabledSubscription.unsubscribe();
  }
}
