# NGX Mutation

A service that emits changes being made to the DOM tree utilizing [Mutation Observer](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

## Installation

```shell
npm install ngx-mutation
```

## Usage

There are two approaches of using `ngx-mutation`. Both approaches results an `Observable<NgxMutationResult>`

```ts
export interface NgxMutationResult {
  readonly mutation: ReadonlyArray<MutationRecord>;
}
```

### `injectNgxMutation()`

If you're on Angular 14+ and are using `inject()` for **Dependency Injection**, you can use `injectNgxMutation()` to grab the `Observable<NgxMutationResult>`

```ts
@Component({})
export class SomeComponent {
  readonly mutationResult$ = injectNgxMutation(); // Observable<NgxMutationResult>
}
```

`injectNgxMutation()` accepts a `Partial<NgxMutationOptions>` and will be merged with the default global options.

```ts
export interface NgxMutationOptions {
  /* "config" options that is passed in new MutationObserver */
  config: MutationObserverInit;
  /* time in ms to debounce the events; */
  debounce: number;
  /* emit in NgZone or not. Default to "true" */
  emitInZone: boolean;
  /* emit the initial DOMRect of nativeElement. Default to "false" */
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
```

#### With `Output`

Instead of getting the `Observable<NgxMutationResult>`, you can assign `injectNgxMutation()` to an `Output` directly

```ts
@Component({})
export class SomeComponent {
  @Output() mutate = injectNgxMutation(); // mutate emits everytime NgxMutation emits
}
```

```html
<some-component (ngxMutation)="onMutate($event)"></some-component>
<!-- $event is of type NgxMutationResult -->
```

### `NgxMutation`

If you're not using `inject()`, you can use the `NgxMutation` directive

```html
<some-component (ngxMutation)="onMutate($event)"></some-component>
<some-component
  (ngxMutation)="onMutate($event)"
  [ngxMutationOptions]="optionalOptions"
></some-component>
```

#### With `hostDirectives`

With Angular 15, you can also use `NgxMutation` as a `hostDirectives` and expose `ngxMutation` Output

```ts
@Component({
  hostDirectives: [{ directive: NgxMutation, outputs: ["ngxMutation"] }],
})
export class SomeComponent {
  @HostListener("ngxMutation", ["$event"])
  onMutate(event: NgxMutationResult) {
    // listen for mutation event from NgxMutation
  }
}
```

## Provide global `NgxMutationOptions`

You can use `provideNgxMutationOptions()` to provide global options for a specific Component tree. If you call `provideNgxMutationOptions()` in `bootstrapApplication()` (for Standalone) and `AppModule` (for NgModule)
then the options is truly global.

## Contributions

All contributions of any kind are welcome.

## Thanks

This directive is heavily inspired on the `ngx-resize` directive by [Chau Tran](https://twitter.com/Nartc1410). https://github.com/nartc/ngx-resize
