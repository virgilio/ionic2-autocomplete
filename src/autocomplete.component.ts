import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs';

// searchbar default options
const defaultOpts = {
  cancelButtonText: 'Cancel',
  showCancelButton: false,
  debounce: 250,
  placeholder: 'Search',
  autocomplete: 'off',
  autocorrect: 'off',
  spellcheck: 'off',
  type: 'search',
  value: '',
  noItems: ''
};

@Component({
  template: `
      <ion-searchbar (ionInput)="getItems($event)"
                     (ionBlur)="ionBlur($event)"
                     (ionFocus)="ionFocus($event)"
                     (ionClear)="ionClear($event)"
                     [(ngModel)]="keyword"
                     [cancelButtonText]="options.cancelButtonText == null ? defaultOpts.cancelButtonText : options.cancelButtonText"
                     [showCancelButton]="options.showCancelButton == null ? defaultOpts.showCancelButton : options.showCancelButton"
                     [debounce]="options.debounce == null ? defaultOpts.debounce : options.debounce"
                     [placeholder]="options.placeholder == null ? defaultOpts.placeholder : options.placeholder"
                     [autocomplete]="options.autocomplete == null ? defaultOpts.autocomplete : options.autocomplete"
                     [autocorrect]="options.autocorrect == null ? defaultOpts.autocorrect : options.autocorrect"
                     [spellcheck]="options.spellcheck == null ? defaultOpts.spellcheck : options.spellcheck"
                     [type]="options.type == null ? defaultOpts.type : options.type"
                     [value]="options.value == null ? defaultOpts.value : options.value"
      >
      </ion-searchbar>
      <ul *ngIf="suggestions.length > 0 && showList">
          <li *ngFor="let suggestion of suggestions" (click)="select(suggestion)">
              <ion-auto-complete-item 
                      [data]='suggestion'
                      [keyword]='keyword' 
                      [labelAttribute]='dataProvider.labelAttribute'>
              </ion-auto-complete-item>
          </li>
      </ul>
      <p *ngIf="suggestions.length == 0 && showList && options.noItems">{{ options.noItems }}</p>
  `,
  selector      : 'ion-auto-complete'
})
export class AutoCompleteComponent {

  @Input() public dataProvider: any;
  @Input() public itemComponent: any;
  @Input() public options: any;
  @Input() public keyword: string;
  @Output() public itemSelected: EventEmitter<any>;
  @Output() public ionAutoInput: EventEmitter<string>;
  @Output() public ionAutoBlur: EventEmitter<any>;
  @Output() public ionAutoFocus: EventEmitter<any>;
  @Output() public ionAutoClear: EventEmitter<any>;

  private suggestions:  string[];
  private showList:     boolean;
  private defaultOpts:  any;

  /**
   * create a new instace
   */
  public constructor() {
    this.keyword = null;
    this.suggestions = [];
    this.showList = false;
    this.itemSelected = new EventEmitter<any>();
    this.ionAutoInput = new EventEmitter<string>();
    this.ionAutoBlur = new EventEmitter<any>();
    this.ionAutoFocus = new EventEmitter<any>();
    this.ionAutoClear = new EventEmitter<any>();


    this.options = {};

    // set default options
    this.defaultOpts = defaultOpts;
  }

  /**
   * get items for auto-complete
   */
  public getItems() {
    if (this.keyword.trim() === '') {
      this.suggestions = [];
      return;
    }

    let result = this.dataProvider.getResults(this.keyword);

    // if query is async
    if (result instanceof Observable) {
      result
          .subscribe(
              (results: any) => {
                this.suggestions = results;
                this.showItemList();
              },
              (error: any) =>  console.error(error)
          )
      ;
    } else {
      this.suggestions = result;
      this.showItemList();
    }

    // emit event
    this.ionAutoInput.emit(this.keyword);
  }

  /**
   * emit blur event
   */
  private ionBlur($event: any) {
    this.ionAutoBlur.emit($event);
  }

  /**
   * emit focus event
   */
  private ionFocus($event: any) {
    this.ionAutoFocus.emit($event);
  }

  /**
   * emit clear event
   */
  private ionClear($event: any) {
    this.ionAutoClear.emit($event);
  }

  /**
   * show item list
   */
  private showItemList(): void {
    this.showList = true;
  }

  /**
   * hide item list
   */
  private hideItemList(): void {
    this.showList = false;
  }

  /**
   * select item from list
   * @param item
   */
  public select(selection: any): void {
    this.keyword = selection[this.dataProvider.labelAttribute];
    this.hideItemList();

    // emit selection event
    this.itemSelected.emit(selection);
  }

  /**
   * get current input value
   * @returns {string}
   */
  public getValue() {
    return this.keyword;
  }

  /**
   * clear current input value
   */
  public clearValue() {
    this.keyword = null;
    return;
  }
}