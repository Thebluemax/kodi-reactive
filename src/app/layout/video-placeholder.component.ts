import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-video-placeholder',
  template: `
    <ion-content class="ion-padding">
      <ion-text color="medium">
        <h2>Video</h2>
        <p>Coming soon.</p>
      </ion-text>
    </ion-content>
  `,
  imports: [IonicModule],
})
export class VideoPlaceholderComponent {}
