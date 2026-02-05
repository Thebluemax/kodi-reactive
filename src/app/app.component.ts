import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    imports: [IonApp, IonRouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
