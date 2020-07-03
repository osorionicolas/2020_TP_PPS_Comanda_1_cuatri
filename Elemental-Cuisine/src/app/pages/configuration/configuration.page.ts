import { Component, OnInit } from '@angular/core';
import { SmartAudioService } from 'src/app/services/smart-audio.service';
import { DataService } from 'src/app/services/data.service';
import { Collections } from 'src/app/classes/enums/collections';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.page.html',
  styleUrls: ['./configuration.page.scss'],
})
export class ConfigurationPage implements OnInit {

  private isSoundActive:boolean = true;
  private maitreSelectTable: boolean;

  constructor(
    private smartAudioService: SmartAudioService,
    private dataService: DataService
  ) { 
    this.dataService.getChanges(Collections.Configurations, "configuracion").subscribe((configs: any) => this.maitreSelectTable = configs.seleccionDeMesaPorMaitre)
  }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.isSoundActive = this.smartAudioService.active;
  }

  activateSounds(){
    this.smartAudioService.activateSounds(this.isSoundActive);
  }

  tableHandler(){
    if(!isNullOrUndefined(this.maitreSelectTable))
      this.dataService.setData(Collections.Configurations, { seleccionDeMesaPorMaitre: this.maitreSelectTable} , "configuracion");
  }

}
