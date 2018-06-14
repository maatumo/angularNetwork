import {Component} from '@angular/core';
import {AccountHttp, Address, NEMLibrary, NetworkTypes, TransferTransaction, Transaction} from 'nem-library';
import APP_CONFIG from './app.config';
import {Node, Link} from './d3';

NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  nodes: Node[] = [];
  links: Link[] = [];
  title = 'NEM NETWORK NEON';
  walletId: string = 'NBZNQL2JDWTGUAW237PXV4SSXSPORY43GUSWGSB7';
  submittedId: string;
  outputs: string = 'start';
  TxTotalfromSelf = {};
  RxTotalfromSelf = {};
  transactionEdges = [[], [], []];
  friends = [];
  loopFlag = true;

  constructor() {

    //TODO Background color ->  white

    const N = APP_CONFIG.N;
    // getIndex = number => number - 1;

    // const nameIndex = ['らら', 'くま', 'おつ', 'まつ', 'もと', 'しん', 'ゆ'];

    /** constructing the nodes array */
    for (let i = 1; i <= N; i++) {
      this.nodes.push(new Node(i, 'ほにゃ'));
    }

    for (let i = 1; i <= N; i++) {
      for (let m = 2; i * m <= N; m++) {
        /** increasing connections toll on connecting nodes */
        // this.nodes[getIndex(i)].linkCount++;
        // this.nodes[getIndex(i * m)].linkCount++;

        /** connecting the nodes before starting the simulation */
        this.links.push(new Link(i, i * m));
      }
    }
  }


  onSubmitClick() {
    document.getElementById('network_graph').style.display = 'block';
    document.getElementById('initial_form').style.display = 'none';

    this.submittedId = this.walletId;
    const accountHttp: AccountHttp = new AccountHttp();
    const address: Address = new Address(this.submittedId);
    accountHttp.getFromAddress(address)
      .subscribe(accountInfoWithMetaData => {
        console.log('getFromAddress', accountInfoWithMetaData);
        // this.outputs = this.outputs + JSON.stringify(accountInfoWithMetaData);
      });
    accountHttp.allTransactions(address, undefined)
      .subscribe(transaction => {
        console.log('allTransactions', transaction);
        // this.outputs = this.outputs + JSON.stringify(transaction);
      });
    this.getFriendRelation(this.submittedId);
  }

  getFriendRelation(centralAdressString) {
    const accountHttp: AccountHttp = new AccountHttp();
    const centerAddress: Address = new Address(centralAdressString);
    const pagedTransactions = accountHttp.allTransactionsPaginated(centerAddress, undefined);
    pagedTransactions.subscribe(x => {
      x.forEach(function (value) {

        //TransferTransactionのみを対象
        if (value.recipient && value.constructor === TransferTransaction) {
          console.log(value.signer.address.value);
          console.log(value.recipient.value);
          console.log(value._xem.amount);
        }

      });
      // pagedTransactions.nextPage();
    }, err => {
      console.log(err);
    }, () => {
      console.log('complete');
      console.log(this.TxTotalfromSelf);
      console.log(this.RxTotalfromSelf);
      console.log(this.transactionEdges);
      console.log(this.friends);

      if (this.loopFlag) {
        this.loopFlag = false;
        for (let i = 0; i < this.friends.length; i++) {
          this.getFriendRelation(this.friends[i]);
        }
      }
    });

  }


}

