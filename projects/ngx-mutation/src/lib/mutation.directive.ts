import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { debounceTime, Observable, ReplaySubject, share, Subscription, } from 'rxjs';

export interface NgxMutationOptions {
  config: MutationObserverInit;
  debounce: number;
  emitInZone: boolean;
  emitInitialResult: boolean;
}

export const defaultMutationOptions: NgxMutationOptions = {
  config: {
    attributes: true,
    characterData: true,
    childList: true,
  },
  debounce: 0,
  emitInZone: true,
  emitInitialResult: false,
};

export const NGX_MUTATION_OPTIONS = new InjectionToken<NgxMutationOptions>('NgxMutationOptions', {
  factory: () => defaultMutationOptions,
});

export function provideNgxMutationOptions(options: Partial<NgxMutationOptions> = {}) {
  return { provide: NGX_MUTATION_OPTIONS, useValue: { ...defaultMutationOptions, ...options } };
}

export interface NgxMutationResult {
  readonly mutations: ReadonlyArray<MutationRecord>;
}

@Directive({
  selector: '[ngxMutation]',
  standalone: true
})
export class NgxMutation implements OnInit, OnDestroy {
  @Input() ngxMutationOptions: Partial<NgxMutationOptions> = {};
  @Output() ngxMutation = new EventEmitter<NgxMutationResult>();
  private observer: MutationObserver | null = null;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(NGX_MUTATION_OPTIONS) private readonly mutationOptions: NgxMutationOptions
  ) { }

  private sub?: Subscription;

  ngOnInit() {
    const mergedOptions = { ...this.mutationOptions, ...this.ngxMutationOptions };
    this.sub = createMutationStream(mergedOptions, this.host.nativeElement, this.document, this.zone).subscribe(
      this.ngxMutation
    );
  }
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }


}

// return MutationResult observable
function createMutationStream(
  { config, debounce, emitInZone, emitInitialResult }: NgxMutationOptions,
  nativeElement: HTMLElement,
  document: Document,
  zone: NgZone
) {
  const window = document.defaultView;
  const isSupport = !!window?.MutationObserver;

  let observer: MutationObserver;

  const torndown$ = new ReplaySubject<void>();

  return new Observable<NgxMutationResult>((subscriber) => {
    if (!isSupport) {
      subscriber.error(
        '[ngx-mutation] your browser does not support MutationObserver. Please consider using a polyfill'
      );
      return;
    }

    if (emitInitialResult) {
      const [result] = calculateResult(nativeElement, window, []);
      subscriber.next(result);
    }

    zone.runOutsideAngular(() => {
      const callback = (entries: MutationRecord[]) => {
        const [result, size] = calculateResult(nativeElement, window, entries);

        if (emitInZone) zone.run(() => void subscriber.next(result));
        else subscriber.next(result);


      };


      observer = new MutationObserver(callback);

      observer.observe(nativeElement, config);

    });

    return () => {
      if (observer) {
        observer.disconnect();
      }
      torndown$.next();
      torndown$.complete();
    };
  }).pipe(debounceTime(debounce ?? 0), share({ connector: () => new ReplaySubject(1) }));
}

function calculateResult(
  nativeElement: HTMLElement,
  window: Window,
  entries: MutationRecord[]
): [NgxMutationResult, Omit<DOMRect, 'toJSON'>] {
  const { left, top, width, height, bottom, right, x, y } = nativeElement.getBoundingClientRect();
  const size = { left, top, width, height, bottom, right, x, y };
  Object.freeze(size);
  return [{ mutations: entries, ...size }, size];
}