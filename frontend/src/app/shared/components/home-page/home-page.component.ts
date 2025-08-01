import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit, OnDestroy {
  headlines: string[] = [
    'Delayed? Cancelled? Get the compensation you deserve!',
    'Turn your flight problems into cash.',
    'Don’t let airlines get away with it, claim your rights!',
    'Was your flight delayed more than 3 hours?'
  ];

  currentHeadlineIndex = 0;
  currentHeadline = this.headlines[0];
  private intervalId: any;

  ngOnInit(): void {
    // Change headline every 5 minutes (300000 ms)
    this.intervalId = setInterval(() => {
      this.currentHeadlineIndex =
        (this.currentHeadlineIndex + 1) % this.headlines.length;
      this.currentHeadline = this.headlines[this.currentHeadlineIndex];
    }, 300000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
