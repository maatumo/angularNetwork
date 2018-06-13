import {Component} from '@angular/core';
import {AccountHttp, Address, NEMLibrary, NetworkTypes} from 'nem-library';

NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);


const accountHttp: AccountHttp = new AccountHttp();
const address: Address = new Address('NDLHY5-KMQTAT-AR7IBR-BF32MA-QWDK73-33VNI2-MD5W');

accountHttp.getFromAddress(address)
  .subscribe(accountInfoWithMetaData => {
    console.log('getFromAddress', accountInfoWithMetaData);
  });

accountHttp.allTransactions(address, undefined)
  .subscribe(transaction => {
    console.log('allTransactions', transaction);
  });

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'NEM NETWORK NEON';
  walletId: String;
  submittedId: String;

  onSubmitClick() {
    this.submittedId = this.walletId;
  }
}

