import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-video-placeholder-section',
  template: `
    <ion-content class="ion-padding">
      <ion-text color="medium">
        <h2>{{ title() }}</h2>
        <p>Coming soon.</p>
      </ion-text>
    </ion-content>
  `,
  imports: [IonicModule],
})
export class VideoPlaceholderSectionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  title = signal('Video');

  ngOnInit(): void {
    this.title.set(this.route.snapshot.data['title'] ?? 'Video');
  }
}
