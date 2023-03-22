import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AllowIn, ShortcutInput } from 'ng-keyboard-shortcuts';
import { debounceTime, distinctUntilChanged, filter, fromEvent, last, map, Subject, tap } from 'rxjs';
import { MemoryService } from '../memory.service';
import { Cache } from '../models/cache';
import { Channel } from '../models/channel';
import { ViewMode } from '../models/viewMode';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  channels: Channel[] = [];
  favChannels: Channel[] = [];
  viewMode = ViewMode.All;
  viewModeEnum = ViewMode;
  electron: any = (window as any).electronAPI;
  lastTerm?: string;
  @ViewChild('search') search!: ElementRef;
  @ViewChild('searchFavs') searchFavs!: ElementRef;
  defaultElementsToRetrieve: number = 36;
  elementsToRetrieve: number = this.defaultElementsToRetrieve;
  channelsLeft: number = 0;
  shortcuts: ShortcutInput[] = [];

  constructor(private router: Router, public memory: MemoryService) {
    if (this.memory.Channels.length > 0) {
      this.getChannels();
    }
    else {
      this.electron.getCache().then((x: { cache: Cache, favs: Channel[] }) => {
        if (x.cache?.channels?.length > 0) {
          this.memory.Channels = x.cache.channels;
          this.memory.Url = x.cache.url;
          this.memory.FavChannels = x.favs;
          this.getChannels();
          this.memory.NeedToRefreshFavorites.subscribe(_ => {
            this.favChannels = this.memory.FavChannels;
          });
        }
        else
          router.navigateByUrl("setup");
      });
    }
  }

  loadMore() {
    this.elementsToRetrieve += 36;
    if (this.lastTerm) {
      this.channels = this.filterChannels(this.lastTerm!, this.memory.Channels);
    }
    else
      this.channels = this.memory.Channels.slice(0, this.elementsToRetrieve);
  }

  @HostListener('window:scroll', ['$event'])
  scroll(event: any) {
    if (window.innerHeight + window.scrollY - window.document.documentElement.offsetHeight == 0 && this.channelsLeft > 0) {
      this.loadMore();
    }
  }

  ngAfterViewInit(): void {
    fromEvent(this.search.nativeElement, 'keyup').pipe(
      map((event: any) => {
        return event.target.value;
      })
      , debounceTime(300)
      , distinctUntilChanged()
    ).subscribe((term: string) => {
      this.elementsToRetrieve = this.defaultElementsToRetrieve;
      this.lastTerm = term;
      this.channels = this.filterChannels(term, this.memory.Channels);
    });

    fromEvent(this.searchFavs.nativeElement, 'keyup').pipe(
      map((event: any) => {
        return event.target.value;
      })
      , debounceTime(300)
      , distinctUntilChanged()
    ).subscribe((term: string) => {
      this.favChannels = this.filterChannels(term, this.memory.FavChannels, false);
    });

    this.shortcuts.push(
      {
        key: "ctrl + f",
        label: "Search",
        description: "Go to search",
        preventDefault: true,
        allowIn: [AllowIn.Input],
        command: _ => this.focusSearch()
      },
      {
        key: "ctrl + a",
        label: "Show all channels",
        description: "Selects the all channels mode",
        allowIn: [AllowIn.Input],
        command: _ => this.viewMode = this.viewModeEnum.All
      },
      {
        key: "ctrl + s",
        label: "Show favorites",
        description: "Selects the favorites channels mode",
        allowIn: [AllowIn.Input],
        command: _ => this.viewMode = this.viewModeEnum.Favorites
      },
      {
        key: "ctrl + d",
        label: "Selects the first channel",
        description: "Then you can use tab/shift+tab to select the next/previous channels",
        allowIn: [AllowIn.Input],
        command: _ => (document.getElementById('first')?.firstChild as HTMLElement)?.focus()
      }
    );
  }

  focusSearch() {
    let element = this.viewMode == this.viewModeEnum.All ?
      this.search.nativeElement : this.searchFavs.nativeElement;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    element.focus({
      preventScroll: true
    });
  }

  getChannels() {
    this.channels = this.memory.Channels.slice(0, this.elementsToRetrieve);
    this.channelsLeft = this.memory.Channels.length - this.elementsToRetrieve;
    this.favChannels = this.memory.FavChannels;
  }

  filterChannels(term: string, source: Channel[], useMax = true) {
    let result = source
      .filter(y => y.name.toLowerCase().indexOf(term.toLowerCase()) > -1)
    this.channelsLeft = result.length - this.elementsToRetrieve;
    if (useMax)
      result = result.slice(0, this.elementsToRetrieve);
    return result;
  }

  openSettings() {
    this.router.navigateByUrl("settings");
  }
}
