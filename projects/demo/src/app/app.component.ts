import { AfterViewInit, Component } from '@angular/core';
import { NgxMutationResult } from 'projects/ngx-mutation/src/public-api';

interface Paragraph {
  id: number;
  text: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'demo';

  result: NgxMutationResult | null = null;

  onMutation(event: NgxMutationResult) {
    this.result = event;
    console.log(event);
  }

  paragraphs: Paragraph[] = [];

  ngAfterViewInit() {
    this.random();
  }

  addParagraph() {
    this.paragraphs.push({ id: this.paragraphs.length + 1, text: 'Hello <strong>World</strong>!' });
  }
  reset() {
    this.paragraphs = [];
  }
  random() {
    let paragraphs = [...this.paragraphs];

    // remove random number of paragraphs on random index
    for (let i = 0; i < Math.min((Math.random() * 10), Math.max(paragraphs.length)); i++) {
      const index = Math.floor(Math.random() * paragraphs.length);
      paragraphs.splice(index, 1);
    }
    // add random number of paragraphs
    for (let i = 0; i < (Math.random() * 10); i++) {
      paragraphs.push({ id: i, text: 'Hello <strong>World</strong>!' });

    }
    this.paragraphs = [...paragraphs];
  }
}
